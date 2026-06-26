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

## v12 — Flujo final recomendado

### Admin / Jeremías

1. Abre Mesa de control.
2. Ve pendientes y próxima acción.
3. Usa `Ctrl + K` para buscar cliente/guía o crear acción.
4. Selecciona cliente.
5. Abre drawer/ficha rápida.
6. Carga movimiento, guía, pago o dinero a cuenta con stepper.
7. Envía WhatsApp contextual.

### Cliente

1. Sin código: queda en landing y consulta por WhatsApp.
2. Con invitación: entra a visor privado.
3. Ve únicamente estado actual, fecha/hora, guías, saldo visible y ayuda.
4. Historial de estados queda oculto y se abre solo si lo toca.
5. Cada guía abre detalle privado en modal.

### Multi-dueño

- Jeremías/Super Owner puede crear y entrar a espacios.
- Cada dueño opera con datos aislados.
- Otros dueños no crean dueños ni ven datos ajenos.
- Todo registro real debe filtrar por `tenant_id`.
