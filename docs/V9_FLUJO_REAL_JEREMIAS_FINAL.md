# Custodia360 v9 — Flujo real Jeremías

Versión final de fase 1 orientada a digitalizar el trabajo real:

- El pizarrón físico pasa a ser **Mesa de control**.
- La planilla de cada cliente pasa a ser **Ficha cliente / planilla digital**.
- Cada cliente concentra movimientos, bultos, guías, pases, pagos, adelantos, movimientos especiales y WhatsApp.
- Las guías son ilimitadas por cliente/operación; desde estado Despachado se listan y cada una abre detalle completo.
- La landing queda simple: cliente consulta pedido por invitación/código; trabajadores entran al sistema.

## Flujo final

Cliente → Planilla digital → Movimientos → Guías → Pases USD → Cuenta corriente → Pagos parciales → WhatsApp.

## Pantallas clave

1. **Landing / ingreso**
   - Entrás, pedís y te despachamos.
   - Consultar pedido por código/invitación.
   - Ingreso trabajadores / equipo.
   - WhatsApp Jeremías: +54 9 3757 65-3075.

2. **Mesa de control**
   - Tablero general tipo pizarrón profesional.
   - Filas por cliente/movimiento.
   - Estado logístico, cuenta, guías y acciones.

3. **Ficha cliente / planilla digital**
   - Movimientos por fecha.
   - Cantidad/bultos, proveedor, empresa, guía, pase, estado.
   - Pases abiertos, pagos/adelantos y movimientos especiales.

4. **Cuenta corriente**
   - Pases pendientes.
   - Guías a reintegrar.
   - Pagos parciales.
   - Adelantos / pago proveedor / mercadería agotada.

5. **Guías clickeables**
   - Empresa, número de guía, remito/comprobante, fecha.
   - Destinatario, DNI/CUIT, destino/domicilio.
   - Valor declarado/real, total cliente, condición de pago.
   - Pase USD asociado y estado.

## Notas de arquitectura

- No se copia literal la planilla ni el pizarrón: se adapta el flujo real a UI profesional.
- Desktop = mesa de control + planilla de cliente.
- Mobile = app rápida con bottom nav, sin doble navegación.
- Formularios críticos abren en modales guiados por pasos.
- WhatsApp se genera desde la cuenta corriente.
