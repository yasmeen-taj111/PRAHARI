import React, { useState } from 'react';
import { Server, Brain, Activity, Clock, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Code } from 'lucide-react';

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
  const serverLatency = serverState?.serverReasoningTimeMs ? `${serverState.serverReasoningTimeMs}ms` : '-- ms';
  const rtt = serverState?.networkRoundtripMs ? `${serverState.networkRoundtripMs}ms` : '-- ms';
  const action = serverState?.lastAction;

  return (
    <div style={{ margin: '10px 14px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#131E36', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Brain size={14} color="#06B6D4" />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: '#F8FAFC' }}>
            SERVER REASONING ENGINE
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '700',
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isConnected ? '#10B981' : '#EF4444',
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

      {/* Details Grid */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          {/* Model */}
          <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '6px', padding: '6px 8px' }}>
            <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: '600' }}>AI MODEL</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#06B6D4', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
              {model}
            </span>
          </div>

          {/* VLM Latency */}
          <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '6px', padding: '6px 8px' }}>
            <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: '600' }}>VLM INFERENCE</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B' }}>
              {serverLatency}
            </span>
          </div>

          {/* Network RTT */}
          <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '6px', padding: '6px 8px' }}>
            <span style={{ fontSize: '9px', color: '#64748B', display: 'block', fontWeight: '600' }}>NETWORK RTT</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981' }}>
              {rtt}
            </span>
          </div>
        </div>

        {/* Action & Thought */}
        {action ? (
          <div style={{ background: '#090D16', border: '1px solid #1E293B', borderRadius: '6px', padding: '8px 10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ background: '#F59E0B', color: '#090D16', fontWeight: '800', fontSize: '9px', padding: '1px 5px', borderRadius: '3px' }}>
                ACTION: {action.action?.toUpperCase()}
              </span>
              {action.selector && (
                <code style={{ color: '#06B6D4', fontSize: '10px' }}>{action.selector}</code>
              )}
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '11px', lineHeight: '1.4' }}>
              <strong>Thought:</strong> {action.thought || 'Planning action based on sanitized visual context'}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', padding: '4px 0' }}>
            {serverState?.lastError ? (
              <span style={{ color: '#EF4444' }}>Error: {serverState.lastError}</span>
            ) : (
              'Waiting for task execution to receive model action plan...'
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
                color: '#64748B',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Code size={11} />
              <span>{showJson ? 'Hide Action JSON' : 'Inspect Action JSON'}</span>
              {showJson ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        )}

        {showJson && action && (
          <pre style={{ background: '#050811', border: '1px solid #1E293B', borderRadius: '4px', padding: '8px', fontSize: '10px', color: '#10B981', overflowX: 'auto', marginTop: '6px' }}>
            {JSON.stringify(action, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
