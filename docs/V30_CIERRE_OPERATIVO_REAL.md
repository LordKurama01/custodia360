# Custodia360 v30 — cierre operativo real

Versión: `custodia360-v30-cierre-operativo-real`
Fecha de trabajo: 2026-06-26

## Objetivo

Cerrar el circuito operativo real de Custodia360 sin agregar módulos grandes ni pantallas decorativas.

Flujo validado como centro del sistema:

Cliente → Pedido → Estado → Guías → Cobros → Archivo / Historial

## Cambios aplicados

### Mesa / pedidos

- Mesa sigue trabajando sobre pedidos activos.
- Se mantiene la regla operativa: cuando el pedido pasa a `Recibido`, sale de Mesa y queda en historial/ficha del cliente.
- Se reforzó el pedido como unidad principal para asociar proveedor, guías, cobros y movimientos especiales.

### Alta de proveedor desde Nuevo pedido

- Se agregó retorno operativo completo desde `Nuevo pedido` → `+ Agregar proveedor`.
- Al crear el proveedor desde ese flujo:
  - se guarda el proveedor,
  - vuelve automáticamente al formulario del pedido,
  - queda seleccionado el proveedor creado.

### Contactos

- Contactos mantiene separación entre `Clientes` y `Proveedores`.
- Se corrigió la base de clientes para que un cliente creado rápido aparezca en Contactos aunque todavía no tenga pedidos.
- Se limpió el uso de operaciones como nombre de contacto en la data inicial:
  - `Génesis / compra 5 teléfonos` pasa a ser proveedor `Génesis` con la compra en la nota/pedido.
  - `Compras varias / pases pendientes` pasa a ser proveedor `Atacado Game` con el contexto en la nota.

### Valor habitual opcional

- El campo `Valor habitual` ahora puede quedar vacío visualmente.
- No se fuerza `0` en la interfaz al borrar el campo.
- El tipo de UI acepta `number`, vacío o `null`.
- En guardado real se normaliza para compatibilidad con el esquema actual.

### Cobros

- Se separó dinero a cuenta de deuda pendiente.
- Los movimientos tipo `dinero_recibido` o con origen `cliente_envio` ahora pasan a `A cuenta / En caja`.
- Ese dinero ya no infla `Pendiente` ni `Trabajos extras`.
- KPIs ajustados:
  - `Pendiente`: deuda real pendiente.
  - `Pagos`: pagos registrados.
  - `En caja`: pagos + dinero a cuenta.
  - `Guías a cobrar`: guías pendientes de cobro/reintegro.

### Ficha cliente

- Se reorganizó la ficha en tabs operativos:
  - Resumen
  - Pedidos
  - Guías
  - Cobros
  - Adelantos
  - Archivo
- Se agregó visualización específica de dinero a cuenta.
- Se mantiene la ficha compacta para evitar pantalla larga.

### Guías

- Guías queda organizada en:
  - Activas
  - Sin número
  - A confirmar
  - Cerradas
- Las guías cerradas/confirmadas ya no quedan mezcladas en Activas.
- El resumen de Guías ahora incluye `Cerradas`.
- Si corresponde Vía Cargo, se mantiene cálculo con recargo 2%.

### Botón + contextual

- Mesa:
  - Nuevo pedido
  - Nuevo despacho
  - Nuevo pago de guía
  - Nuevo adelanto
- Contactos:
  - Agregar cliente
  - Agregar proveedor
- Cobros:
  - Registrar cobro
  - Registrar adelanto
  - Guías para cobrar
  - Trabajos extras
- Guías:
  - Nueva guía
  - Buscar guía
  - Confirmar guía
- Más:
  - sin botón `+`.

### Corrección técnica

- Se eliminó una declaración duplicada en `createPassItem` que podía cortar compilación o mantenimiento.

## Archivos principales modificados

- `src/modules/controlBultos/types.ts`
- `src/modules/controlBultos/services/controlBultos.service.ts`
- `src/modules/controlBultos/owner-desktop/ControlBultosView.tsx`
- `docs/V30_CIERRE_OPERATIVO_REAL.md`

## Validación

- `npm run typecheck`: OK.
- `npm run build`: compiló correctamente, pero en este entorno cortó por timeout durante `Collecting page data`.
- No se observó error nuevo de código antes del timeout.
- Se mantiene warning existente de Supabase en Edge Runtime por uso de `process.version` desde `@supabase/supabase-js` vía middleware.

## Pendiente recomendado para v31

- Probar con datos reales mínimos:
  - 3 clientes,
  - 2 proveedores,
  - 5 pedidos,
  - 3 guías,
  - 2 cobros,
  - 1 dinero a cuenta.
- Validar tenant/owner con Supabase real y políticas RLS si se pasa de demo a operación productiva.
- Agregar columna real `city` al esquema de clientes si se quiere separar ciudad de notas.
- Mejorar selector global de guía si se quiere cargar una guía sin entrar primero por pedido.
