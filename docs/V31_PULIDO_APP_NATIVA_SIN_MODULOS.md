# Custodia360 v31 — Pulido app nativa sin módulos nuevos

## Objetivo
Pulir la experiencia existente para que Custodia360 se sienta como una aplicación mobile instalada, no como una web larga. No se agregaron módulos nuevos ni se cambió la estructura principal.

## Alcance aplicado
- Mesa
- Contactos
- Cobros
- Guías
- Más
- Formularios existentes
- Bottom sheets existentes
- Botón + contextual
- Footer Prestige
- Estilo mobile/PWA

## Cambios principales

### Experiencia mobile nativa
- Barra del navegador mobile oscura mediante `themeColor: #050B10`.
- Menos verde flúor global; el verde queda como acento de acción.
- Cards más compactas y con menos glow.
- Bottom sheets con handle superior, cierre tipo X y altura más controlada.
- Inputs, botones, labels y tabs más compactos.
- Ajustes de safe-area para no tapar acciones con bottom nav/footer.

### Botón + contextual
- Se blindó la apertura del sheet de acciones.
- En Más no aparece el botón +.
- Si una pantalla no tiene acciones válidas, no se abre sheet vacío.
- Se eliminó el acceso de “Acciones rápidas” desde Más que podía abrir un panel vacío.

### Alta rápida cliente/proveedor
- Se agregó acción “Seleccionar contacto” en alta rápida de cliente y proveedor.
- Usa Contact Picker API cuando el navegador lo permite.
- Si no está disponible, mantiene carga manual.
- Normaliza WhatsApp/teléfono cargado.
- Detecta duplicados por WhatsApp y reutiliza contacto existente.
- Si se crea o selecciona desde Nuevo pedido, vuelve al pedido y deja cliente/proveedor seleccionado.

### Formularios
- WhatsApp usa `type="tel"` e `inputMode="tel"`.
- Montos y bultos usan inputMode numérico/decimal.
- Valor habitual puede quedar vacío y no queda clavado visualmente en 0.
- Botón principal queda más operativo y menos pesado.

### Visual premium
- Footer Prestige más bajo y sobrio.
- Menos sombras y halos.
- Bordes más finos.
- Más densidad operativa en cards y listas.

## Validación
- `npm run typecheck`: OK.
- `npm run build`: compila correctamente, pero en este entorno queda cortado por timeout durante generación/collecting de páginas. No apareció error nuevo de código. Se mantiene warning conocido de Supabase en Edge Runtime.

## Archivos principales modificados
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/shared/components/ui.module.css`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.module.css`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`
