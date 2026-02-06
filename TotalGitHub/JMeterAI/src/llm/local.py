"""Local LLM wrapper using llama-cpp-python"""
import os

try:
    from llama_cpp import Llama
except Exception:  # pragma: no cover - optional dependency
    Llama = None


def generate_local_answer(prompt: str, model_path: str | None = None, max_tokens: int = 256) -> str:
    """Run the local LLM (llama.cpp) and return generated text.

    Raises RuntimeError if llama-cpp-python isn't installed or no model is provided.
    """
    if Llama is None:
        raise RuntimeError("llama-cpp-python not installed (pip install llama-cpp-python)")

    if model_path is None:
        model_path = os.getenv("MODEL_PATH")

    if not model_path or not os.path.exists(model_path):
        raise RuntimeError("No local model found. Set MODEL_PATH env var to a ggml model file")

    llm = Llama(model_path=model_path)
    resp = llm(prompt=prompt, max_tokens=max_tokens)
    # llama-cpp returns a dict with choices
    return resp.get("choices", [{}])[0].get("text", "")
