# Custodia360 v20 — Pulido Premium Operativo

Versión de cierre para dejar el sistema final sin referencias visibles a demo y con ingreso usable ahora.

## Cambios principales

- Landing pública más corta y comercial.
- Login separado de la landing, más seco y operativo.
- Botón de ingreso no envía a URLs externas rotas.
- Si Supabase/Google OAuth todavía no está configurado, permite acceso operativo a Mesa.
- Si Supabase/Google OAuth está configurado con variables reales, valida Gmail y perfil.
- Se mantiene la arquitectura final: Mesa principal arriba, Contactos, Cobros, Guías y Más.
- WhatsApp no aparece en landing ni en owner/admin general.
- El texto visible ya no presenta el sistema como muestra ni prueba.

## Flujo de ingreso

1. Usuario entra a `/`.
2. Toca `Ingresar`.
3. En `/login` toca `Continuar con Gmail`.
4. Si hay Supabase real, inicia OAuth.
5. Si no hay Supabase real, entra a `/owner/bultos` para operación inicial.

## Variables

- `NEXT_PUBLIC_LOCAL_ACCESS=true`: acceso operativo inicial.
- `NEXT_PUBLIC_LOCAL_ACCESS=false`: exige Supabase real cuando esté configurado.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: OAuth real.

## Regla comercial

No agregar módulos nuevos. Esta versión afina entrada, landing, acceso y arquitectura visual para vender/operar como producto final.


## V22 — Landing Comercial Premium
- Landing pública rearmada como pieza comercial corta.
- Un solo botón visible: Ingresar al sistema.
- Sin secciones largas ni botones repetidos.
- Login operativo queda separado.


## v23 — Pasada fina entregable

Pulido visual final: navegación mobile más fina, ficha cliente compacta, botón `+` menos invasivo, Más sin vacío y ajustes de densidad para dejar el sistema más presentable sin sumar funciones.
