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


## V22 — Landing Comercial Premium
- Landing pública rearmada como pieza comercial corta.
- Un solo botón visible: Ingresar al sistema.
- Sin secciones largas ni botones repetidos.
- Login operativo queda separado.


## v23 — Pasada fina entregable

Pulido visual final: navegación mobile más fina, ficha cliente compacta, botón `+` menos invasivo, Más sin vacío y ajustes de densidad para dejar el sistema más presentable sin sumar funciones.

## v25 — Pulido visual senior final

- Se corrigió el halo/ring visual del botón central Mesa.
- Se bajó intensidad del verde en navegación, FAB, tabs y botones.
- Se alinearon mejor íconos y estados del bottom nav.
- Se ajustaron cards, paneles, ficha cliente y módulos para una entrega más fina.
- No se agregaron funciones nuevas.
