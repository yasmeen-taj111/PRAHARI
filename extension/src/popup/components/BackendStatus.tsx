import React from 'react';
import { ClientTelemetry } from '../../../../shared/types';
import { Cpu, Zap, Activity, Clock } from 'lucide-react';

interface Props {
  telemetry?: ClientTelemetry;
  backend: 'webgpu' | 'wasm_simd' | 'wasm_cpu';
}

export const BackendStatus: React.FC<Props> = ({ telemetry, backend }) => {
  const isWebGPU = backend === 'webgpu';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '0 14px' }}>
      {/* Acceleration Badge */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Zap size={12} color={isWebGPU ? '#10B981' : '#06B6D4'} />
          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>ACCELERATION</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: isWebGPU ? '#10B981' : '#06B6D4' }}>
          {isWebGPU ? 'WebGPU V2' : 'WASM SIMD'}
        </div>
      </div>

      {/* Local Inference Latency */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Clock size={12} color="#F59E0B" />
          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>LOCAL TIME</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#F59E0B' }}>
          {telemetry ? `${telemetry.totalClientTimeMs}ms` : '-- ms'}
        </div>
      </div>

      {/* Redactions */}
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Activity size={12} color="#8B5CF6" />
          <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>REDACTIONS</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#8B5CF6' }}>
          {telemetry ? telemetry.redactedElementCount : 0} elements
        </div>
      </div>
    </div>
  );
};
