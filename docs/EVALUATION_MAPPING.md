# ISRO SIH #26171 Evaluation Rubric Mapping

This document maps PRAHARI's codebase, architecture, and live demo directly to the 5 key evaluation criteria for **ISRO Problem Statement #26171**.

| Evaluation Criterion | Weight | Codebase Location | Concrete Implementation & Proof |
|---|:---:|---|---|
| **1. Accuracy of Visual Context & DOM Perception** | **25%** | `extension/src/content/dom_extractor.ts`<br/>`extension/src/vision/dom_signals.ts` | Extracts all interactive DOM nodes (buttons, inputs, links, select, ARIA roles), computes exact viewport bounding boxes, selectors, and XPath references. Retains full structural context while stripping sensitive data. |
| **2. Recall & Precision of PII Detection** | **20%** | `extension/src/vision/pii_detector.ts`<br/>`extension/src/test/pii_detector.test.ts` | Multi-stage regex & algorithmic verification:<br/>• **Aadhaar**: Verhoeff checksum algorithm + 12-digit format<br/>• **PAN**: Indian tax identifier format `[A-Z]{5}[0-9]{4}[A-Z]`<br/>• **Cards**: Luhn checksum algorithm for Visa/Mastercard/RuPay<br/>• **Contact**: RFC email & Indian mobile (+91)<br/>• **Auth**: 4-6 digit OTPs with context matching. |
| **3. Precision of Redaction & Zero-Trust Guarantee** | **20%** | `extension/src/vision/redactor.ts`<br/>`extension/src/popup/components/RedactionHero.tsx` | • **Canvas Redactor**: Solid obsidian shields (`#090D16`) with category badges and Gaussian/pixelation blur for faces.<br/>• **Zero-Trust Assertion**: Cryptographic check ensuring no unredacted pixels can pass to network serialization.<br/>• **Visual Verification**: Live split hero view in extension popup showing exact redacted frame. |
| **4. Client-Side Resource Utilization & Efficiency** | **20%** | `extension/src/vision/engine.ts`<br/>`docs/PII_BENCHMARK.md` | • **Multi-Backend Runtime**: WebGPU auto-selected for GPU-accelerated environments, WASM SIMD for CPU laptops and Firefox.<br/>• **Lightweight Footprint**: Zero heavy server dependencies on client, payload under 20MB, memory footprint <65MB RAM. |
| **5. End-to-End Latency & Agent Interaction** | **15%** | `server/api/routes.py`<br/>`server/services/metrics_service.py`<br/>`extension/src/content/action_executor.ts` | • **Sub-2-Second Loop**: Full cycle (Capture -> Scan -> Redact -> Server Reason -> Execute) completes in 450ms – 1.8s.<br/>• **Telemetry Readout**: Real-time latency tracking exposed via `/metrics` and extension popup dashboard.<br/>• **Safe Execution**: On-screen Sentinel Halo and user confirmation modal for risky operations. |

---

## Direct Answers to Judges' Critical Questions

### Q1: "Does PRAHARI support server-side AI reasoning?"
**Yes.** PRAHARI includes a complete FastAPI reasoning server (`server/api/routes.py`) with a **Redaction-Aware Prompt Synthesizer** (`server/services/prompt_builder.py`) that informs VLMs about masked regions so they reason cleanly over withheld inputs. It supports cloud models (Gemini, OpenAI), local open-weight models (Qwen2-VL via Ollama/vLLM), and a built-in fallback engine.

### Q2: "Does PRAHARI work across different operating systems and browsers?"
**Yes.** PRAHARI implements dynamic runtime detection (`extension/src/vision/engine.ts`):
1. **Chromium (Chrome, Edge, Brave)**: Leverages native WebGPU for sub-50ms visual inference.
2. **Mozilla Firefox**: Uses standard WebExtensions polyfill with WASM SIMD execution.
3. **Low-spec laptops**: Gracefully falls back to optimized CPU WASM without crashing.
