# Custodia360 v14 — App mobile completa

## Objetivo

La v14 refuerza la regla de producto: Custodia360 no es una web larga. Es una app operativa completa con uso principal desde celular.

- El cliente ve todo lo suyo de forma simple.
- El owner puede trabajar desde celular.
- No se recorta funcionalidad: se ordena por jerarquía.
- Fase 1 sigue limitada a Control de Bultos + Cuenta Corriente.

## Cliente mobile

Bottom nav cliente:

- Inicio
- Pedidos
- Guías
- Pagos
- Ayuda

El cliente puede consultar:

- estado actual
- pedidos / operaciones activas
- historial oculto del pedido
- guías clickeables
- detalle de guía
- pagos visibles
- saldo pendiente
- WhatsApp contextual

No ve:

- estados internos
- mesa de control
- botones administrativos
- datos de otros clientes
- configuración

## Owner mobile

Bottom nav owner:

- Mesa
- Clientes
- Guías
- Cuenta
- Más

El owner puede operar desde celular:

- ver mesa de control
- abrir clientes / planillas
- ver guías
- abrir cuenta corriente
- registrar pago
- registrar dinero a cuenta
- cargar guía
- crear movimiento
- mandar WhatsApp contextual
- acceder a configuración, permisos y dueños desde Más

## Cambios principales

- Separación de Clientes / planillas y Cuenta corriente en navegación.
- Hashes soportados:
  - #seguimiento
  - #clientes
  - #cuentas
  - #guias
  - #cuenta
  - #cuenta-corriente
  - #mas
- Nueva vista Cuenta corriente para saldos, pagos parciales, guías a reintegrar y dinero a cuenta.
- Acciones rápidas mobile: Movimiento, Guía, Cobrar, A cuenta.
- Próxima acción visible en mesa desktop y cards mobile.
- Menú Más con accesos a configuración, permisos, dueños y acciones secundarias.
- Cliente con accesos rápidos desde Inicio a Pedidos, Pagos y Ayuda.
- Bottom nav cliente corregido para buttons reales.

## Criterio de diseño

Misma app completa, menos ruido:

- pocos botones visibles
- acciones por contexto
- extras en Más o menú "..."
- mobile sin tablas pesadas cuando no corresponde
- desktop mantiene mesa completa con mayor densidad

## Validación esperada

Una prueba real debe confirmar que:

- el cliente encuentra estado, guía, saldo y WhatsApp en menos de 10 segundos
- el owner carga guía, pago y dinero a cuenta desde celular sin explicación
- no hay botones muertos en navegación principal
- lo no funcional queda deshabilitado o en construcción
