# Custodia360 v36 QA visual aplicado

Versión generada sobre el ZIP de contexto `custodia360-v36-context-20260702-002648.zip`.

## Archivos modificados

- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.tsx`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.module.css`
- `src/app/home.module.css`
- `src/modules/auth/components/LoginView.module.css`

## Cambios aplicados

### Mesa / dashboard operativo

- Corregido el riesgo de solapamiento desktop entre tabla principal y panel `Ficha rápida`.
- La grilla desktop ahora contiene la tabla con `minmax(0, 1fr)` y panel lateral con ancho controlado.
- La tabla usa `overflow-x: auto` dentro de su propio contenedor, sin invadir el panel derecho.
- La columna `Acciones` queda contenida y compactada.
- Mobile queda blindado: `tableShell` y `desktopDetail` siguen ocultos en mobile/coarse pointer.

### Sidebar

- Los grupos/módulos `future` / `EN CONSTRUCCIÓN` dejaron de renderizarse en el menú visible.
- No se muestra `stand-by` ni `En construcción` al usuario.
- Las rutas y archivos no se borraron; solo se ocultaron del sidebar.

### Verde/acento

- Se bajó el uso del verde neón en textos secundarios, acciones de fila y detalles.
- El verde fuerte queda reservado para CTA principal/tab activo/acción principal.
- Estados como `Despachado` y `Depósito A` conservan color propio, pero menos saturado.

### KPI cards

- `Pendiente`, `Reintegrar` y `A cuenta` ahora tienen ícono.
- Se reforzó contraste de fondo y borde sin agrandar demasiado las cards.

### Selector “Negocio activo”

- El `<select>` mantiene comportamiento nativo.
- Se agregó affordance visual de dropdown: flecha, hover, borde y cursor.

### Landing

- Se redujo el aire muerto superior del hero.
- El preview derecho quedó más integrado y menos “card pegada de dashboard”.
- Se bajó saturación del verde en textos secundarios.
- Las cards inferiores tienen mejor contraste.

### Login

- Se centró verticalmente el contenido principal.
- Se mantuvo compacto, como acceso privado/cerradura, sin convertirlo en segunda landing.

## Validación ejecutada

- `npm ci --ignore-scripts`: OK, con warning de engine porque el proyecto pide Node 20.x y el entorno ejecutó Node 22.16.0.
- `npm run typecheck`: OK.
- `npm run build`: compiló correctamente, pero el proceso quedó colgado durante `Generating static pages (0/13)` en este entorno y fue cortado por timeout. Antes de eso, Next reportó `Compiled successfully`. Warning existente: Supabase usa `process.version` en middleware Edge.

## Próximo test recomendado

1. Abrir `/owner/bultos#seguimiento` en desktop.
2. Verificar que tabla y `Ficha rápida` no se pisan.
3. Verificar que columna `Acciones` queda visible.
4. Verificar que no aparecen módulos `EN CONSTRUCCIÓN` en sidebar.
5. Probar mobile con ancho real de celular.
6. Verificar landing `/` y login `/login`.
