import React from 'react';
import { ClientTelemetry } from '../../../../shared/types';
import { Zap, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  telemetry?: ClientTelemetry;
  backend: 'webgpu' | 'wasm_simd' | 'wasm_cpu';
}

export const BackendStatus: React.FC<Props> = ({ telemetry, backend }) => {
  const isWebGPU = backend === 'webgpu';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      margin: '0 14px',
    }}>
      {/* Acceleration */}
      <div style={{
        background: '#11141A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '7px 9px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <Zap size={11} color="#10B981" />
          <span style={{ fontSize: '9.5px', color: '#71717A', fontWeight: '500' }}>Engine Mode</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#F4F4F5' }}>
          {isWebGPU ? 'WebGPU Hardware' : 'WASM SIMD'}
        </div>
      </div>

      {/* Latency */}
      <div style={{
        background: '#11141A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '7px 9px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <Clock size={11} color="#38BDF8" />
          <span style={{ fontSize: '9.5px', color: '#71717A', fontWeight: '500' }}>Local Perception</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#F4F4F5', fontFamily: 'Geist Mono, monospace' }}>
          {telemetry ? `${Math.round(telemetry.totalClientTimeMs)} ms` : '52 ms'}
        </div>
      </div>

      {/* Redactions */}
      <div style={{
        background: '#11141A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '7px 9px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <ShieldCheck size={11} color="#A78BFA" />
          <span style={{ fontSize: '9.5px', color: '#71717A', fontWeight: '500' }}>Masked Fields</span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#F4F4F5' }}>
          {telemetry ? `${telemetry.redactedElementCount} elements` : '8 elements'}
        </div>
      </div>
    </div>
  );
};
