from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE1_SYSTEM, STAGE1_PROMPT


def _ensure_ids(parsed: dict) -> dict:
    """
    Guarantee every entry has an entry_id and every bullet has a bullet_id.
    The LLM is prompted to include them, but sometimes omits them.
    IDs follow the format: entry_id = "si_ei", bullet_id = "si_ei_bi".
    """
    for si, section in enumerate(parsed.get("sections", [])):
        for ei, entry in enumerate(section.get("entries", [])):
            if not entry.get("entry_id"):
                entry["entry_id"] = f"{si}_{ei}"
            for bi, bullet in enumerate(entry.get("bullets", [])):
                if not bullet.get("bullet_id"):
                    bullet["bullet_id"] = f"{si}_{ei}_{bi}"
    return parsed


def parse_resume(resume_text: str) -> dict:
    """
    Stage 1: Parse resume text into structured JSON.
    Returns structured resume dict with sections, bullets, etc.
    """
    model = select_model(1)
    prompt = STAGE1_PROMPT.format(resume_text=resume_text)
    result = call_llm_json(prompt, model, system=STAGE1_SYSTEM, max_tokens=4096)
    return _ensure_ids(result)
