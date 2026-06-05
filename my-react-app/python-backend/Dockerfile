FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence-transformers
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV CARECONNECT_TEST_MODE=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

RUN python - <<'PY'
from sentence_transformers import SentenceTransformer

SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2",
    cache_folder="/app/.cache/sentence-transformers",
)
print("Downloaded sentence-transformers/all-MiniLM-L6-v2")
PY

COPY app ./app
COPY sample-data ./sample-data
COPY pytest.ini ./pytest.ini

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
