from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

from src.llm.local import generate_local_answer

app = FastAPI(title="JMeterAI API")


class Query(BaseModel):
    question: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/query")
async def query(q: Query):
    """Simple query endpoint that tries the local LLM first."""
    try:
        answer = generate_local_answer(q.question)
    except Exception as exc:
        # Local model not available or error occurred
        answer = f"Local model not available: {exc}"
    return {"question": q.question, "answer": answer}
