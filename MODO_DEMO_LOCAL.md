# Custodia360 - Modo demo local

Este ZIP incluye un modo demo para mostrar el sistema sin configurar Supabase ni Google Auth.

## Levantar local

```powershell
cd C:\Proyectos\custodia360
copy .env.local.demo .env.local
npm install
npm run dev
```

Abrir:

- Login demo: http://localhost:8787/login/
- Control de Bultos: http://localhost:8787/owner/bultos/
- Portal cliente demo: http://localhost:8787/consulta/demo/

## Produccion real

Para usar Supabase real:

1. Cambiar `NEXT_PUBLIC_DEMO_MODE=false` en `.env.local` o en variables del deploy.
2. Cargar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
3. Ejecutar el SQL de `supabase/migrations/20260624_phase1_control_bultos.sql`.
4. Configurar Google Auth en Supabase.

En modo demo, los cambios del módulo se guardan solo en el navegador con `localStorage`.
