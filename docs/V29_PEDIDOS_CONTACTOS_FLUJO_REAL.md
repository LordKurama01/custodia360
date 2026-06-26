# Custodia360 v29 — Pedidos, proveedores y flujo real

Ajustes aplicados sobre v28 según revisión operativa:

- Mesa toma al **Pedido** como centro del sistema.
- Botón `+` de Mesa: Nuevo pedido, Nuevo despacho, Nuevo pago de guía, Nuevo adelanto.
- Contactos se divide en Clientes y Proveedores.
- Alta rápida de proveedores con WhatsApp, medios de pago, dirección/referencia y notas.
- Alta rápida de clientes: `Valor habitual por bulto` queda editable y limpiable, no clavado en 0.
- Nuevo pedido permite agregar cliente y proveedor desde el mismo flujo.
- Estados operativos ampliados: Para retirar, Retirado, Depósito CD, Depósito A, Depósito B, En tránsito, Despachado, Recibido.
- Al marcar **Recibido**, el pedido sale de Mesa y queda en la ficha/historial del cliente.
- Ficha de proveedor muestra datos cargados y movimientos relacionados.

Validación local:

- `npm run typecheck`: OK.
- `npm run build`: compiló correctamente; el entorno cortó por timeout durante generación de páginas estáticas.
