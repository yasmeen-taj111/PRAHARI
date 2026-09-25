import React, { useState, useEffect } from 'react';
import { RedactionHero } from './components/RedactionHero';
import { BackendStatus } from './components/BackendStatus';
import { ServerReasoningCard } from './components/ServerReasoningCard';
import { PrivacyAuditLog } from './components/PrivacyAuditLog';
import { RedactionConfig } from './components/RedactionConfig';
import {
  DEFAULT_REDACTION_SETTINGS,
  RedactionSettings,
  ClientTelemetry,
  RedactionBox,
} from '../../../shared/types';
import { Shield, Play, RotateCcw, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [userTask, setUserTask] = useState('Fill registration form while shielding all PII and passwords');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionState, setSessionState] = useState<any>(null);
  const [settings, setSettings] = useState<RedactionSettings>(DEFAULT_REDACTION_SETTINGS);
  const [showConfig, setShowConfig] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Poll / fetch session state on mount
  useEffect(() => {
    fetchSessionState();
    pingServerDirectly();
    const interval = setInterval(() => {
      fetchSessionState();
      pingServerDirectly();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const pingServerDirectly = async () => {
    const hosts = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://0.0.0.0:8000'];
    for (const host of hosts) {
      try {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const res = await fetch(`${host}/api/v1/health`, {
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const rtt = Math.round(performance.now() - start);
          setSessionState((prev: any) => ({
            ...prev,
            serverState: {
              ...(prev?.serverState || {}),
              serverConnected: true,
              modelUsed: data.model || prev?.serverState?.modelUsed || 'Connected',
              networkRoundtripMs: prev?.serverState?.networkRoundtripMs || rtt,
            },
          }));
          return;
        }
      } catch (e) {
        // try next
      }
    }
  };

  const fetchSessionState = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_SESSION_STATE' }, (response) => {
        if (response && response.success) {
          setSessionState((prev: any) => {
            const newState = response.state;
            if (prev?.serverState?.serverConnected && !newState?.serverState?.serverConnected) {
              newState.serverState = prev.serverState;
            }
            return newState;
          });
        }
      });
    }
  };

  const handleTriggerAgent = () => {
    if (!userTask.trim()) return;
    setIsRunning(true);
    setStatusMessage('Perceiving viewport & querying VLM...');

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'TRIGGER_AGENT_STEP', userTask }, (response) => {
        setIsRunning(false);
        if (response && response.success) {
          const actionName = response.data?.actionPlan?.action?.action || 'Done';
          const model = response.data?.actionPlan?.modelUsed || 'Server';
          setStatusMessage(`Action: ${actionName.toUpperCase()} via ${model}`);
          fetchSessionState();
        } else {
          setStatusMessage(`Error: ${response?.error || 'Execution failed'}`);
          fetchSessionState();
        }
      });
    } else {
      setTimeout(() => {
        setIsRunning(false);
        setStatusMessage('Dev simulation mode');
      }, 800);
    }
  };

  const handleReset = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'RESET_SESSION' }, () => {
        fetchSessionState();
        setStatusMessage('Session reset');
      });
    }
  };

  const handleUpdateSettings = (newSettings: RedactionSettings) => {
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ prahari_settings: newSettings });
    }
  };

  const redactionBoxes: RedactionBox[] = sessionState?.lastRedactionBoxes || [];
  const telemetry: ClientTelemetry | undefined = sessionState?.lastTelemetry;
  const isZeroTrustVerified = sessionState ? !!sessionState.lastSanitizedImage : true;

  return (
    <div style={{ paddingBottom: '16px' }}>
      {/* Top Sentinel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#0B0F17', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', borderRadius: '6px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="#F59E0B" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.04em', color: '#F8FAFC' }}>
                PRAHARI
              </span>
              <span style={{ fontSize: '9px', background: '#1E293B', color: '#06B6D4', padding: '1px 5px', borderRadius: '3px', fontWeight: '700' }}>
                v1.0.0
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>ISRO #26171 On-Device Visual Shield</div>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Reset Session"
          style={{ background: 'transparent', border: '1px solid #1E293B', color: '#64748B', borderRadius: '6px', padding: '5px', cursor: 'pointer' }}
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Task Command Bar */}
      <div style={{ padding: '10px 14px 0 14px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={userTask}
            onChange={(e) => setUserTask(e.target.value)}
            placeholder="Instruct PRAHARI agent..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              padding: '9px 70px 9px 10px',
              color: '#F8FAFC',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleTriggerAgent}
            disabled={isRunning}
            style={{
              position: 'absolute',
              right: '4px',
              top: '4px',
              bottom: '4px',
              background: isRunning ? '#64748B' : '#F59E0B',
              color: '#090D16',
              border: 'none',
              borderRadius: '6px',
              padding: '0 12px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: isRunning ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Play size={11} fill="#090D16" />
            <span>{isRunning ? '...' : 'Act'}</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div style={{ margin: '6px 14px 0 14px', fontSize: '10px', color: statusMessage.startsWith('Error') ? '#EF4444' : '#06B6D4', fontWeight: '600' }}>
          {statusMessage}
        </div>
      )}

      {/* Live Redaction Hero View */}
      <RedactionHero
        sanitizedImageBase64={sessionState?.lastSanitizedImage}
        redactionBoxes={redactionBoxes}
        isZeroTrustVerified={isZeroTrustVerified}
        viewport={sessionState?.viewport}
        pageTitle={sessionState?.lastDOMTree ? `${sessionState.lastDOMTree.length} DOM Nodes Tracked` : undefined}
      />

      {/* Server Reasoning Panel */}
      <ServerReasoningCard serverState={sessionState?.serverState} />

      {/* Client Telemetry Gauges */}
      <BackendStatus telemetry={telemetry} backend={telemetry?.backendUsed || 'webgpu'} />

      {/* Accordion Toggle for Shield Policies */}
      <div style={{ margin: '8px 14px 0 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontSize: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{showConfig ? 'Hide Policies' : 'Configure Shield Policies'}</span>
          {showConfig ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showConfig && (
        <RedactionConfig settings={settings} onUpdate={handleUpdateSettings} />
      )}

      {/* Privacy Audit Trail */}
      <PrivacyAuditLog logs={sessionState?.auditLog || []} />
    </div>
  );
}
