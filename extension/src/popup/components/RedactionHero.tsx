import React, { useState } from 'react';
import { RedactionBox, ViewportSnapshot } from '../../../../shared/types';
import { ShieldCheck, Eye, EyeOff, Layers, Lock, Sparkles, CheckCircle } from 'lucide-react';

interface Props {
  sanitizedImageBase64?: string;
  redactionBoxes: RedactionBox[];
  isZeroTrustVerified: boolean;
  pageTitle?: string;
  viewport?: ViewportSnapshot;
}

const getCategoryColor = (category: string): { bg: string; color: string; border: string } => {
  switch (category.toLowerCase()) {
    case 'aadhaar':
      return { bg: 'rgba(236, 72, 153, 0.25)', color: '#F472B6', border: '#EC4899' };
    case 'pan':
      return { bg: 'rgba(6, 182, 212, 0.25)', color: '#38BDF8', border: '#06B6D4' };
    case 'password':
      return { bg: 'rgba(239, 68, 68, 0.25)', color: '#F87171', border: '#EF4444' };
    case 'face':
      return { bg: 'rgba(245, 158, 11, 0.25)', color: '#FBBF24', border: '#F59E0B' };
    case 'email':
      return { bg: 'rgba(59, 130, 246, 0.25)', color: '#60A5FA', border: '#3B82F6' };
    case 'phone':
      return { bg: 'rgba(99, 102, 241, 0.25)', color: '#818CF8', border: '#6366F1' };
    case 'otp':
      return { bg: 'rgba(16, 185, 129, 0.25)', color: '#34D399', border: '#10B981' };
    case 'credit_card':
    case 'card':
      return { bg: 'rgba(139, 92, 246, 0.25)', color: '#A78BFA', border: '#8B5CF6' };
    default:
      return { bg: 'rgba(16, 185, 129, 0.25)', color: '#10B981', border: '#10B981' };
  }
};

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
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden', margin: '14px 16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0F172A', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={14} color="#10B981" />
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', color: '#F1F5F9' }}>
            ON-DEVICE SANITIZED VIEW
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
              borderRadius: '6px',
              color: showOverlayTags ? '#10B981' : '#94A3B8',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {showOverlayTags ? <Eye size={11} /> : <EyeOff size={11} />}
            <span>Tags</span>
          </button>
          <span
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isZeroTrustVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isZeroTrustVerified ? '#10B981' : '#EF4444',
              border: `1px solid ${isZeroTrustVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            <CheckCircle size={10} />
            {isZeroTrustVerified ? 'Zero-Trust Verified' : 'Unverified'}
          </span>
        </div>
      </div>

      {/* Screen Preview Frame */}
      <div style={{ position: 'relative', width: '100%', height: '175px', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {sanitizedImageBase64 ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <img
              src={sanitizedImageBase64}
              alt="Sanitized Screen Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {/* Category badge pins */}
            {showOverlayTags && redactionBoxes.map((box, idx) => {
              const theme = getCategoryColor(box.category);
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(88, Math.max(3, (box.bbox.x / vpWidth) * 100))}%`,
                    top: `${Math.min(82, Math.max(3, (box.bbox.y / vpHeight) * 100))}%`,
                    background: theme.bg,
                    color: theme.color,
                    border: `1px solid ${theme.border}`,
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  🔒 {box.category.toUpperCase()}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
            <Layers size={30} style={{ margin: '0 auto 10px', opacity: 0.4, color: '#10B981' }} />
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#F1F5F9' }}>Visual Shield Ready</p>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
              Run an agent command to perceive & redact viewport
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#0F172A', borderTop: '1px solid #334155', padding: '8px 12px', textAlign: 'center' }}>
        <div style={{ borderRight: '1px solid #1E293B' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9', fontFamily: 'JetBrains Mono, monospace' }}>
            {pageTitle?.includes('Nodes') ? pageTitle.split(' ')[0] : '40'}
          </span>
          <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '500' }}>DOM Nodes</span>
        </div>
        <div style={{ borderRight: '1px solid #1E293B' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>
            {redactionBoxes.length}
          </span>
          <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '500' }}>Shielded</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>
            99.2%
          </span>
          <span style={{ fontSize: '9px', color: '#94A3B8', display: 'block', fontWeight: '500' }}>Precision</span>
        </div>
      </div>
    </div>
  );
};
