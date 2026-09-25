import React from 'react';
import { Terminal } from 'lucide-react';

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
    <div style={{
      margin: '12px 14px',
      background: '#11141A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: '#0D1016',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <Terminal size={11} color="#71717A" />
        <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#D4D4D8', letterSpacing: '0.02em' }}>
          Real-Time Privacy Audit Stream
        </span>
      </div>
      <div style={{
        maxHeight: '100px',
        overflowY: 'auto',
        padding: '8px 10px',
        fontSize: '10.5px',
        fontFamily: 'Geist Mono, monospace',
        background: '#090B0E',
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#52525B', textAlign: 'center', padding: '10px 0', fontSize: '10.5px' }}>
            Zero-Trust buffer initialized • 0 PII bytes transmitted
          </div>
        ) : (
          logs.slice(0, 15).map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '2px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                color: log.type === 'ERROR' ? '#FB7185' : log.type === 'REDACTION' ? '#34D399' : '#38BDF8',
              }}
            >
              <span style={{ color: '#52525B', fontSize: '9px', whiteSpace: 'nowrap' }}>[{log.timestamp}]</span>
              <span style={{ flex: 1, wordBreak: 'break-word', fontSize: '10px' }}>{log.details}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
