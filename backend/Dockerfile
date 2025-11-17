FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# instalar herramientas mínimas de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# crear un entorno virtual dentro del proyecto (mejor para non-root)
RUN python3 -m venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"

COPY requirements.txt .

RUN .venv/bin/pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim AS runner

WORKDIR /app

# crear usuario no-root
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# copiar el entorno virtual ya instalado
COPY --from=builder /app/.venv /app/.venv

# ajustar PATH para usar la venv
ENV PATH="/app/.venv/bin:$PATH"

COPY . .

# permisos
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
