# Custodia360 v10 — Flujo operativo real

Versión enfocada en reorganizar el flujo de trabajo real de Jeremías sin copiar literalmente la planilla ni el pizarrón.

## Criterio central

- El pizarrón manual se transforma en **Mesa de control**.
- La planilla de cada cliente se transforma en **Ficha cliente / planilla digital**.
- La cuenta corriente conecta guías, pases, adelantos, pagos parciales y saldo.
- WhatsApp sale desde datos estructurados.

## Cambios principales

### Landing

- Landing simple: “Entrás, pedís y te despachamos.”
- Tres caminos: consultar pedido, hablar por WhatsApp, ingreso equipo.
- Cliente sin invitación puede consultar por WhatsApp.
- Cliente con invitación/código entra al portal.

### Mesa de control

- Pantalla de flujo más clara: cliente, etapa, cuenta, guías y acciones.
- Mobile admin con cards compactas.
- Acciones secundarias en bottom sheet / menú de acciones.
- Corrección de textos pegados en mobile.
- Botones principales reducidos: Ver, Cobrar y menú.

### Ficha cliente / planilla digital

- Cliente como centro del sistema.
- Tabla tipo planilla para movimientos por fecha.
- Movimientos, guías, pases, pagos y adelantos dentro del cliente.

### Cuenta corriente

- Soporte visual y demo para pagos parciales por pase/guía.
- Cada pase puede tener total, pagado y saldo.
- Registrar pago/adelanto puede aplicar monto parcial a una o varias guías.
- Si el pago no cubre el total, el pase queda parcial.

### Portal cliente

- Mucho más corto.
- Estado primero.
- Guías como lista compacta desplegable.
- Detalle de guía tocable.
- Cuenta actual separada y clara.
- Sin botón “+” para cliente.
- Bottom nav cliente: Inicio, Pedidos, Guías, Pagos, Ayuda.

### Guías clickeables

- Lista sin límite de guías.
- Cada guía muestra detalle: empresa, número, destinatario, DNI/CUIT, destino, condición, pase, pagado y saldo.

### WhatsApp

- WhatsApp operativo: +54 9 3757 65-3075.
- Usado para contacto de landing, portal cliente y resúmenes.

## Validación

- `npm run typecheck`: OK.
- `npm run build`: compila OK; en sandbox llegó a generación de páginas y finalización, pero el proceso fue cortado por timeout.
