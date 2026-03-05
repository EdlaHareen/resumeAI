import os
import json
import time
from typing import Optional
import anthropic
import openai


_anthropic_client: Optional[anthropic.Anthropic] = None
_openai_client: Optional[openai.OpenAI] = None


def get_anthropic() -> Optional[anthropic.Anthropic]:
    global _anthropic_client
    if _anthropic_client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            _anthropic_client = anthropic.Anthropic(api_key=key)
    return _anthropic_client


def get_openai() -> Optional[openai.OpenAI]:
    global _openai_client
    if _openai_client is None:
        key = os.getenv("OPENAI_API_KEY", "")
        if key:
            _openai_client = openai.OpenAI(api_key=key)
    return _openai_client


def call_llm(
    prompt: str,
    model: str,
    system: str = "",
    max_tokens: int = 4096,
    retries: int = 2,
) -> str:
    """
    Call Claude or OpenAI based on model prefix.
    Returns the text content of the response.
    Raises RuntimeError if all attempts fail.
    """
    last_error: Optional[Exception] = None

    for attempt in range(retries + 1):
        try:
            if model.startswith("claude"):
                client = get_anthropic()
                if client is None:
                    raise RuntimeError("Anthropic API key not configured")
                msg = client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    system=system,
                    messages=[{"role": "user", "content": prompt}],
                )
                return msg.content[0].text

            elif model.startswith("gpt"):
                client = get_openai()
                if client is None:
                    raise RuntimeError("OpenAI API key not configured")
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})
                resp = client.chat.completions.create(
                    model=model,
                    max_tokens=max_tokens,
                    messages=messages,
                )
                return resp.choices[0].message.content or ""

            else:
                raise ValueError(f"Unknown model prefix: {model}")

        except Exception as e:
            last_error = e
            if attempt < retries:
                time.sleep(1.5 * (attempt + 1))

    raise RuntimeError(f"LLM call failed after {retries + 1} attempts: {last_error}")


def call_llm_json(
    prompt: str,
    model: str,
    system: str = "",
    max_tokens: int = 4096,
) -> dict:
    """Call LLM and parse JSON response. Strips markdown fences if present."""
    raw = call_llm(prompt, model, system, max_tokens)
    # Strip ```json ... ``` fences
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    return json.loads(text)
