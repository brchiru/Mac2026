from sentence_transformers import SentenceTransformer

_model = None


def get_model(name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(name)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    # sentence-transformers returns numpy arrays; convert to lists for serialization
    return embeddings.tolist()
