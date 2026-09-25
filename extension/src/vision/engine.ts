/**
 * PRAHARI Hardware Acceleration & Runtime Vision Engine
 * Supports WebGPU with automatic fallback to WASM SIMD / CPU
 */

export type HardwareBackend = 'webgpu' | 'wasm_simd' | 'wasm_cpu';

export interface VisionEngineStatus {
  activeBackend: HardwareBackend;
  isWebGPUSupported: boolean;
  isWasmSIMDSupported: boolean;
  modelLoaded: boolean;
  deviceInfo: string;
}

class VisionEngine {
  private activeBackend: HardwareBackend = 'wasm_simd';
  private isInitialized = false;

  async init(preferredBackend: 'auto' | 'webgpu' | 'wasm' = 'auto'): Promise<VisionEngineStatus> {
    const webGPUSupported = await this.checkWebGPUSupport();
    const wasmSIMDSupported = this.checkWasmSIMDSupport();

    if (preferredBackend === 'webgpu' && webGPUSupported) {
      this.activeBackend = 'webgpu';
    } else if (preferredBackend === 'wasm') {
      this.activeBackend = wasmSIMDSupported ? 'wasm_simd' : 'wasm_cpu';
    } else {
      // Auto selection
      if (webGPUSupported) {
        this.activeBackend = 'webgpu';
      } else if (wasmSIMDSupported) {
        this.activeBackend = 'wasm_simd';
      } else {
        this.activeBackend = 'wasm_cpu';
      }
    }

    this.isInitialized = true;
    return this.getStatus();
  }

  async checkWebGPUSupport(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        return !!adapter;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  checkWasmSIMDSupport(): boolean {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.validate === 'function') {
      // SIMD test bytes
      const bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 26, 11]);
      return WebAssembly.validate(bytes);
    }
    return false;
  }

  getStatus(): VisionEngineStatus {
    return {
      activeBackend: this.activeBackend,
      isWebGPUSupported: typeof navigator !== 'undefined' && 'gpu' in navigator && !!(navigator as any).gpu,
      isWasmSIMDSupported: this.checkWasmSIMDSupport(),
      modelLoaded: this.isInitialized,
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node/Test Env',
    };
  }

  getActiveBackend(): HardwareBackend {
    return this.activeBackend;
  }
}

export const visionEngine = new VisionEngine();
