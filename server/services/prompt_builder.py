"""
PRAHARI Redaction-Aware Prompt Synthesizer
Constructs structured VLM prompts that explicitly interpret redacted visual regions
so the reasoning engine treats masked boxes as intentional private inputs rather than missing elements.
"""

import sys
import os

# Ensure shared schemas are accessible
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from shared.schemas import SanitizedPayload

def build_redaction_aware_prompt(payload: SanitizedPayload) -> str:
    """
    Constructs a detailed prompt describing the user task, DOM structure, and masked regions.
    """
    # 1. Summarize Redacted Regions
    redaction_summary = []
    for box in payload.redactionBoxes:
        selector_info = f" (Selector: {box.domSelector})" if box.domSelector else ""
        redaction_summary.append(
            f"- Region ID [{box.id}]: Category={box.category.upper()}, Method={box.method}, "
            f"BBox=[x:{box.bbox.x}, y:{box.bbox.y}, w:{box.bbox.width}, h:{box.bbox.height}]{selector_info}"
        )

    redaction_text = "\n".join(redaction_summary) if redaction_summary else "No sensitive regions detected on this screen."

    # 2. Format Interactive DOM Elements
    interactive_nodes = []
    for node in payload.domTree[:40]:  # Cap to top 40 relevant nodes
        if node.isInteractive or node.isSensitive:
            status = f"[REDACTED {node.redactionCategory.upper()}]" if node.redacted and node.redactionCategory else "CLEAN"
            label = node.ariaLabel or node.placeholder or node.name or node.sanitizedText or ""
            interactive_nodes.append(
                f"- <{node.tagName} type='{node.inputType or ''}' role='{node.role or ''}'> "
                f"Selector: `{node.selector}` | Label: '{label}' | Status: {status} | BBox: [x:{node.bbox.x}, y:{node.bbox.y}]"
            )

    dom_text = "\n".join(interactive_nodes) if interactive_nodes else "No interactive elements found."

    # 3. Assemble Full System + Context Prompt
    prompt = f"""You are PRAHARI, an intelligent browser automation reasoning engine.
Your objective is to help the user complete their goal: "{payload.userTask}" on the current web page ("{payload.pageTitle}" at {payload.tabUrl}).

=== PRIVACY SHIELD & REDACTION CONTEXT ===
This screenshot has been sanitized on-device by PRAHARI's local vision engine before transmission.
All sensitive data (passwords, credit cards, Aadhaar, PAN, emails, phone numbers, faces) has been blacked out or blurred locally to protect user privacy.

Active Redacted Regions:
{redaction_text}

CRITICAL RULES FOR REASONING OVER REDACTED CONTENT:
1. Treat solid black boxes and blurred regions as VALID FORM INPUTS whose values are withheld for privacy.
2. DO NOT hallucinate or guess withheld secrets.
3. If an action requires interacting with a redacted input (e.g. clicking a masked password field or submitting the form), you may safely target its CSS selector.
4. Always emit ONLY a single valid JSON object strictly matching the schema below.

=== INTERACTIVE DOM ELEMENTS ON PAGE ===
{dom_text}

=== REQUIRED JSON OUTPUT SCHEMA ===
```json
{{
  "action": "click" | "type" | "scroll" | "wait" | "done",
  "selector": "<css_selector_of_target_element>",
  "value": "<text_to_type_if_action_is_type>",
  "scrollDirection": "down" | "up" | "top" | "bottom",
  "thought": "<brief 1-sentence reasoning for why this action was chosen>",
  "isRisky": true | false,
  "riskReason": "<reason if this action triggers form submission or financial transfer>"
}}
```

Respond ONLY with the JSON code block.
"""
    return prompt.strip()
