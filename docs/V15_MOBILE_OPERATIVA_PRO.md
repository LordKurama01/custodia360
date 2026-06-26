# Custodia360 v15 — Mobile Operativa Pro

Objetivo: mantener la app completa, pero convertir la experiencia mobile en una operación rápida de logística.

## Cambios principales

- Mobile owner más compacto: se elimina el modo página larga y se prioriza lista + acción.
- Se oculta el bloque explicativo superior en celular para evitar duplicación con el header.
- KPIs convertidos en chips horizontales compactos.
- Buscador sticky más bajo y liviano.
- Se reemplaza la barra visible de cuatro acciones por un FAB único `+`.
- El FAB abre un bottom sheet con acciones rápidas:
  - Nuevo movimiento.
  - Nueva guía del seleccionado.
  - Cobrar seleccionado.
  - Dinero a cuenta.
  - Buscar cliente o guía.
  - Abrir cuenta corriente.
- Cards mobile más compactas: menos padding, menos texto visible y acciones principales directas.
- Formularios en mobile más ágiles:
  - Nueva guía con modo rápido visible.
  - Campos avanzados ocultos en acordeón.
  - Pago con opciones avanzadas ocultas.
  - Botón de guardar/registrar sticky abajo del panel.
- Cuenta corriente mobile más corta:
  - Se oculta tabla tipo planilla en mobile.
  - Se mantiene lista accionable y saldos compactos.
- Cliente mobile más directo:
  - Menos texto visible.
  - Estado, guías y pagos más compactos.
  - Bottom nav más fino.
- Bottom nav owner y cliente reducida para no comer pantalla.

## Criterio aplicado

No se recortó funcionalidad. Se redujo jerarquía visible:

- Lo frecuente queda visible.
- Lo secundario va a bottom sheet o acordeón.
- Lo administrativo sigue disponible, pero no satura la pantalla.

## Validación esperada

El owner debe poder hacer desde celular:

1. Buscar cliente.
2. Ver próxima acción.
3. Cargar guía.
4. Registrar pago.
5. Registrar dinero a cuenta.
6. Enviar WhatsApp.

El cliente debe poder hacer desde celular:

1. Ver estado actual.
2. Ver guías.
3. Consultar pagos/saldo.
4. Escribir por WhatsApp.
