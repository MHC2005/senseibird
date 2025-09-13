# FastAPI Backend (Local)

Este backend provee endpoints locales con FastAPI y SQLite para reemplazar Supabase.

## Requisitos
- Python 3.10+
- pip / venv

## Instalación
```bash
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

## Ejecutar
```bash
uvicorn app.main:app --reload --port 8000
```

## Endpoints
- GET `/health` → `{ status: "ok" }`
- GET `/stats/{uid}` → Obtiene `{ xp, streak }` (crea fila si no existe)
- POST `/stats/{uid}` → Guarda `{ xp, streak }`

## Notas de integración Frontend
- Configura `NEXT_PUBLIC_API_BASE_URL` (ej: `http://localhost:8000`).
- Reemplaza llamadas a Supabase por `fetch` a estos endpoints.
- Autenticación se implementará en FastAPI más adelante (tokens/JWT).
