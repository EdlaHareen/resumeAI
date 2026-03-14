import os
import json
import time
from typing import Optional
import anthropic
import openai


_anthropic_client: Optional[anthropic.Anthropic] = None
_anthropic_async_client: Optional[anthropic.AsyncAnthropic] = None
_openai_client: Optional[openai.OpenAI] = None


def get_anthropic() -> Optional[anthropic.Anthropic]:
    global _anthropic_client
    if _anthropic_client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            _anthropic_client = anthropic.Anthropic(api_key=key)
    return _anthropic_client


def get_anthropic_async() -> Optional[anthropic.AsyncAnthropic]:
    global _anthropic_async_client
    if _anthropic_async_client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key:
            _anthropic_async_client = anthropic.AsyncAnthropic(api_key=key)
    return _anthropic_async_client


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
    timeout: float = 90.0,
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
                    timeout=timeout,
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


async def call_llm_async(
    prompt: str,
    model: str,
    system: str = "",
    max_tokens: int = 4096,
) -> str:
    """Async LLM call using AsyncAnthropic — use this in FastAPI routes directly."""
    client = get_anthropic_async()
    if client is None:
        raise RuntimeError("Anthropic API key not configured")
    msg = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


def call_llm_json(
    prompt: str,
    model: str,
    system: str = "",
    max_tokens: int = 4096,
) -> dict:
    """Call LLM and parse JSON response. Strips markdown fences and extra text if present."""
    import re
    raw = call_llm(prompt, model, system, max_tokens)
    text = raw.strip()

    # Strip ```json ... ``` or ``` ... ``` fences
    if "```" in text:
        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if m:
            text = m.group(1).strip()

    # Find the start of the JSON object/array
    start = next((i for i, c in enumerate(text) if c in "{["), 0)
    text = text[start:]

    # 1st attempt: strict JSON via raw_decode (fastest, stops at first valid object)
    decoder = json.JSONDecoder()
    try:
        obj, _ = decoder.raw_decode(text, 0)
        return obj
    except json.JSONDecodeError:
        pass

    # 2nd attempt: json-repair handles unescaped quotes, trailing commas,
    # single-quoted keys, truncated output, and most other LLM JSON issues.
    try:
        from json_repair import repair_json
        repaired = repair_json(text, return_objects=True)
        if isinstance(repaired, (dict, list)):
            return repaired
    except Exception:
        pass

    # 3rd attempt: strip trailing commas then strict parse
    cleaned = re.sub(r',\s*([}\]])', r'\1', text)
    obj, _ = decoder.raw_decode(cleaned, 0)
    return obj
