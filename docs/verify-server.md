# Independent Verification: Server-Side AI & Network Round-Trip

This walkthrough explains how to independently verify that PRAHARI transmits sanitized visual/DOM payloads to a real reasoning server and executes real Vision-Language Model (VLM) inference.

---

## 1. Inspecting Live Network Traffic via Chrome DevTools

1. Open your browser to the demo portal: `http://localhost:8000/demo/index.html` (or `http://localhost:8000/`).
2. Open Chrome Developer Tools:
   - Right-click anywhere on the page and click **Inspect** (or press `Cmd + Option + I` on Mac).
   - Switch to the **Network** tab.
   - In the filter box, type `act` or filter by `Fetch/XHR`.
3. Open the **PRAHARI Sentinel Extension Popup**:
   - Right-click the PRAHARI extension icon in your toolbar and select **Inspect Popup** (this opens DevTools specifically for the extension background and UI).
   - In the extension DevTools, navigate to the **Network** tab.
4. Click **"Act"** in the PRAHARI popup.
5. In the Network tab, observe the live HTTP request:
   - **Endpoint**: `POST http://localhost:8000/api/v1/act`
   - **Status**: `200 OK`
   - **Payload**:
     - `sanitizedImageBase64`: Black-boxed & blurred JPEG payload (Zero-Trust verified).
     - `domTree`: Array of interactive nodes with bounding boxes and redacted markers.
     - `redactionBoxes`: List of shielded bounding coordinates.
     - `userTask`: The prompt instruction.
   - **Response**:
     ```json
     {
       "taskId": "task-...",
       "stepNumber": 1,
       "action": {
         "action": "click",
         "selector": "#confirmBtn",
         "thought": "The user wants to finalize and send off the application, which matches the button labeled 'Finish and send my application'."
       },
       "confidence": 0.96,
       "serverReasoningTimeMs": 842.15,
       "modelUsed": "google/gemini-1.5-flash",
       "status": "executing"
     }
     ```

---

## 2. Live Server Terminal Telemetry

When the server is running (`python3 server/main.py`), you will see live log streams for every inference pass:

```text
===========================================================================
[2026-09-13 10:15:30] [PRAHARI REASONING ENGINE] Incoming Task: "please finalize and send this off"
[2026-09-13 10:15:30] Backend Configured: GEMINI | DOM Nodes: 18 | Redacted Regions: 3
===========================================================================

[PRAHARI -> GEMINI API] Outbound Request to model: gemini-1.5-flash
[PRAHARI -> GEMINI API] Visual payload size: 148202 bytes

[GEMINI API -> PRAHARI] Raw Model Response:
{
  "action": "click",
  "selector": "#confirmBtn",
  "thought": "The user requested to finalize and send off the application. The button #confirmBtn has aria-label 'Finish and send my application' which matches this goal."
}

[2026-09-13 10:15:31] [PRAHARI VLM SUCCESS] Model: google/gemini-1.5-flash | Latency: 842.15ms
```

---

## 3. Extension UI Proof (Server Reasoning Card)

The PRAHARI popup features a dedicated **"SERVER REASONING ENGINE"** section displaying:
- **Status**: `ONLINE` with green verified indicator.
- **AI Model**: Real version returned by provider (e.g. `google/gemini-1.5-flash` or `openai/gpt-4o-mini`).
- **VLM Inference Latency**: Exact execution time measured from the remote API.
- **Network RTT**: Measured end-to-end client-server round-trip time.
- **Inspect Action JSON**: Interactive toggle to inspect raw Pydantic-validated JSON.
