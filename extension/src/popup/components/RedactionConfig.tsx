import React from 'react';
import { RedactionSettings } from '../../../../shared/types';
import { Sliders, Check, Square } from 'lucide-react';

interface Props {
  settings: RedactionSettings;
  onUpdate: (newSettings: RedactionSettings) => void;
}

export const RedactionConfig: React.FC<Props> = ({ settings, onUpdate }) => {
  const toggleKey = (key: keyof RedactionSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const categories = [
    { key: 'redactPasswords', label: 'Passwords & Tokens' },
    { key: 'redactCreditCards', label: 'Payment / Card Data' },
    { key: 'redactAadhaar', label: 'Aadhaar (Verhoeff)' },
    { key: 'redactPan', label: 'PAN Identity Numbers' },
    { key: 'redactEmails', label: 'Email Addresses' },
    { key: 'redactPhones', label: 'Phone Numbers (+91)' },
    { key: 'redactOtps', label: 'OTP & 2FA Codes' },
    { key: 'redactFaces', label: 'Facial Avatars' },
  ];

  return (
    <div style={{
      margin: '10px 14px',
      background: '#11141A',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      padding: '10px 12px',
      boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.45)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Sliders size={12} color="#71717A" />
        <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#D4D4D8', letterSpacing: '0.02em' }}>
          Active Masking Policies
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {categories.map(({ key, label }) => {
          const isEnabled = !!settings[key as keyof RedactionSettings];
          return (
            <button
              key={key}
              onClick={() => toggleKey(key as keyof RedactionSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isEnabled ? 'rgba(16, 185, 129, 0.08)' : '#0D1016',
                border: isEnabled ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '6px',
                padding: '5px 8px',
                color: isEnabled ? '#F4F4F5' : '#71717A',
                fontSize: '10.5px',
                fontWeight: isEnabled ? '500' : '400',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: isEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isEnabled && <Check size={9} color="#090B0E" strokeWidth={3} />}
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
