"""
PRAHARI Shared Pydantic Schemas
Problem Statement #26171 (ISRO — On-device Visual Perception for Light-weight Browser Agents)
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field

RedactionCategory = Literal[
    'password',
    'credit_card',
    'aadhaar',
    'pan',
    'email',
    'phone',
    'otp',
    'face',
    'custom_sensitive'
]

RedactionMethod = Literal['black_box', 'gaussian_blur', 'pixelate', 'masked_text']
AgentActionType = Literal['click', 'type', 'scroll', 'wait', 'press_key', 'ask_user', 'done']

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class RedactionBox(BaseModel):
    id: str
    category: RedactionCategory
    method: RedactionMethod
    bbox: BoundingBox
    confidence: float = Field(ge=0.0, le=1.0)
    source: Literal['dom_heuristic', 'regex_pii', 'ocr_scan', 'vision_detector']
    maskedTextPreview: Optional[str] = None
    domSelector: Optional[str] = None

class DOMNodeSnapshot(BaseModel):
    id: str
    tagName: str
    role: Optional[str] = None
    inputType: Optional[str] = None
    name: Optional[str] = None
    ariaLabel: Optional[str] = None
    placeholder: Optional[str] = None
    selector: str
    xpath: Optional[str] = None
    bbox: BoundingBox
    isInteractive: bool = False
    isSensitive: bool = False
    redacted: bool = False
    redactionCategory: Optional[RedactionCategory] = None
    sanitizedText: Optional[str] = None
    hasValue: Optional[bool] = False
    isVisible: bool = True

class ClientTelemetry(BaseModel):
    domExtractionTimeMs: float
    visionInferenceTimeMs: float
    redactionTimeMs: float
    totalClientTimeMs: float
    backendUsed: Literal['webgpu', 'wasm_simd', 'wasm_cpu']
    redactedElementCount: int
    timestamp: str

class ChatMessage(BaseModel):
    role: Literal['user', 'agent']
    content: str

class ViewportSnapshot(BaseModel):
    width: float
    height: float
    devicePixelRatio: Optional[float] = 1.0

class SanitizedPayload(BaseModel):
    version: str = "1.0.0"
    tabUrl: str
    pageTitle: str
    sanitizedImageBase64: str
    isZeroTrustVerified: bool = True
    redactionBoxes: List[RedactionBox] = []
    domTree: List[DOMNodeSnapshot] = []
    userTask: str
    conversationHistory: Optional[List[ChatMessage]] = None
    telemetry: ClientTelemetry
    viewport: Optional[ViewportSnapshot] = None

class AgentAction(BaseModel):
    action: AgentActionType
    selector: Optional[str] = None
    bbox: Optional[BoundingBox] = None
    value: Optional[str] = None
    key: Optional[str] = None
    scrollDirection: Optional[Literal['up', 'down', 'top', 'bottom']] = None
    scrollAmount: Optional[int] = None
    thought: Optional[str] = None
    isRisky: Optional[bool] = False
    riskReason: Optional[str] = None

class AgentActionPlanResponse(BaseModel):
    taskId: str
    stepNumber: int
    action: AgentAction
    confidence: float
    serverReasoningTimeMs: float
    modelUsed: str
    status: Literal['executing', 'waiting_confirmation', 'completed', 'failed']
    message: Optional[str] = None

class MetricsSnapshot(BaseModel):
    totalRequests: int
    avgClientLatencyMs: float
    avgServerLatencyMs: float
    avgEndToEndLatencyMs: float
    totalRedactionsPerformed: int
    redactionsByCategory: dict
    activeBackends: dict
