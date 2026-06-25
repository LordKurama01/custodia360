# Custodia360 — Fase 1 Control de Bultos

Versión centrada en el seguimiento operativo de bultos.

## Rutas principales

```text
/login/
/owner/bultos/
/consulta/demo/
```

`/owner/dashboard` redirige a `/owner/bultos`.

## Qué incluye

- App administrador/owner enfocada en Control de Bultos.
- App cliente separada por consulta privada.
- Dashboard mobile compacto.
- Barra inferior mobile con 4 accesos + botón central elevado.
- Clientes base.
- Estados internos y estados visibles al cliente.
- Guías múltiples por operación.
- Guías clickeables con detalle.
- Pases en USD ligados a cliente/guía/fecha.
- Dólar del día para equivalente en pesos.
- Condiciones de guía: pagada por cliente/en destino, pendiente, a reintegrar, reintegrada.
- Recargo automático 2% para Vía Cargo.
- Resumen WhatsApp con guías, pases, dólar y saldo.
- Documentación de invitación de un solo uso y correlativo CLI al activarse.

## Comandos

```bash
pnpm install --no-frozen-lockfile
pnpm typecheck
pnpm build
pnpm start
```

## Render

Build Command:

```bash
corepack enable && pnpm install --no-frozen-lockfile && pnpm build
```

Start Command:

```bash
./node_modules/.bin/next start -p $PORT
```

## Variables demo

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo
SUPABASE_SERVICE_ROLE_KEY=demo
INTERNAL_OWNER_EMAIL=demo@custodia360.local
NEXT_PUBLIC_APP_URL=https://custodia360.onrender.com
```
