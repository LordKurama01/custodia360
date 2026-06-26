# Implementation Report — v18

## Hecho

- Landing simplificada sin WhatsApp flotante.
- Login único Gmail sin textos de prueba visibles.
- Navegación mobile ajustada: Mesa sobresale como acceso principal; abajo quedan Contactos, Cobros, Guías y Más.
- Owner: Inicio renombrado a Mesa.
- Clientes renombrado a Contactos, con Clientes y Proveedores.
- Deudores renombrado a Cobros.
- Más limpio, orientado a configuración y sistema.
- Ficha cliente mantiene cuenta, guías y archivo.
- Banner agregado en visor cliente.
- WhatsApp flotante eliminado de landing/login/owner.
- Documentación actualizada a arquitectura final.

## Validación

- `npm run typecheck`: OK.
- `npm run build`: compila; el entorno puede cortar por timeout en `Collecting page data`.
