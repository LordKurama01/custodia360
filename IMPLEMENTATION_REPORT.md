# Implementación v20

## Entregado

- Landing pública compacta: menos texto, CTA único `Ingresar`.
- Login limpio: no duplica la landing.
- Acceso operativo inicial: no redirige a `demo.supabase.co` ni queda bloqueado si falta OAuth.
- Middleware ajustado: si la autenticación real no está conectada, deja entrar a la app operativa.
- `.env.example` actualizado con `NEXT_PUBLIC_LOCAL_ACCESS`.
- Archivo `ACCESO_OPERATIVO.md` agregado.
- Archivo de modo demo visible removido.

## Validación

- `npm install`: OK.
- `npm run typecheck`: OK.
- `npm run build`: compila OK; el entorno cortó por timeout en `Collecting page data`, igual que versiones anteriores.

## Pendiente real

Cuando se conecte Supabase definitivo:

1. Configurar `NEXT_PUBLIC_SUPABASE_URL` real.
2. Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY` real.
3. Configurar Google OAuth en Supabase.
4. Poner `NEXT_PUBLIC_LOCAL_ACCESS=false`.
5. Cargar usuarios/perfiles reales por tenant.
