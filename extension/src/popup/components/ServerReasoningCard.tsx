import React, { useState } from 'react';
import { Brain, Activity, Clock, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Code, ShieldAlert, Cpu } from 'lucide-react';

interface ServerState {
  modelUsed: string;
  serverReasoningTimeMs: number;
  networkRoundtripMs: number;
  serverConnected: boolean;
  lastAction?: any;
  lastError?: string;
}

interface Props {
  serverState?: ServerState;
}

export const ServerReasoningCard: React.FC<Props> = ({ serverState }) => {
  const [showJson, setShowJson] = useState(false);

  const isConnected = serverState?.serverConnected ?? false;
  const model = serverState?.modelUsed || 'Not Connected';
  const serverLatency = serverState?.serverReasoningTimeMs ? `${Math.round(serverState.serverReasoningTimeMs)}ms` : '-- ms';
  const rtt = serverState?.networkRoundtripMs ? `${Math.round(serverState.networkRoundtripMs)}ms` : '-- ms';
  const action = serverState?.lastAction;

  // Determine risk level
  const getRiskBadge = (actName?: string) => {
    const act = (actName || '').toLowerCase();
    if (act.includes('submit') || act.includes('pay') || act.includes('delete')) {
      return { label: 'Risky (Form Submit)', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '#EF4444' };
    }
    if (act.includes('click') || act.includes('type')) {
      return { label: 'Medium (Interaction)', bg: 'rgba(249, 115, 22, 0.15)', color: '#F97316', border: '#F97316' };
    }
    return { label: 'Safe (Inspection)', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '#10B981' };
  };

  const risk = getRiskBadge(action?.action);

  return (
    <div style={{ margin: '14px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0F172A', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={15} color="#10B981" />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', color: '#F1F5F9' }}>
            SERVER REASONING ENGINE
          </span>
        </div>
        <div>
          <span
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isConnected ? '#10B981' : '#EF4444',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isConnected ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          {/* AI Model */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '600' }}>AI MODEL</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', marginTop: '2px' }}>
              {model}
            </span>
          </div>

          {/* VLM Inference */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '600' }}>VLM INFERENCE</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px', display: 'block' }}>
              {serverLatency}
            </span>
          </div>

          {/* Network RTT */}
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
            <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '600' }}>NETWORK RTT</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#F97316', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px', display: 'block' }}>
              {rtt}
            </span>
          </div>
        </div>

        {/* Action Card */}
        {action ? (
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: '#10B981', color: '#0F172A', fontWeight: '800', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  ACTION: {action.action?.toUpperCase()}
                </span>
                {action.selector && (
                  <code style={{ color: '#38BDF8', fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    {action.selector}
                  </code>
                )}
              </div>
              <span style={{ fontSize: '9px', fontWeight: '700', color: risk.color, background: risk.bg, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${risk.border}` }}>
                {risk.label}
              </span>
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '11px', lineHeight: '1.45', fontStyle: 'italic', marginTop: '4px' }}>
              "{action.thought || 'Executing planned browser workflow...'}"
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0', textAlign: 'center' }}>
            {serverState?.lastError ? (
              <span style={{ color: '#EF4444' }}>Error: {serverState.lastError}</span>
            ) : (
              'Awaiting agent execution to receive reasoning plan...'
            )}
          </div>
        )}

        {/* JSON Inspector Toggle */}
        {action && (
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
              }}
            >
              <Code size={11} />
              <span>{showJson ? 'Hide Action JSON' : 'Inspect Action JSON'}</span>
              {showJson ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        )}

        {showJson && action && (
          <pre style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', padding: '8px 10px', fontSize: '10px', color: '#10B981', overflowX: 'auto', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
            {JSON.stringify(action, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
