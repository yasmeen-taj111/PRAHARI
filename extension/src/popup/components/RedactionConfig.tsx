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
    { key: 'redactPasswords', label: 'Password Fields', color: '#EF4444' },
    { key: 'redactCreditCards', label: 'Credit / Debit Cards', color: '#8B5CF6' },
    { key: 'redactAadhaar', label: 'Indian Aadhaar (12-Digit)', color: '#EC4899' },
    { key: 'redactPan', label: 'PAN Identity Numbers', color: '#06B6D4' },
    { key: 'redactEmails', label: 'Email Addresses', color: '#3B82F6' },
    { key: 'redactPhones', label: 'Phone Numbers (+91)', color: '#6366F1' },
    { key: 'redactOtps', label: 'OTP / Security Codes', color: '#10B981' },
    { key: 'redactFaces', label: 'Faces & Avatars', color: '#F59E0B' },
  ];

  return (
    <div style={{ margin: '12px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: '10px', padding: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Sliders size={13} color="#10B981" />
        <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', color: '#F1F5F9' }}>
          LOCAL SHIELD POLICIES
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {categories.map(({ key, label, color }) => {
          const isEnabled = !!settings[key as keyof RedactionSettings];
          return (
            <button
              key={key}
              onClick={() => toggleKey(key as keyof RedactionSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isEnabled ? 'rgba(16, 185, 129, 0.08)' : '#0F172A',
                border: isEnabled ? '1px solid #10B981' : '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 10px',
                color: isEnabled ? '#F1F5F9' : '#94A3B8',
                fontSize: '11px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isEnabled ? <CheckSquare size={13} color="#10B981" /> : <Square size={13} color="#475569" />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isEnabled ? '600' : '400' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
