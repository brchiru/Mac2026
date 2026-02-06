#!/usr/bin/env bash
# Start development server
set -e

. .venv/bin/activate
uvicorn src.api.main:app --reload --port 8000
