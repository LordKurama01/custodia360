# Custodia360 v28 — Cobros final y acciones contextuales

## Cambios aplicados

- Cobros reorganizado en dos niveles:
  - Resumen superior: Pendiente, Pagos, En caja, Guías a cobrar.
  - Acciones/vistas inferiores: Registrar cobro, Registrar adelanto, Guías para cobrar, Trabajos extras.
- Se corrigió la lectura contable: el dinero a cuenta ya no queda mezclado como pendiente común.
- El botón flotante `+` ahora es contextual según pantalla:
  - Mesa: acciones de Mesa.
  - Contactos: agregar cliente/proveedor.
  - Cobros: registrar cobro, adelanto, guías para cobrar, trabajo extra.
  - Guías: nueva guía, sin número, a confirmar, buscar guía.
  - Más: sin botón flotante.
- El título del bottom sheet cambia por pantalla.

## Validación

- `npm run typecheck`: OK.
