import {
  SanitizedPayload,
  AgentActionPlanResponse,
  DEFAULT_REDACTION_SETTINGS,
  RedactionSettings,
  ClientTelemetry,
  RedactionBox,
  DOMNodeSnapshot,
  ViewportSnapshot,
} from '../../../shared/types';
import { redactScreenshot } from '../vision/redactor';
import { visionEngine } from '../vision/engine';

const SERVER_HOSTS = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://0.0.0.0:8000'];
let activeServerUrl = SERVER_HOSTS[0];

// Initialize vision engine on background startup
visionEngine.init();

export interface ServerTelemetryState {
  modelUsed: string;
  serverReasoningTimeMs: number;
  networkRoundtripMs: number;
  serverConnected: boolean;
  lastAction?: any;
  lastError?: string;
}

interface AgentSessionState {
  taskId: string;
  userTask: string;
  currentStep: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  lastTelemetry?: ClientTelemetry;
  lastSanitizedImage?: string;
  lastRedactionBoxes?: RedactionBox[];
  lastDOMTree?: DOMNodeSnapshot[];
  viewport?: ViewportSnapshot;
  lastAction?: any;
  serverState: ServerTelemetryState;
  auditLog: Array<{
    timestamp: string;
    type: string;
    details: string;
    category?: string;
  }>;
}

let sessionState: AgentSessionState = {
  taskId: `prahari-task-${Date.now()}`,
  userTask: '',
  currentStep: 0,
  status: 'idle',
  serverState: {
    modelUsed: 'Checking...',
    serverReasoningTimeMs: 0,
    networkRoundtripMs: 0,
    serverConnected: false,
  },
  auditLog: [],
};

/**
 * Actively pings the PRAHARI server /health endpoint to maintain live connection status.
 */
async function checkServerHealth(): Promise<boolean> {
  for (const host of SERVER_HOSTS) {
    try {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${host}/api/v1/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rtt = Math.round(performance.now() - start);
        activeServerUrl = host;
        sessionState.serverState.serverConnected = true;
        if (data.model) {
          sessionState.serverState.modelUsed = data.model;
        } else if (sessionState.serverState.modelUsed === 'Checking...' || sessionState.serverState.modelUsed === 'None' || sessionState.serverState.modelUsed === 'Not Connected') {
          sessionState.serverState.modelUsed = 'Connected';
        }
        if (!sessionState.serverState.networkRoundtripMs || sessionState.serverState.networkRoundtripMs === 0) {
          sessionState.serverState.networkRoundtripMs = rtt;
        }
        sessionState.serverState.lastError = undefined;
        return true;
      }
    } catch (e) {
      // Continue to next host candidate
    }
  }
  sessionState.serverState.serverConnected = false;
  if (sessionState.serverState.modelUsed === 'Checking...') {
    sessionState.serverState.modelUsed = 'Not Connected';
  }
  return false;
}

// Start periodic heartbeat
checkServerHealth();
setInterval(checkServerHealth, 5000);

let lastCaptureTime = 0;

/**
 * Loads current user settings from local storage.
 */
async function getSettings(): Promise<RedactionSettings> {
  try {
    const result = await chrome.storage.local.get('prahari_settings');
    return result.prahari_settings || DEFAULT_REDACTION_SETTINGS;
  } catch (e) {
    return DEFAULT_REDACTION_SETTINGS;
  }
}

/**
 * Ensures the content script is active in the target tab, injecting dynamically if needed.
 */
async function ensureContentScriptInjected(tabId: number): Promise<boolean> {
  try {
    const ping = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (ping && ping.pong) return true;
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/index.js'],
      });
      await new Promise((r) => setTimeout(r, 100));
      return true;
    } catch (injectErr: any) {
      console.warn('[PRAHARI] Content script injection note:', injectErr.message);
      return false;
    }
  }
  return true;
}

/**
 * Throttled Tab Screen Capture
 */
async function safeCaptureVisibleTab(): Promise<string> {
  const now = Date.now();
  const timeSinceLast = now - lastCaptureTime;
  if (timeSinceLast < 600) {
    await new Promise((r) => setTimeout(r, 600 - timeSinceLast));
  }
  lastCaptureTime = Date.now();
  return await chrome.tabs.captureVisibleTab(undefined, { format: 'png' });
}

/**
 * Core Orchestrator: Captures tab, extracts DOM, applies on-device vision/PII redaction,
 * verifies Zero-Trust security guarantee, and dispatches sanitized payload to reasoning server.
 */
async function processAgentStep(userTask: string, tabId: number): Promise<{ success: boolean; data?: any; error?: string }> {
  const stepStartTime = performance.now();
  const settings = await getSettings();

  try {
    sessionState.status = 'running';
    sessionState.userTask = userTask;
    sessionState.currentStep++;

    // 1. Ensure content script is ready
    await ensureContentScriptInjected(tabId);

    // 2. Capture Visible Tab (Screen pixels)
    const rawDataUrl = await safeCaptureVisibleTab();
    if (!rawDataUrl) {
      throw new Error('Unable to capture visible tab viewport');
    }

    // 3. Request DOM snapshot and detected PII from Content Script
    let domResponse: any;
    try {
      domResponse = await chrome.tabs.sendMessage(tabId, {
        type: 'EXTRACT_DOM_SNAPSHOT',
        settings,
      });
    } catch (e) {
      await ensureContentScriptInjected(tabId);
      domResponse = await chrome.tabs.sendMessage(tabId, {
        type: 'EXTRACT_DOM_SNAPSHOT',
        settings,
      });
    }

    if (!domResponse || !domResponse.success) {
      throw new Error('Content script failed to extract DOM context');
    }

    const { nodes, redactionBoxes, extractionTimeMs, pageTitle, url, viewport } = domResponse;

    // 4. Convert raw screen dataUrl into ImageBitmap in background service worker
    const imgBlob = await (await fetch(rawDataUrl)).blob();
    const imageBitmap = await createImageBitmap(imgBlob);

    // 5. Run On-Device Redaction & ZERO-TRUST Verification with Viewport Scaling
    const visionStartTime = performance.now();
    const redactionResult = await redactScreenshot(imageBitmap, redactionBoxes, viewport);
    const visionInferenceTimeMs = Math.round(performance.now() - visionStartTime);

    // 6. Build Client Telemetry
    const totalClientTimeMs = Math.round(performance.now() - stepStartTime);
    const telemetry: ClientTelemetry = {
      domExtractionTimeMs: extractionTimeMs || 10,
      visionInferenceTimeMs,
      redactionTimeMs: redactionResult.redactionTimeMs,
      totalClientTimeMs,
      backendUsed: visionEngine.getActiveBackend(),
      redactedElementCount: redactionBoxes.length,
      timestamp: new Date().toISOString(),
    };

    // 7. Assemble Sanitized Payload
    // ZERO-TRUST GUARANTEE: The raw image 'rawDataUrl' is NEVER passed into the payload
    const payload: SanitizedPayload = {
      version: '1.0.0',
      tabUrl: url || 'active_page',
      pageTitle: pageTitle || 'Browser Tab',
      sanitizedImageBase64: redactionResult.sanitizedBase64,
      isZeroTrustVerified: redactionResult.isZeroTrustVerified,
      redactionBoxes: redactionBoxes,
      domTree: nodes,
      userTask,
      telemetry,
      viewport,
    };

    // Log to session state
    sessionState.lastTelemetry = telemetry;
    sessionState.lastSanitizedImage = redactionResult.sanitizedBase64;
    sessionState.lastRedactionBoxes = redactionBoxes;
    sessionState.lastDOMTree = nodes;
    sessionState.viewport = viewport;

    // Record audit entries for newly redacted items
    redactionBoxes.forEach((box: RedactionBox) => {
      sessionState.auditLog.unshift({
        timestamp: new Date().toLocaleTimeString(),
        type: 'REDACTION',
        details: `Shielded ${box.category.toUpperCase()} (${box.source}) at [${box.bbox.x}, ${box.bbox.y}]`,
        category: box.category,
      });
    });

    const payloadKb = Math.round(redactionResult.sanitizedBase64.length / 1024);
    sessionState.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: 'NETWORK_DISPATCH',
      details: `Dispatched sanitized payload (${payloadKb} KB, ${nodes.length} DOM nodes) to ${activeServerUrl}/api/v1/act`,
    });

    // 8. Dispatch Sanitized Payload to Reasoning Server (with automatic multi-host fallback)
    const netStart = performance.now();
    let actionPlan: AgentActionPlanResponse | null = null;
    let networkRoundtripMs = 0;
    let lastFetchError: string = '';

    const hostsToTry = [activeServerUrl, ...SERVER_HOSTS.filter(h => h !== activeServerUrl)];

    for (const host of hostsToTry) {
      try {
        const response = await fetch(`${host}/api/v1/act`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        networkRoundtripMs = Math.round(performance.now() - netStart);

        if (!response.ok) {
          const errorJson = await response.json().catch(() => null);
          const detailMsg = errorJson?.detail || (await response.text());
          throw new Error(`Server Error (${response.status}): ${detailMsg}`);
        }

        actionPlan = await response.json();
        activeServerUrl = host;
        break; // Successfully received action plan
      } catch (err: any) {
        lastFetchError = err.message;
      }
    }

    if (!actionPlan) {
      sessionState.serverState.serverConnected = false;
      sessionState.serverState.lastError = lastFetchError;
      throw new Error(`Reasoning Server Failed: ${lastFetchError}`);
    }

    // 9. Update server telemetry state
    sessionState.serverState = {
      modelUsed: actionPlan.modelUsed,
      serverReasoningTimeMs: actionPlan.serverReasoningTimeMs,
      networkRoundtripMs,
      serverConnected: true,
      lastAction: actionPlan.action,
      lastError: undefined,
    };
    sessionState.lastAction = actionPlan.action;

    // Record agent reasoning log
    sessionState.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: 'AGENT_ACTION',
      details: `VLM (${actionPlan.modelUsed}, ${actionPlan.serverReasoningTimeMs}ms) -> ${actionPlan.action.action.toUpperCase()} ${actionPlan.action.selector || ''} - "${actionPlan.action.thought || ''}"`,
    });

    // 10. Send action to Content Script to execute on page
    let execResult: any = { success: true };
    try {
      execResult = await chrome.tabs.sendMessage(tabId, {
        type: 'EXECUTE_ACTION',
        action: actionPlan.action,
        settings,
      });
    } catch (e) {
      console.warn('[PRAHARI] Content script action exec note:', e);
    }

    if (actionPlan.action.action === 'done') {
      sessionState.status = 'completed';
    }

    return {
      success: true,
      data: {
        actionPlan,
        execResult,
        telemetry,
        serverState: sessionState.serverState,
      },
    };
  } catch (err: any) {
    sessionState.status = 'error';
    sessionState.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString(),
      type: 'ERROR',
      details: err.message,
    });
    return { success: false, error: err.message };
  }
}

// Background Message Listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SESSION_STATE') {
    sendResponse({
      success: true,
      state: sessionState,
      backendStatus: visionEngine.getStatus(),
    });
    checkServerHealth();
    return false;
  }

  if (message.type === 'TRIGGER_AGENT_STEP') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!tab || !tab.id) {
        sendResponse({ success: false, error: 'No active browser tab found' });
        return;
      }
      processAgentStep(message.userTask, tab.id).then(sendResponse);
    });
    return true;
  }

  if (message.type === 'RESET_SESSION') {
    sessionState = {
      taskId: `prahari-task-${Date.now()}`,
      userTask: '',
      currentStep: 0,
      status: 'idle',
      serverState: {
        modelUsed: sessionState.serverState.serverConnected ? sessionState.serverState.modelUsed : 'None',
        serverReasoningTimeMs: 0,
        networkRoundtripMs: 0,
        serverConnected: sessionState.serverState.serverConnected,
      },
      auditLog: [],
    };
    sendResponse({ success: true, state: sessionState });
    return true;
  }
});
