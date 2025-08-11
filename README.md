# SenseiBird v0.7 — Supabase (Auth + Cloud Stats)
- **Login** con Google/GitHub o email (magic link) en `/auth`.
- **Sync en la nube** de XP y racha en tabla `user_stats` (RLS).
- **DIP**: `IStatsRepo` + `SupabaseStatsRepo` + `LocalStatsRepo`; `ServicesProvider` sincroniza cuando hay sesión.

## Configuración
1. Crea un proyecto en Supabase.
2. Copia `.env.example` a `.env.local` y completa:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
3. En Supabase SQL, pega y ejecuta `supabase.sql` (tabla + RLS).
4. `npm i` y `npm run dev`.
5. Visita `/auth` para entrar y probar.

## Cómo funciona la sync
- Al iniciar sesión, se **fusiona** local↔nube (se toma el **máximo** de XP y racha).
- Al ganar XP o actualizar racha se **emite un evento** y se **guarda** en la nube.
