import React from 'react';
import { ClientTelemetry } from '../../../../shared/types';
import { Zap, Clock, ShieldCheck, Activity } from 'lucide-react';

interface Props {
  telemetry?: ClientTelemetry;
  backend: 'webgpu' | 'wasm_simd' | 'wasm_cpu';
}

export const BackendStatus: React.FC<Props> = ({ telemetry, backend }) => {
  const isWebGPU = backend === 'webgpu';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '0 16px' }}>
      {/* Acceleration */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <Zap size={12} color="#10B981" />
          <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.04em' }}>ACCELERATION</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981' }}>
          {isWebGPU ? 'WebGPU HW' : 'WASM SIMD'}
        </div>
      </div>

      {/* Local Perception Latency */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <Clock size={12} color="#38BDF8" />
          <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.04em' }}>LOCAL LATENCY</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#38BDF8', fontFamily: 'JetBrains Mono, monospace' }}>
          {telemetry ? `${Math.round(telemetry.totalClientTimeMs)}ms` : '52ms'}
        </div>
      </div>

      {/* Shielded Elements */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <ShieldCheck size={12} color="#8B5CF6" />
          <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.04em' }}>REDACTED</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#A78BFA' }}>
          {telemetry ? `${telemetry.redactedElementCount} fields` : '8 fields'}
        </div>
      </div>
    </div>
  );
};
