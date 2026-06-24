# Custodia360 — V1.2 Landing + ingreso único

Corrección aplicada:

- `/login` ya no se presenta como selector de roles.
- Funciona como landing simple sobre logística, transporte, seguridad, trazabilidad y operación privada.
- No habla de precios.
- No habla de planes.
- Muestra un ingreso único destacado.
- Muestra WhatsApp configurable por variables públicas.
- Las vistas por rol siguen existiendo como rutas internas para desarrollo y permisos.

Regla de producto:

El usuario entra por un único acceso. Luego el sistema muestra la vista correspondiente según su usuario y permisos:

- Administrador General
- Dueño / Owner
- Cliente
- Chofer
- Operario

No se debe mostrar selector de rol en producción.
