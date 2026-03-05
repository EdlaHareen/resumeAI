import json
from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE4_SYSTEM, STAGE4_PROMPT


def validate_rewrites(resume_structured: dict, rewrites: dict) -> dict:
    """
    Stage 4: Check rewritten bullets for hallucinations.
    Returns dict mapping bullet_id -> {"verdict": "accept"|"revert", ...}
    Any bullet flagged as fabricated is automatically reverted.
    """
    model = select_model(4)

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
        comparison_json=json.dumps(comparisons, indent=2)
    )

    result = call_llm_json(prompt, model, system=STAGE4_SYSTEM, max_tokens=4096)

    verdicts = {}
    for item in result.get("results", []):
        verdicts[item["bullet_id"]] = item
    return verdicts
