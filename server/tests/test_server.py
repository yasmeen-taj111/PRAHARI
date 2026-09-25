import pytest
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from shared.schemas import (
    SanitizedPayload,
    ClientTelemetry,
    RedactionBox,
    BoundingBox,
    DOMNodeSnapshot
)
from server.services.prompt_builder import build_redaction_aware_prompt
from server.services.vlm_reasoner import vlm_reasoner
from server.services.metrics_service import metrics_service

def test_prompt_builder_includes_redactions():
    payload = SanitizedPayload(
        tabUrl="https://bhuvan.isro.gov.in/signup",
        pageTitle="ISRO Antariksh User Portal",
        sanitizedImageBase64="data:image/jpeg;base64,dGVzdA==",
        isZeroTrustVerified=True,
        redactionBoxes=[
            RedactionBox(
                id="box-1",
                category="aadhaar",
                method="black_box",
                bbox=BoundingBox(x=10, y=20, width=120, height=30),
                confidence=0.99,
                source="regex_pii",
                domSelector="#aadhaar-input"
            )
        ],
        domTree=[
            DOMNodeSnapshot(
                id="node-1",
                tagName="input",
                name="aadhaar",
                selector="#aadhaar-input",
                bbox=BoundingBox(x=10, y=20, width=120, height=30),
                isInteractive=True,
                isSensitive=True,
                redacted=True,
                redactionCategory="aadhaar"
            )
        ],
        userTask="Register for satellite telemetry stream",
        telemetry=ClientTelemetry(
            domExtractionTimeMs=12.0,
            visionInferenceTimeMs=28.0,
            redactionTimeMs=5.0,
            totalClientTimeMs=45.0,
            backendUsed="webgpu",
            redactedElementCount=1,
            timestamp="2026-09-12T12:00:00Z"
        )
    )

    prompt = build_redaction_aware_prompt(payload)
    assert "Active Redacted Regions:" in prompt
    assert "AADHAAR" in prompt
    assert "#aadhaar-input" in prompt
    assert "Treat solid black boxes and blurred regions as VALID FORM INPUTS" in prompt

@pytest.mark.asyncio
async def test_vlm_reasoner_fails_loudly_when_key_missing():
    # When GEMINI_API_KEY is not set, reasoner must fail loudly with clear error
    os.environ["MODEL_BACKEND"] = "gemini"
    os.environ["GEMINI_API_KEY"] = ""
    from server.config import settings
    settings.MODEL_BACKEND = "gemini"
    settings.GEMINI_API_KEY = ""

    payload = SanitizedPayload(
        tabUrl="https://isro.gov.in",
        pageTitle="ISRO Portal",
        sanitizedImageBase64="data:image/jpeg;base64,dGVzdA==",
        isZeroTrustVerified=True,
        redactionBoxes=[],
        domTree=[
            DOMNodeSnapshot(
                id="node-1",
                tagName="button",
                selector="#confirmBtn",
                ariaLabel="Finish and send my application",
                bbox=BoundingBox(x=50, y=100, width=200, height=40),
                isInteractive=True,
                isSensitive=False,
                redacted=False
            )
        ],
        userTask="please finalize and send this off",
        telemetry=ClientTelemetry(
            domExtractionTimeMs=10.0,
            visionInferenceTimeMs=20.0,
            redactionTimeMs=4.0,
            totalClientTimeMs=34.0,
            backendUsed="wasm_simd",
            redactedElementCount=0,
            timestamp="2026-09-12T12:00:00Z"
        )
    )

    with pytest.raises(ValueError) as excinfo:
        await vlm_reasoner.reason(payload)
    assert "GEMINI_API_KEY environment variable is not set" in str(excinfo.value)

def test_metrics_service_telemetry_recording():
    metrics_service.record_request(
        client_latency_ms=42.0,
        server_latency_ms=858.0,
        backend_used="webgpu",
        redaction_boxes=[
            {"category": "aadhaar"},
            {"category": "password"}
        ]
    )
    snapshot = metrics_service.get_snapshot()
    assert snapshot["totalRequests"] >= 1
    assert snapshot["totalRedactionsPerformed"] >= 2
    assert snapshot["avgEndToEndLatencyMs"] > 0

def test_health_check_endpoint():
    from fastapi.testclient import TestClient
    from server.main import app
    client = TestClient(app)
    
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model" in data
    
    # Also test root health
    response_root = client.get("/health")
    assert response_root.status_code == 200
    assert response_root.json()["status"] == "healthy"
