# JMeterAI

Local-first hybrid LLM for JMeter queries (ingest docs, build embeddings, run local LLM on Apple M5 with fallback to remote models).

Quick start

1. Activate venv:

   source .venv/bin/activate

2. Install dependencies (if not installed already):

   pip install -r requirements.txt

3. Set environment variables (see `.env.example`):

   cp .env.example .env
   edit `.env` (set MODEL_PATH to your ggml model or set OPENAI_API_KEY for remote fallback)

4. Run the API server:

   uvicorn src.api.main:app --reload --port 8000

Notes

- This project uses local embeddings (`sentence-transformers`) and a local LLM runtime via `llama.cpp`/`llama-cpp-python` as the primary model.
- You can optionally set up OpenAI keys to use a remote model for fallback or higher-quality responses.
