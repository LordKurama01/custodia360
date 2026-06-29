# Custodia360 v36 — Historial operativo, trazabilidad y confirmaciones

## Objetivo
Cerrar el flujo operativo sin agregar módulos nuevos ni romper bloques existentes.

## Bloques tocados
- `src/modules/controlBultos/types.ts`
- `src/modules/controlBultos/lib/operationUi.ts`
- `src/modules/controlBultos/services/controlBultos.service.ts`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.module.css`

## Mejoras

### Historial operativo
Todo pedido que sale de Mesa por estado operativo queda visible en Archivo/Historial:
- Retirado
- Despachado
- Recibido

Cada fila muestra:
- pedido/código
- estado final
- motivo de salida de Mesa
- proveedor
- bultos
- pendiente operativo si existe
- usuario/empleado que marcó el movimiento
- fecha del movimiento

### Trazabilidad por empleado
Se agregó un bloque de eventos operativos con:
- acción
- actor/empleado
- rol
- fecha
- estado anterior
- estado nuevo
- nota/motivo

En demo se guarda en localStorage junto a los datos operativos.
En base real se lee desde `audit_logs` y se cruza con `profiles` para mostrar actor y rol.

### Historial general
En Más se agregó una vista compacta de historial general para Owner/Jeremías, sin crear módulo nuevo.

### Confirmaciones nativas
Se agregaron confirmaciones antes de acciones sensibles:
- modificar pedido
- cambiar estado
- guardar guía
- registrar cobro
- registrar movimiento especial

### Mobile/desktop
Mobile sigue como base.
Desktop queda aislado por media queries y clases existentes.
