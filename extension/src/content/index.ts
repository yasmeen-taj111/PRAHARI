/**
 * PRAHARI Content Script Entrypoint
 * Standalone bundle with zero external chunk dependencies for Manifest V3 compatibility.
 */

import { extractInteractiveDOM } from './dom_extractor';
import { executeAgentAction } from './action_executor';
import { detectFacesInDocument } from '../vision/face_detector';
import type { RedactionSettings } from '../../../shared/types';

const FALLBACK_SETTINGS: RedactionSettings = {
  redactPasswords: true,
  redactCreditCards: true,
  redactAadhaar: true,
  redactPan: true,
  redactEmails: true,
  redactPhones: true,
  redactOtps: true,
  redactFaces: true,
  preferredBackend: 'auto',
  requireConfirmForRiskyActions: true,
};

// Listen for commands from the background service worker or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ pong: true });
    return false;
  }

  if (message.type === 'EXTRACT_DOM_SNAPSHOT') {
    const settings: RedactionSettings = message.settings || FALLBACK_SETTINGS;
    
    // 1. Extract interactive DOM nodes & PII bounding boxes
    const domResult = extractInteractiveDOM(settings);

    // 2. Scan for faces if enabled
    detectFacesInDocument(document).then((faces) => {
      if (settings.redactFaces) {
        faces.forEach((face, idx) => {
          domResult.redactionBoxes.push({
            id: `face-box-${idx + 1}`,
            category: 'face',
            method: 'pixelate',
            bbox: face.bbox,
            confidence: face.confidence,
            source: 'vision_detector',
          });
        });
      }

      sendResponse({
        success: true,
        nodes: domResult.nodes,
        redactionBoxes: domResult.redactionBoxes,
        extractionTimeMs: domResult.extractionTimeMs,
        viewport: domResult.viewport,
        pageTitle: document.title,
        url: window.location.href,
      });
    }).catch(() => {
      sendResponse({
        success: true,
        nodes: domResult.nodes,
        redactionBoxes: domResult.redactionBoxes,
        extractionTimeMs: domResult.extractionTimeMs,
        viewport: domResult.viewport,
        pageTitle: document.title,
        url: window.location.href,
      });
    });

    return true; // Keep channel open for async response
  }

  if (message.type === 'EXECUTE_ACTION') {
    const action = message.action;
    const settings = message.settings || FALLBACK_SETTINGS;

    executeAgentAction(action, settings).then((result) => {
      sendResponse(result);
    });

    return true;
  }
});
