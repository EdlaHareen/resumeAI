# Primary models
HAIKU = "claude-haiku-4-5-20251001"
SONNET = "claude-sonnet-4-6"


def select_model(stage: int) -> str:
    """Return the model for this pipeline stage. Stages 1-2 use Haiku, 3+ use Sonnet."""
    return HAIKU if stage in (1, 2) else SONNET
