import os
from typing import Tuple

# Primary models
HAIKU = "claude-haiku-4-5-20251001"
SONNET = "claude-sonnet-4-5"

# Fallback models
HAIKU_FALLBACK = "gpt-3.5-turbo"
SONNET_FALLBACK = "gpt-4o"


def get_models_for_stage(stage: int) -> Tuple[str, str]:
    """
    Returns (primary_model, fallback_model) for a pipeline stage.
    Stages 1-2 use Haiku, stages 3-4 use Sonnet.
    """
    has_claude = bool(os.getenv("ANTHROPIC_API_KEY", "").strip())
    has_openai = bool(os.getenv("OPENAI_API_KEY", "").strip())

    if stage in (1, 2):
        primary = HAIKU if has_claude else HAIKU_FALLBACK
        fallback = HAIKU_FALLBACK if has_openai else None
    else:
        primary = SONNET if has_claude else SONNET_FALLBACK
        fallback = SONNET_FALLBACK if has_openai else None

    return primary, fallback


def select_model(stage: int) -> str:
    """Return the best available model for this stage."""
    primary, fallback = get_models_for_stage(stage)
    return primary
