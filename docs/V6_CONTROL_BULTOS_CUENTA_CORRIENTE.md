# Custodia360 v6 — Control de Bultos + Cuenta Corriente

## Objetivo

Mantener Fase 1 enfocada en Control de Bultos, pero agregando la lógica operativa necesaria para no perder cobros:

Cliente → operación → bultos → guías → pases → cuenta corriente → pagos → WhatsApp.

No se agregan módulos fuera de alcance como IA, mapas, CRM, reportes avanzados ni finanzas complejas.

## Cambios principales v6

1. Mobile reordenado en pantallas cortas:
   - Seguimiento
   - Cuentas
   - + Nueva
   - Guías
   - Más

2. Cuenta corriente por cliente:
   - Pases pendientes.
   - Guías a reintegrar.
   - Movimientos especiales.
   - Historial de pagos.
   - WhatsApp generado desde la cuenta.

3. Cobro seleccionando pases:
   - Permite marcar exactamente qué pases paga el cliente.
   - Si el cliente tiene 10 pases y paga 5, se cierran esos 5 y quedan los demás pendientes.

4. Movimiento especial:
   - Pago a proveedor.
   - Adelanto de Jeremías.
   - Dinero recibido del cliente.
   - Mercadería agotada.
   - Devolución o aplicación a otra compra.

5. Separación visual entre:
   - Estado logístico.
   - Estado financiero / cuenta.

## Archivos tocados

- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`
- `src/modules/controlBultos/types.ts`
- `src/modules/controlBultos/services/controlBultos.service.ts`
- `src/modules/layout/owner-desktop/OwnerDesktopShell.tsx`

## Validación

- `npm run typecheck`: OK.
- `npm run build`: no se pudo completar en el sandbox por timeout durante `Creating an optimized production build`. No arrojó error de TypeScript antes del timeout.

## Nota para deploy

Mantener Render con:

- `NODE_VERSION=20`
- `NEXT_PUBLIC_DEMO_MODE=true`
- `npm install && npm run build`
- `./node_modules/.bin/next start -p $PORT`
