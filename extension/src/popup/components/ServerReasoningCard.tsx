import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, Code2, Sparkles, Terminal } from 'lucide-react';

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
  const serverLatency = serverState?.serverReasoningTimeMs ? `${Math.round(serverState.serverReasoningTimeMs)} ms` : '--';
  const rtt = serverState?.networkRoundtripMs ? `${Math.round(serverState.networkRoundtripMs)} ms` : '--';
  const action = serverState?.lastAction;

  const getActionBadgeStyle = (actName?: string) => {
    const act = (actName || '').toLowerCase();
    if (act.includes('submit') || act.includes('pay') || act.includes('delete')) {
      return { bg: 'rgba(244, 63, 94, 0.12)', text: '#FDA4AF', border: 'rgba(244, 63, 94, 0.3)' };
    }
    if (act.includes('click') || act.includes('type')) {
      return { bg: 'rgba(16, 185, 129, 0.12)', text: '#6EE7B7', border: 'rgba(16, 185, 129, 0.3)' };
    }
    return { bg: 'rgba(56, 189, 248, 0.12)', text: '#7DD3FC', border: 'rgba(56, 189, 248, 0.3)' };
  };

  const actionStyle = getActionBadgeStyle(action?.action);

  return (
    <div style={{
      margin: '12px 14px',
      background: '#11141A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.45)',
    }}>
      {/* Card Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 12px',
        background: '#0D1016',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={13} color="#A1A1AA" />
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#D4D4D8', letterSpacing: '0.02em' }}>
            Reasoning Engine Telemetry
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isConnected ? '#10B981' : '#F43F5E',
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: '10.5px',
            fontWeight: '600',
            color: isConnected ? '#34D399' : '#FB7185',
          }}>
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '6px',
          marginBottom: '8px',
        }}>
          {/* Model */}
          <div style={{
            background: '#0D1016',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '6px 8px',
          }}>
            <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block', fontWeight: '500' }}>Active VLM</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#E4E4E7', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', marginTop: '1px' }}>
              {model.replace('google/', '').replace('gemini-', 'Gemini ')}
            </span>
          </div>

          {/* VLM Latency */}
          <div style={{
            background: '#0D1016',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '6px 8px',
          }}>
            <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block', fontWeight: '500' }}>Inference</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#10B981', fontFamily: 'Geist Mono, monospace', display: 'block', marginTop: '1px' }}>
              {serverLatency}
            </span>
          </div>

          {/* RTT */}
          <div style={{
            background: '#0D1016',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '6px 8px',
          }}>
            <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block', fontWeight: '500' }}>Network RTT</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#38BDF8', fontFamily: 'Geist Mono, monospace', display: 'block', marginTop: '1px' }}>
              {rtt}
            </span>
          </div>
        </div>

        {/* Action Display */}
        {action ? (
          <div style={{
            background: '#0D1016',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11.5px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: actionStyle.bg,
                  color: actionStyle.text,
                  border: `1px solid ${actionStyle.border}`,
                  fontSize: '9.5px',
                  fontWeight: '600',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontFamily: 'Geist Mono, monospace',
                }}>
                  {action.action?.toUpperCase()}
                </span>
                {action.selector && (
                  <code style={{
                    color: '#A1A1AA',
                    fontSize: '10.5px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}>
                    {action.selector}
                  </code>
                )}
              </div>
            </div>

            <div style={{ color: '#A1A1AA', fontSize: '11px', lineHeight: '1.4', fontStyle: 'italic' }}>
              "{action.thought || 'Executing autonomous browser step...'}"
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#71717A', padding: '6px 0', textAlign: 'center' }}>
            {serverState?.lastError ? (
              <span style={{ color: '#FB7185' }}>Error: {serverState.lastError}</span>
            ) : (
              'Awaiting action execution request...'
            )}
          </div>
        )}

        {/* JSON Inspector */}
        {action && (
          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowJson(!showJson)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717A',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 4px',
              }}
            >
              <Code2 size={11} />
              <span>{showJson ? 'Hide Payload' : 'Inspect JSON'}</span>
              {showJson ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>
        )}

        {showJson && action && (
          <pre style={{
            background: '#07080A',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '10px',
            color: '#34D399',
            overflowX: 'auto',
            marginTop: '4px',
            fontFamily: 'Geist Mono, monospace',
          }}>
            {JSON.stringify(action, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
