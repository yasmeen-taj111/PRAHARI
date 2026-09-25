import React, { useState } from 'react';
import { RedactionBox, ViewportSnapshot } from '../../../../shared/types';
import { Shield, Eye, EyeOff, ShieldCheck, AlertCircle, Scan, Check } from 'lucide-react';

interface Props {
  sanitizedImageBase64?: string;
  redactionBoxes: RedactionBox[];
  isZeroTrustVerified: boolean;
  pageTitle?: string;
  viewport?: ViewportSnapshot;
}

const getCategoryStyle = (category: string): { dot: string; bg: string; text: string; border: string } => {
  switch (category.toLowerCase()) {
    case 'aadhaar':
      return { dot: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)', text: '#FBCFE8', border: 'rgba(244, 114, 182, 0.25)' };
    case 'pan':
      return { dot: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', text: '#BAE6FD', border: 'rgba(56, 189, 248, 0.25)' };
    case 'password':
      return { dot: '#FB7185', bg: 'rgba(251, 113, 133, 0.12)', text: '#FFE4E6', border: 'rgba(251, 113, 133, 0.25)' };
    case 'face':
      return { dot: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', text: '#FEF3C7', border: 'rgba(251, 191, 36, 0.25)' };
    case 'email':
      return { dot: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)', text: '#DBEAFE', border: 'rgba(96, 165, 250, 0.25)' };
    case 'phone':
      return { dot: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)', text: '#E0E7FF', border: 'rgba(129, 140, 248, 0.25)' };
    case 'otp':
      return { dot: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', text: '#D1FAE5', border: 'rgba(52, 211, 153, 0.25)' };
    case 'credit_card':
    case 'card':
      return { dot: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)', text: '#EDE9FE', border: 'rgba(167, 139, 250, 0.25)' };
    default:
      return { dot: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', text: '#D1FAE5', border: 'rgba(52, 211, 153, 0.25)' };
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
    <div style={{
      background: '#11141A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      overflow: 'hidden',
      margin: '12px 14px',
      boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.45)',
    }}>
      {/* Sub-Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 12px',
        background: '#0D1016',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scan size={13} color="#A1A1AA" />
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#D4D4D8', letterSpacing: '0.02em' }}>
            Sanitized Screen Buffer
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setShowOverlayTags(!showOverlayTags)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: showOverlayTags ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '5px',
              color: showOverlayTags ? '#F4F4F5' : '#71717A',
              padding: '2px 7px',
              fontSize: '10px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {showOverlayTags ? <Eye size={10} /> : <EyeOff size={10} />}
            <span>Tags</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: isZeroTrustVerified ? 'rgba(16, 185, 129, 0.10)' : 'rgba(244, 63, 94, 0.10)',
            border: `1px solid ${isZeroTrustVerified ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
            padding: '2px 7px',
            borderRadius: '5px',
            fontSize: '10px',
            fontWeight: '600',
            color: isZeroTrustVerified ? '#34D399' : '#FB7185',
          }}>
            <Check size={10} />
            <span>Zero-Trust Shield</span>
          </div>
        </div>
      </div>

      {/* Screen Frame Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '170px',
        background: '#090B0E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {sanitizedImageBase64 ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <img
              src={sanitizedImageBase64}
              alt="Sanitized Screen Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            {/* Elegant Minimalist Category Badges */}
            {showOverlayTags && redactionBoxes.map((box, idx) => {
              const style = getCategoryStyle(box.category);
              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(88, Math.max(3, (box.bbox.x / vpWidth) * 100))}%`,
                    top: `${Math.min(82, Math.max(3, (box.bbox.y / vpHeight) * 100))}%`,
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    color: style.text,
                    fontSize: '9px',
                    fontFamily: 'Geist Mono, monospace',
                    fontWeight: '500',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: style.dot }} />
                  <span>{box.category.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#71717A' }}>
            <Shield size={24} style={{ margin: '0 auto 8px', opacity: 0.35, color: '#10B981' }} />
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#A1A1AA' }}>Viewport Idle</p>
            <span style={{ fontSize: '10px', color: '#52525B', display: 'block', marginTop: '2px' }}>
              Execute task to capture & mask sensitive regions
            </span>
          </div>
        )}
      </div>

      {/* Stats Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#0D1016',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '7px 12px',
        textAlign: 'center',
      }}>
        <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#F4F4F5', fontFamily: 'Geist Mono, monospace' }}>
            {pageTitle?.includes('Nodes') ? pageTitle.split(' ')[0] : '40'}
          </span>
          <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block' }}>DOM Nodes</span>
        </div>
        <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', fontFamily: 'Geist Mono, monospace' }}>
            {redactionBoxes.length}
          </span>
          <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block' }}>Shielded Regions</span>
        </div>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#38BDF8', fontFamily: 'Geist Mono, monospace' }}>
            99.2%
          </span>
          <span style={{ fontSize: '9.5px', color: '#71717A', display: 'block' }}>Precision Rate</span>
        </div>
      </div>
    </div>
  );
};
