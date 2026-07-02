# Custodia360 v36.1 — Mobile premium cleanup

Aplicado sobre base v36 QA visual fix.

## Acciones rápidas / Mesa
- Se eliminó la grilla de estados dentro de `Acciones rápidas`.
- Ahora aparece un botón `Estado`.
- Al tocar `Estado`, abre una bottom sheet secundaria con la lista de estados.
- La lista indica si el estado mantiene el pedido activo o si sale de Mesa.
- Se mantiene confirmación antes del cambio de estado mediante la lógica existente.

Archivos:
- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`

## Contactos mobile
- Tabs `Clientes / Proveedores` más finos y menos verdes.
- Cards con más aire, contraste y jerarquía.
- Se reduce el efecto de MVP/plano.

Archivo:
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`

## Permisos mobile
- Hero más compacto: `Accesos y roles`.
- Formulario más limpio y menos gigante.
- Tablas desktop se mantienen en desktop.
- En mobile, allowlist y perfiles pasan a cards / empty states.
- Se evita que botones importantes queden tapados por bottom nav/footer.

Archivos:
- `src/modules/internalUsers/InternalUsersView.tsx`
- `src/modules/internalUsers/InternalUsersView.module.css`

## Dueños / Espacios operativos
- Se reemplazó la explicación larga de multi-dueño por una vista operativa.
- Nuevo concepto visible: `Espacios operativos`.
- Base central + aislamiento por espacio, sin explicar de más.
- Cupo comercial visible: `usados / incluidos`.
- Límite UI de espacios incluidos: 4.
- Si se supera el cupo, muestra `Solicitar autorización`.
- Cards de espacios simplificadas: clientes, choferes, operarios, cobros, solicitud y CTA.
- Se reduce protagonismo de `tenantId` a dato técnico secundario.

Archivos:
- `src/modules/platform/PlatformOwnersView.tsx`
- `src/modules/platform/PlatformOwnersView.module.css`

## Criterio
- Menos chips sin acción.
- Menos textos repetidos.
- Más resumen + acción.
- Mobile-first sin convertir todo en formulario largo.
- No se duplican instancias ni bases: una app y una Supabase central con aislamiento lógico por espacio.

## Validación local recomendada

```powershell
cd C:\Proyectos\custodia360
npm install
npm run typecheck
npm run build
git status
```

En este entorno no hay `node_modules`; el typecheck global falla por dependencias de Next/React no instaladas, no por el parche en sí.
