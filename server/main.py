"""
PRAHARI Backend Application Entrypoint
FastAPI server providing REST and WebSocket channels for reasoning over sanitized browser state.
"""

import os
import sys

# Ensure both server dir and monorepo root are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from server.config import settings
from server.api.routes import router as api_router

from starlette.requests import Request
from starlette.responses import Response

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Privacy-Preserving On-Device Visual Perception Reasoning Server for ISRO SIH #26171"
)

# Enable CORS for Chrome Extension background & content scripts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        origin = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
        
    response = await call_next(request)
    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="") # Expose /metrics and /health at root as well

# Mount the portal explicitly at /demo for the extension/demo workflow.
demo_dir = os.path.abspath(os.path.join(PROJECT_ROOT, "demo"))
if os.path.exists(demo_dir):
    app.mount("/demo", StaticFiles(directory=demo_dir, html=True), name="demo")

@app.websocket("/ws/agent")
async def websocket_agent_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"PRAHARI Stream Connected: {len(data)} bytes received")
    except WebSocketDisconnect:
        pass

# Serve the identical portal directly from the API server root.  This mount is
# intentionally last, so the API and WebSocket routes above retain precedence.
if os.path.exists(demo_dir):
    app.mount("/", StaticFiles(directory=demo_dir, html=True), name="portal")

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
