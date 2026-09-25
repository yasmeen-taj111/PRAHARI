import React from 'react';
import { RedactionSettings } from '../../../../shared/types';
import { Sliders, CheckSquare, Square } from 'lucide-react';

interface Props {
  settings: RedactionSettings;
  onUpdate: (newSettings: RedactionSettings) => void;
}

export const RedactionConfig: React.FC<Props> = ({ settings, onUpdate }) => {
  const toggleKey = (key: keyof RedactionSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const categories = [
    { key: 'redactPasswords', label: 'Password Fields' },
    { key: 'redactCreditCards', label: 'Credit / Debit Cards' },
    { key: 'redactAadhaar', label: 'Indian Aadhaar (12-Digit)' },
    { key: 'redactPan', label: 'PAN Identity Numbers' },
    { key: 'redactEmails', label: 'Email Addresses' },
    { key: 'redactPhones', label: 'Phone Numbers (+91)' },
    { key: 'redactOtps', label: 'OTP / Security Codes' },
    { key: 'redactFaces', label: 'Faces & Profile Avatars' },
  ];

  return (
    <div style={{ margin: '10px 14px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Sliders size={12} color="#94A3B8" />
        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', color: '#94A3B8' }}>
          LOCAL SHIELD POLICIES
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
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
                background: isEnabled ? '#131E36' : '#090D16',
                border: isEnabled ? '1px solid #06B6D4' : '1px solid #1E293B',
                borderRadius: '5px',
                padding: '4px 8px',
                color: isEnabled ? '#F8FAFC' : '#64748B',
                fontSize: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {isEnabled ? <CheckSquare size={12} color="#06B6D4" /> : <Square size={12} color="#475569" />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
