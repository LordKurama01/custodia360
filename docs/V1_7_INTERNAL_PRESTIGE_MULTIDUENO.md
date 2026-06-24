# Custodia360 V1.7 — Internal Prestige Alignment + Multi-dueño fuerte

Esta versión alinea el panel interno con la landing Prestige Green y refuerza la arquitectura multi-dueño para vender mejor el sistema como plataforma operativa privada.

## Cambios principales

- Unificación visual interna con paleta dark premium + verde lemon.
- CTAs principales pasan a verde lemon.
- Azul queda solo como color técnico secundario.
- Sidebar más sobria y con indicador de modo multi-dueño.
- Selector de negocio activo más claro.
- Dashboard Owner más operativo.
- Bloque de flujo CLI → JR → TAR → GUI → COB.
- Resumen explícito de clientes, choferes, operarios y cobros por dueño.
- Solicitudes con tabs con contador.
- Órdenes con métricas superiores y acciones rápidas.
- Plataforma Admin General más fuerte para crear y administrar dueños.
- Pantalla de pasarelas con copy comercial: “Forma de cobro del negocio”.
- Capa `domain/tenancy/tenantIsolation.ts` para centralizar filtrado por tenantId.

## Regla multi-dueño

Cada entidad operativa conserva `tenantId`:

- clientes
- usuarios
- choferes
- operarios
- solicitudes
- órdenes
- tareas
- viajes/lotes
- bultos
- guías
- evidencias
- cobros
- gastos
- rentabilidad
- incidencias
- auditoría
- pasarelas de pago

La app no debe mezclar datos entre dueños. El Administrador General puede cambiar espacio activo; cada Owner ve solo su operación.

## Pasarelas por dueño

Cada dueño puede configurar su forma de cobro:

- Mercado Pago
- Transferencia manual
- Stripe preparado
- Mobbex preparado
- Adapter custom

La integración queda aislada por adapter. Cambiar Mercado Pago no debe romper solicitudes, tareas, clientes, mobile ni desktop.
