import React, { useState } from 'react';
import { RedactionBox, ViewportSnapshot } from '../../../../shared/types';
import { ShieldCheck, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

interface Props {
  sanitizedImageBase64?: string;
  redactionBoxes: RedactionBox[];
  isZeroTrustVerified: boolean;
  pageTitle?: string;
  viewport?: ViewportSnapshot;
}

export const RedactionHero: React.FC<Props> = ({
  sanitizedImageBase64,
  redactionBoxes,
  isZeroTrustVerified,
  pageTitle,
  viewport,
}) => {
  const [showOverlayTags, setShowOverlayTags] = useState(true);
  const vpWidth = viewport?.width || 1280;
  const vpHeight = viewport?.height || 800;

  return (
    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '10px', overflow: 'hidden', margin: '12px 14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#131E36', borderBottom: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: '#94A3B8' }}>
            ON-DEVICE SANITIZED HERO VIEW
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowOverlayTags(!showOverlayTags)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: showOverlayTags ? '#1E293B' : 'transparent',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: showOverlayTags ? '#06B6D4' : '#64748B',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            {showOverlayTags ? <Eye size={10} /> : <EyeOff size={10} />}
            <span>Tags</span>
          </button>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '700',
              background: isZeroTrustVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isZeroTrustVerified ? '#10B981' : '#EF4444',
            }}
          >
            {isZeroTrustVerified ? 'ZERO-TRUST VERIFIED' : 'UNVERIFIED'}
          </span>
        </div>
      </div>

      {/* Screen Preview Frame */}
      <div style={{ position: 'relative', width: '100%', height: '180px', background: '#090D16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {sanitizedImageBase64 ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <img
              src={sanitizedImageBase64}
              alt="Sanitized Screen Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {/* Real-time category badge pins */}
            {showOverlayTags && redactionBoxes.map((box, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${Math.min(90, Math.max(3, (box.bbox.x / vpWidth) * 100))}%`,
                  top: `${Math.min(85, Math.max(3, (box.bbox.y / vpHeight) * 100))}%`,
                  background: 'rgba(245, 158, 11, 0.9)',
                  color: '#090D16',
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                🔒 {box.category.toUpperCase()}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
            <Layers size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '500' }}>No active tab capture yet</p>
            <span style={{ fontSize: '10px', color: '#475569' }}>
              Run an agent command below to trigger visual perception
            </span>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#0A0F1D', borderTop: '1px solid #1E293B', fontSize: '11px' }}>
        <span style={{ color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
          {pageTitle || 'Active tab'}
        </span>
        <span style={{ color: '#F59E0B', fontWeight: '700' }}>
          {redactionBoxes.length} {redactionBoxes.length === 1 ? 'Region' : 'Regions'} Shielded
        </span>
      </div>
    </div>
  );
};
