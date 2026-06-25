# Custodia360 — Reestructura final operativa

Esta entrega deja como pantalla principal el seguimiento real de clientes, guías, pases, dólar, pagos y WhatsApp.

## Ruta principal

```txt
/login
/owner/bultos
/consulta/demo
```

El login demo entra directo a `/owner/bultos`. La ruta `/owner/dashboard` redirige a `/owner/bultos` para que el sistema no mezcle el flujo principal con pantallas anteriores.

## Flujo principal

```txt
Cliente principal
  → Operación / pedido
    → Bultos
    → Guías / pedidos del cliente
    → Destinatarios
    → Pases USD por guía
    → Pagos / reintegros
    → Resumen WhatsApp
    → Portal cliente
```

## Qué queda como principal

- Seguimiento por cliente.
- Estados internos owner/empleado.
- Estado simplificado para cliente.
- Guías múltiples por operación.
- Cada guía con destinatario, DNI, empresa, valor, condición económica y detalle clickeable.
- Pases en USD asociados a cada guía, con fecha y nota.
- Dólar del día para equivalente en pesos.
- Guías pagadas por cliente/en destino como informativas.
- Guías pendientes o pagadas por Jeremías como importes a resolver/cobrar.
- Resumen de WhatsApp con guías siempre visibles.

## Estados

Owner/empleado ve:

```txt
Para retirar
Retirado
Depósito CD
Depósito A
Depósito B
Despachado
```

Cliente ve:

```txt
Para retirar / Retirado / Depósito CD → En preparación
Depósito A / Depósito B → En tránsito
Despachado → Despachado
```

## Módulos secundarios

Las pantallas anteriores quedan separadas en la navegación como “Preparado / no principal”. No se eliminan, pero no son el corazón operativo de esta entrega.

## Deploy Render

```txt
Build Command:
corepack enable && pnpm install --no-frozen-lockfile && pnpm build

Start Command:
./node_modules/.bin/next start -p $PORT
```

## Validación local

```txt
npm install
npm run typecheck
```

Typecheck validado correctamente en esta entrega.
