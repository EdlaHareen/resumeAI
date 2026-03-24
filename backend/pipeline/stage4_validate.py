from __future__ import annotations
import json
from typing import Optional
from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE4_SYSTEM, STAGE4_PROMPT


def validate_rewrites(resume_structured: dict, rewrites: dict, jd_analysis: dict | None = None) -> dict:
    """
    Stage 4: Check rewritten bullets for hallucinations.
    Returns dict mapping bullet_id -> {"verdict": "accept"|"revert", ...}
    Any bullet flagged as fabricated is automatically reverted.
    jd_tools from jd_analysis are whitelisted — intentional injections are not flagged.
    """
    model = select_model(4)
    jd_tools = (jd_analysis or {}).get("jd_tools", [])

    # Build comparison list
    comparisons = []
    for section in resume_structured.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                if bid in rewrites and rewrites[bid]["tailored"] != bullet["text"]:
                    comparisons.append({
                        "bullet_id": bid,
                        "original": bullet["text"],
                        "tailored": rewrites[bid]["tailored"],
                    })

    if not comparisons:
        return {}

    prompt = STAGE4_PROMPT.format(
        jd_tools=json.dumps(jd_tools, indent=2),
        comparison_json=json.dumps(comparisons, indent=2),
    )

    result = call_llm_json(prompt, model, system=STAGE4_SYSTEM, max_tokens=4096)

    verdicts = {}
    for item in result.get("results", []):
        verdicts[item["bullet_id"]] = item
    return verdicts
