# Custodia360 v35 — fix mobile + landing/login + desktop aislado

## Objetivo
Recuperar la experiencia mobile interna después de la regresión visual, mantener las mejoras de landing/login y aislar los ajustes desktop para que no afecten pantallas táctiles.

## Cambios clave

### Mobile interno
- Mobile vuelve a ser la base/default.
- Desktop queda aislado con media queries de escritorio real: `min-width: 1024px`, `hover: hover`, `pointer: fine`.
- Se corrigió overflow horizontal en Mesa, Contactos, Cobros, Guías y Más.
- Cards, filas, tabs, KPIs y sheets quedan contenidos dentro del viewport.
- Se agregó soporte para pantallas táctiles con viewport amplio mediante `pointer: coarse`.

### Landing
- Se mantiene layout full-screen aprobado.
- Se elimina el bloque de chips `Operación interna / Clientes`.
- Se reemplaza por línea informativa no clickeable: `Pedidos · Bultos · Guías · Cobros`.
- Se mejora fondo premium con textura y líneas sutiles.
- Se ajusta el corte del título en mobile.

### Login
- Login más compacto y privado.
- Menos texto repetido.
- Copy enfocado en acceso autorizado por Gmail.

### Configuración mobile
- La tabla desktop se mantiene para escritorio.
- En mobile se reemplaza por cards compactas para evitar cortes y columnas rotas.

## Archivos modificados
- `src/app/page.tsx`
- `src/app/home.module.css`
- `src/modules/auth/components/LoginView.tsx`
- `src/modules/auth/components/LoginView.module.css`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.module.css`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/app/globals.css`
- `src/app/(owner)/owner/configuracion/page.tsx`
- `src/app/(owner)/owner/configuracion/configuracion.module.css`

## Regla mantenida
Cambios por bloque, sin mezclar responsabilidades ni agregar módulos nuevos.
