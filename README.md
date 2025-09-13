# SenseiBird v0.8 — Local + FastAPI
- Autenticación de Supabase eliminada. Modo invitado por ahora.
- Sincronización en la nube removida; se usa almacenamiento local.
- Se añadió scaffold de backend FastAPI en `backend/` con SQLite.

## Configuración
1. Crea `.env.local` con:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
2. Backend (FastAPI): ver `backend/README.md` para instalar y arrancar.
3. Frontend: `npm i` (si cambiaste deps) y `npm run dev`.

## Notas
- El `middleware` ya no verifica sesión.
- La UI de `/auth` muestra aviso de migración a FastAPI.
- Próximo paso: reemplazar `LocalStatsRepo` por llamadas a FastAPI (`/stats/{uid}`).
