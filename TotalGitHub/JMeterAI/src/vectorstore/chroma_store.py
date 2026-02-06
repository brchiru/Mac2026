import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

from typing import Optional

# Use embedded Chroma with DuckDB+Parquet for persistence
client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=".chromadb"))

# Use SentenceTransformer embedding helper (wrapped by Chroma utils)
ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")


def get_or_create_collection(name: str = "jmeter"):
    try:
        return client.get_collection(name)
    except Exception:
        return client.create_collection(name=name, embedding_function=ef)


def add_texts(collection, ids: list[str], texts: list[str], metadatas: Optional[list[dict]] = None):
    collection.add(ids=ids, documents=texts, metadatas=metadatas)


def query_collection(collection, query: str, n_results: int = 3):
    return collection.query(query_texts=[query], n_results=n_results)
