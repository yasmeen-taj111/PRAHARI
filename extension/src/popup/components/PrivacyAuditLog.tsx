import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';

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
    <div style={{ margin: '12px 14px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: '#131E36', borderBottom: '1px solid #1E293B' }}>
        <Terminal size={12} color="#94A3B8" />
        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', color: '#94A3B8' }}>
          SENTINEL PRIVACY AUDIT TRAIL
        </span>
      </div>
      <div style={{ maxHeight: '110px', overflowY: 'auto', padding: '6px 8px', fontSize: '11px', fontFamily: 'monospace' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: '12px 0', fontSize: '11px' }}>
            No sensitive elements detected on this page yet
          </div>
        ) : (
          logs.slice(0, 15).map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '3px 0',
                borderBottom: '1px solid rgba(30, 41, 59, 0.4)',
                color: log.type === 'ERROR' ? '#EF4444' : log.type === 'REDACTION' ? '#F59E0B' : '#06B6D4',
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
