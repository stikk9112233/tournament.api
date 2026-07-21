# Production Dockerfile for backend (FastAPI + Uvicorn)
# Path: backend/Dockerfile
FROM python:3.10-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
# system deps
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
# copy requirements and install
COPY COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
# copy app
COPYCOPY . /app
EXPOSE 8000
# Use shell form so $PORT is expanded; fall back to 8000 if not provided
CMD ["sh","-c","uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
