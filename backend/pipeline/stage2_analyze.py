from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE2_SYSTEM, STAGE2_PROMPT


def analyze_jd(jd_text: str) -> dict:
    """
    Stage 2: Analyze job description, extract ATS keywords and requirements.
    Returns JD analysis dict.
    """
    model = select_model(2)
    prompt = STAGE2_PROMPT.format(jd_text=jd_text)
    result = call_llm_json(prompt, model, system=STAGE2_SYSTEM, max_tokens=2048)
    return result
