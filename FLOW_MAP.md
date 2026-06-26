# FLOW_MAP — Custodia360 v11

## Flujo recomendado
1. Landing pública.
2. Persona sin código: WhatsApp con mensaje para hacer pedido.
3. Cliente con link/código: portal privado.
4. Activación de cliente: asigna correlativo al activar, no al enviar link.
5. Admin abre Mesa de control.
6. Carga guiada: cliente → bultos/proveedor → guía → pase → confirmar.
7. Cuenta corriente: pase total, pagado, saldo, dinero a cuenta.
8. WhatsApp contextual desde landing, guía, pagos, ayuda o admin.

## Pantallas principales
- `/` Landing pública.
- `/login` Ingreso equipo.
- `/owner/bultos` Mesa operativa.
- `/consulta/[code]` Portal cliente privado.
- Legales públicas.

## Estados internos
- Para retirar.
- Retirado.
- Depósito CD.
- Depósito A.
- Depósito B.
- Despachado.

## Estados visibles cliente
- En preparación.
- En tránsito.
- Despachado.

## Acciones principales
- Nuevo movimiento.
- Nueva guía.
- Cobrar.
- Dinero a cuenta.
- Movimiento especial.
- WhatsApp.

## Fricciones corregidas
- Menos scroll.
- Menos botones visibles en mobile.
- Guía en modal/detalle.
- Pago parcial por saldo.
- Mensaje WhatsApp por contexto.
