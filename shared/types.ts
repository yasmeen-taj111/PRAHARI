/**
 * PRAHARI Shared Contracts & Type Definitions
 * Problem Statement #26171 (ISRO — On-device Visual Perception for Light-weight Browser Agents)
 */

export type RedactionCategory = 
  | 'password'
  | 'credit_card'
  | 'aadhaar'
  | 'pan'
  | 'email'
  | 'phone'
  | 'otp'
  | 'face'
  | 'custom_sensitive';

export type RedactionMethod = 'black_box' | 'gaussian_blur' | 'pixelate' | 'masked_text';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RedactionBox {
  id: string;
  category: RedactionCategory;
  method: RedactionMethod;
  bbox: BoundingBox;
  confidence: number;
  source: 'dom_heuristic' | 'regex_pii' | 'ocr_scan' | 'vision_detector';
  maskedTextPreview?: string;
  domSelector?: string;
}

export interface DOMNodeSnapshot {
  id: string;
  tagName: string;
  role?: string;
  inputType?: string;
  name?: string;
  ariaLabel?: string;
  placeholder?: string;
  selector: string;
  xpath: string;
  bbox: BoundingBox;
  isInteractive: boolean;
  isSensitive: boolean;
  redacted: boolean;
  redactionCategory?: RedactionCategory;
  sanitizedText?: string;
  hasValue?: boolean;
  isVisible: boolean;
}

export interface ClientTelemetry {
  domExtractionTimeMs: number;
  visionInferenceTimeMs: number;
  redactionTimeMs: number;
  totalClientTimeMs: number;
  backendUsed: 'webgpu' | 'wasm_simd' | 'wasm_cpu';
  redactedElementCount: number;
  timestamp: string;
}

export interface ViewportSnapshot {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface SanitizedPayload {
  version: string;
  tabUrl: string;
  pageTitle: string;
  sanitizedImageBase64: string;
  isZeroTrustVerified: boolean;
  redactionBoxes: RedactionBox[];
  domTree: DOMNodeSnapshot[];
  userTask: string;
  conversationHistory?: Array<{ role: 'user' | 'agent'; content: string }>;
  telemetry: ClientTelemetry;
  viewport?: ViewportSnapshot;
}

export type AgentActionType = 'click' | 'type' | 'scroll' | 'wait' | 'press_key' | 'ask_user' | 'done';

export interface AgentAction {
  action: AgentActionType;
  selector?: string;
  bbox?: BoundingBox;
  value?: string;
  key?: string;
  scrollDirection?: 'up' | 'down' | 'top' | 'bottom';
  scrollAmount?: number;
  thought?: string;
  isRisky?: boolean;
  riskReason?: string;
}

export interface AgentActionPlanResponse {
  taskId: string;
  stepNumber: number;
  action: AgentAction;
  confidence: number;
  serverReasoningTimeMs: number;
  modelUsed: string;
  status: 'executing' | 'waiting_confirmation' | 'completed' | 'failed';
  message?: string;
}

export interface RedactionSettings {
  redactPasswords: boolean;
  redactCreditCards: boolean;
  redactAadhaar: boolean;
  redactPan: boolean;
  redactEmails: boolean;
  redactPhones: boolean;
  redactOtps: boolean;
  redactFaces: boolean;
  preferredBackend: 'auto' | 'webgpu' | 'wasm';
  requireConfirmForRiskyActions: boolean;
}

export const DEFAULT_REDACTION_SETTINGS: RedactionSettings = {
  redactPasswords: true,
  redactCreditCards: true,
  redactAadhaar: true,
  redactPan: true,
  redactEmails: true,
  redactPhones: true,
  redactOtps: true,
  redactFaces: true,
  preferredBackend: 'auto',
  requireConfirmForRiskyActions: true,
};
