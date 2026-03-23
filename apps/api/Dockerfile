# Build context: repo root (to access packages/)
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy monorepo packages
COPY packages/adapter /app/packages/adapter
COPY packages/orchestrator /app/packages/orchestrator

# Copy API source
COPY apps/api /app/apps/api

# Install local packages
RUN pip install -e /app/packages/adapter && \
    pip install -e /app/packages/orchestrator

# Non-root user
RUN useradd -m -u 1000 agora && chown -R agora:agora /app
USER agora

WORKDIR /app/apps/api
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
