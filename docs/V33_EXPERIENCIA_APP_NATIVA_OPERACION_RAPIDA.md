# Custodia360 v33 — Experiencia app nativa y operación rápida

## Criterio de alcance

No se agregaron módulos nuevos ni se movió la estructura principal. La versión mejora recursos de uso sobre bloques existentes:

- Mesa
- Cards mobile
- Acciones rápidas
- Estados/chips
- Bottom sheets
- Feedback visual/táctil
- Safe-area mobile

## Bloques tocados

| Bloque | Archivo |
|---|---|
| Helpers UI/operativos de Mesa | `src/modules/controlBultos/lib/operationUi.ts` |
| Vista y conexión de acciones | `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx` |
| Estilos app/mobile | `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css` |

## Mejoras aplicadas

- Chips de estado con icono/identificador corto además de color.
- Mini progreso del pedido dentro de la card mobile.
- Swipe/touch en cards mobile para revelar acciones rápidas.
- Acciones rápidas más contextuales: editar, guía, cobro, WhatsApp, ficha, link, a cuenta, extra.
- Botón de actualización visual tipo app.
- Skeleton loading para evitar pantalla muerta mientras carga.
- Toasts más flotantes en mobile, con autocierre.
- Microfeedback háptico con `navigator.vibrate` cuando el navegador lo permite.
- Empty state de Mesa más accionable.
- Mantiene footer/nav/FAB sin agregar secciones nuevas.

## Validación

- `npm run typecheck`: OK.
- `npm run build`: compila OK; en este entorno corta por timeout durante `Generating static pages`, sin error nuevo de código. Se mantiene warning conocido de Supabase Edge Runtime.
