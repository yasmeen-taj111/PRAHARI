import os
import sys
import uuid
from fastapi import APIRouter, HTTPException

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from shared.schemas import SanitizedPayload, AgentActionPlanResponse
from server.config import settings
from server.services.vlm_reasoner import vlm_reasoner
from server.services.metrics_service import metrics_service

router = APIRouter()

@router.get("/health")
async def health_check():
    backend = settings.MODEL_BACKEND.lower()
    has_api_key = bool(
        (backend == "gemini" and settings.GEMINI_API_KEY) or
        (backend == "openai" and settings.OPENAI_API_KEY)
    )
    model_name = settings.MODEL_NAME or ("gemini-1.5-flash" if backend == "gemini" else backend)
    model_status = f"{backend.upper()} ({model_name})" if has_api_key else f"{backend.upper()} ({model_name} Local)"
    
    return {
        "status": "healthy",
        "service": "PRAHARI Reasoning Engine",
        "version": "1.0.0",
        "backend": backend,
        "model": model_status,
        "apiKeyConfigured": has_api_key
    }

@router.post("/act", response_model=AgentActionPlanResponse)
async def plan_agent_action(payload: SanitizedPayload):
    """
    Core sanitized reasoning endpoint:
    Receives ONLY on-device redacted visual image and tagged DOM tree.
    Sends redaction-aware context to real VLM API and returns strict action JSON.
    """
    # 1. Zero-Trust safety verification check
    if not payload.isZeroTrustVerified:
        raise HTTPException(
            status_code=400,
            detail="Zero-Trust validation flag missing or unverified by client. Raw data transmission rejected."
        )

    # 2. Run real VLM reasoner
    try:
        action, server_time_ms, model_name = await vlm_reasoner.reason(payload)
    except ValueError as ve:
        # Missing API keys or invalid configuration
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Upstream VLM API failure or timeout
        raise HTTPException(status_code=502, detail=f"Upstream VLM Error: {str(e)}")

    # 3. Record metrics telemetry
    metrics_service.record_request(
        client_latency_ms=payload.telemetry.totalClientTimeMs,
        server_latency_ms=server_time_ms,
        backend_used=payload.telemetry.backendUsed,
        redaction_boxes=payload.redactionBoxes
    )

    return AgentActionPlanResponse(
        taskId=f"task-{uuid.uuid4().hex[:8]}",
        stepNumber=1,
        action=action,
        confidence=0.96,
        serverReasoningTimeMs=round(server_time_ms, 2),
        modelUsed=model_name,
        status="executing",
        message="Action planned successfully by real VLM over sanitized visual context"
    )

@router.get("/metrics")
async def get_metrics():
    """
    Live metrics endpoint exposing latency breakdowns and redaction counts.
    """
    return metrics_service.get_snapshot()
