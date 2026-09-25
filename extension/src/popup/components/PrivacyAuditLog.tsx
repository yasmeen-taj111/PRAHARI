import React from 'react';
import { Terminal, Shield } from 'lucide-react';

interface AuditItem {
  timestamp: string;
  type: string;
  details: string;
  category?: string;
}

interface Props {
  logs: AuditItem[];
}

export const PrivacyAuditLog: React.FC<Props> = ({ logs }) => {
  return (
    <div style={{ margin: '14px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#0F172A', borderBottom: '1px solid #334155' }}>
        <Terminal size={12} color="#10B981" />
        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', color: '#F1F5F9' }}>
          SENTINEL PRIVACY AUDIT TRAIL
        </span>
      </div>
      <div style={{ maxHeight: '105px', overflowY: 'auto', padding: '8px 12px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', background: '#0F172A' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#64748B', textAlign: 'center', padding: '10px 0', fontSize: '11px' }}>
            Zero-Trust Shield Active • No PII leaks detected
          </div>
        ) : (
          logs.slice(0, 15).map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '3px 0',
                borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
                color: log.type === 'ERROR' ? '#EF4444' : log.type === 'REDACTION' ? '#10B981' : '#38BDF8',
              }}
            >
              <span style={{ color: '#64748B', fontSize: '9px', whiteSpace: 'nowrap' }}>[{log.timestamp}]</span>
              <span style={{ flex: 1, wordBreak: 'break-word', fontSize: '10px' }}>{log.details}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
