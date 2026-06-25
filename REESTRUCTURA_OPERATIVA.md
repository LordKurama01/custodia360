# Custodia360 — Reestructura operativa Control de Bultos

## Modelo principal

El sistema queda ordenado así:

Cliente principal → Operación / pedido → Bultos → Guías / destinos → Pases USD → Pagos → Resumen WhatsApp → Portal cliente.

Ejemplo: Estela puede comprar 5 teléfonos y enviarlos a 5 personas distintas. La operación es una sola, pero puede tener varias guías. Cada guía funciona como número de pedido/seguimiento del cliente para ese destino.

## Estados internos y estados cliente

Estados internos owner/empleado:

- Para retirar
- Retirado
- Depósito CD
- Depósito A
- Depósito B
- Despachado

Depósito CD significa Ciudad del Este, pero la UI operativa muestra “Depósito CD”.

Mapeo visible para cliente:

- Para retirar / Retirado / Depósito CD → En preparación
- Depósito A / Depósito B → En tránsito
- Despachado → Despachado

## Guías

Cada operación puede tener varias guías. Cada guía puede tener:

- número de guía / pedido cliente
- empresa de transporte
- destinatario final
- DNI / número de identidad
- destino / instrucción
- valor real de guía
- valor cobrado al cliente
- estado de pago
- fecha de despacho

Empresas previstas:

- Vía Cargo
- Buspack
- Crucero Express
- Correo Argentino
- Otro

Vía Cargo aplica recargo automático del 2% sobre el valor real de la guía. Se guardan costo real y total cobrado.

Si la guía la paga el cliente al retirar, queda como “paga en destino / cliente” y no suma al saldo de Gere/Jeremías.

## Pases

El pase se carga en USD y pertenece al cliente. Puede variar libremente según bulto, cantidad, día, vendedor o acuerdo comercial.

Cada pase puede quedar asociado operativamente a guías, pero el saldo se muestra por cliente.

El equivalente en pesos se calcula con el dólar vigente del día. En demo se usa dólar $1500.

Ejemplo:

- Pase USD 100 con dólar 1500 = $150.000
- Si paga otro día con dólar 1600 = $160.000

## Portal cliente

El cliente entra por link privado/código revocable, no por Gmail.

El cliente ve:

- pedidos activos
- estado simplificado
- guías clickeables
- destinatarios
- pases pendientes en USD
- equivalente en pesos del día
- pagos visibles

## WhatsApp

La ficha operativa genera un resumen listo para copiar y enviar por WhatsApp con:

- pedido
- estado visible
- dólar del día
- pases pendientes USD
- equivalente en pesos
- guías / pedidos
- aclaración de guías pagadas en destino

## WhatsApp — condición de la guía

En el resumen de WhatsApp cada guía debe aparecer siempre con su condición económica:

- Si la guía ya fue pagada por el cliente o se paga en destino: mostrar “Guía pagada por el cliente / en destino” y el valor de referencia, pero no sumarla al saldo.
- Si la guía no fue pagada: mostrar el valor pendiente, por ejemplo “Guía no pagada / pendiente: $57.000 — Buspack”.
- Si Jeremías/Gere pagó la guía: mostrar “Guía pagada por Jeremías, a reintegrar” y sumarla al saldo.
- Si fue reintegrada: mostrar “Guía reintegrada”.

El mensaje de WhatsApp debe separar claramente:

1. pases pendientes en USD;
2. equivalente en pesos al dólar vigente;
3. guías pagadas por cliente/en destino como informativas;
4. guías pendientes o a reintegrar como importes a cobrar;
5. total estimado del día.

Ejemplo de línea en WhatsApp:

- Guía BP-20200 — Buspack — Destinatario: Matías — Guía no pagada / pendiente: $57.000
- Guía VC-10253 — Vía Cargo — Destinatario: Matías — Guía pagada por el cliente / en destino: $58.140 (incluye 2%)

La guía debe figurar siempre en el resumen, incluso cuando está pagada por el cliente. La diferencia es que si está pagada por el cliente queda informativa; si está pendiente, queda como importe visible a cobrar o resolver.

## Organización final de pantalla

La primera pantalla operativa ya no debe mezclar todos los módulos. El orden correcto es:

1. KPIs principales del seguimiento.
2. Mapa de estados interno/cliente.
3. Buscador y tabla/listado de operaciones.
4. Ficha de operación con guías, pases, pagos y WhatsApp.
5. Alta rápida y creación de operación debajo.
6. Módulos anteriores separados como “Preparado / no principal”.

## Pases por guía

Cada guía puede tener un pase USD asociado, con fecha y nota. La operación mantiene un total de pases USD para resumen, pero el detalle fino vive en cada guía.

Ejemplo:

```txt
Guía VC-20080 → Pase USD 80 → Fecha 24/06
Guía CA-20150 → Pase USD 150 → Fecha 24/06
Guía BP-20200 → Pase USD 200 → Fecha 25/06
```

El resumen de WhatsApp debe mostrar cada guía con su pase y su condición económica.
