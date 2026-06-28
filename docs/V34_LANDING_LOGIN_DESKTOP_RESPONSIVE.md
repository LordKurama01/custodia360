# Custodia360 v34 — landing/login y desktop responsive operativo

## Criterio
- Mobile-first se mantiene.
- La app interna mobile no se cambia.
- Landing y login se mejoran en mobile y desktop por separado.
- Desktop deja de sentirse como mobile estirado y usa la misma lógica operativa por pantallas: Mesa, Contactos, Cobros, Guías y Más.
- Cambios por bloques: landing, login, shell desktop e interior operativo.

## Bloques modificados
- `src/app/page.tsx`
- `src/app/home.module.css`
- `src/modules/auth/components/LoginView.tsx`
- `src/modules/auth/components/LoginView.module.css`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.module.css`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`

## Landing
- Hero full-screen.
- Botón `Ingresar` chico arriba.
- Mobile más limpio, sin tarjetón central.
- Desktop con preview operativo lateral.
- Legal y footer Prestige se mantienen.

## Login
- Acceso privado más sólido.
- Mobile con flujo simple.
- Desktop con copy institucional + card de ingreso.
- Sigue usando Gmail autorizado.

## Desktop interior
- Shell desktop más compacto y profesional.
- Sidebar más liviana.
- Contenido con ancho máximo.
- Tabs operativos visibles también en desktop para mantener la lógica de mobile.
- Mesas, contactos, cobros, guías y más con mejor densidad, menos padding y mejor lectura.
- Botón + sigue contextual; en desktop queda arriba, no como FAB mobile.

## Validación
- No se agregaron módulos nuevos.
- No se tocó la app interna mobile salvo landing/login.
- No se cambió la lógica de datos.
- Los cambios quedaron separados por bloque visual/responsive.
