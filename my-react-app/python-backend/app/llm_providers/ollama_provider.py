import os

import requests


OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MODEL_NAME = "deepseek-r1:1.5b"


class OllamaProviderError(Exception):
    pass


def generate_grounded_answer(prompt: str) -> str:
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise OllamaProviderError(str(exc)) from exc

    payload = response.json()
    answer = payload.get("response")

    if not answer:
        raise OllamaProviderError("Ollama returned an empty response.")

    return answer.strip()