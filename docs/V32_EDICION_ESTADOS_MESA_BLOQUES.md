# Custodia360 v32 — edición y estados operativos por bloques

## Objetivo
Pulido quirúrgico sobre lo existente. No se agregan módulos ni pantallas grandes.

## Regla de bloques
Los cambios quedan separados por responsabilidad:
- `lib/operationUi.ts`: reglas UI/operativas de Mesa, visibilidad y tonos de estado.
- `ControlBultosView.tsx`: conexión visual y acciones existentes.
- `ControlBultosView.module.css`: chips de estado y micro UI.

## Cambios aplicados
- Mesa ahora usa `shouldShowOnMesa` para mostrar solo pedidos que requieren acción logística activa.
- Estados `Retirado`, `Despachado` y `Recibido` salen de Mesa.
- Se agregó acción visible `Editar pedido` en acciones rápidas.
- En desktop, la fila de Mesa muestra botón `Editar`.
- En ficha rápida se agregó `Editar pedido`.
- El formulario existente de pedido ahora sirve claramente para edición: bultos, valor, proveedor, pase USD, estado y descripción.
- Las etiquetas de estado tienen color propio por etapa.
- Las cards mobile muestran chips compactos de guía y cobro.
- La card muestra una línea operativa `Falta:` para saber la próxima corrección.

## No incluido
- No se agregaron módulos nuevos.
- No se movió la estructura principal.
- No se cambió la lógica de tenant ni permisos.
