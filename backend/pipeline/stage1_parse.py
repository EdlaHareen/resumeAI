from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE1_SYSTEM, STAGE1_PROMPT


def parse_resume(resume_text: str) -> dict:
    """
    Stage 1: Parse resume text into structured JSON.
    Returns structured resume dict with sections, bullets, etc.
    """
    model = select_model(1)
    prompt = STAGE1_PROMPT.format(resume_text=resume_text)
    result = call_llm_json(prompt, model, system=STAGE1_SYSTEM, max_tokens=4096)
    return result
