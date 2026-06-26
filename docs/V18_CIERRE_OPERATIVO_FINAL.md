# Custodia360 v18 — Cierre operativo final

Versión enfocada en afinar lo existente, sin agregar módulos nuevos.

## Arquitectura principal

- **Mesa**: pizarrón operativo vivo. Muestra trayecto, ubicación y próxima acción.
- **Contactos**: agenda de clientes y proveedores.
- **Cobros**: parte contable viva. Muestra pendientes, parciales, adelantos, dinero a cuenta y reintegros.
- **Guías**: guías activas, despachadas, a confirmar y a reintegrar.
- **Más**: configuración, permisos, dueños, soporte y banner cliente.

## Reglas de operación

- Lo activo vive en Mesa, Cobros o Guías.
- Lo cerrado queda en la ficha del cliente.
- Lo pagado sale de Cobros.
- Lo recibido/confirmado sale de Mesa.
- La ficha del cliente concentra archivo, guías, pagos, datos y movimientos.

## Acceso

- Ingreso único por Gmail.
- El sistema final no muestra accesos de prueba ni textos de muestra.

## WhatsApp

- No hay WhatsApp flotante en landing ni owner.
- El WhatsApp aparece en el visor/ficha del cliente según contexto.
- El número debe venir de la configuración del dueño/tenant.

## Multi-dueño

- Solo Matías/Prestige y Jeremías administran dueños a nivel plataforma.
- Jeremías puede crear hasta 2 dueños adicionales incluidos.
- Más dueños son upsell comercial Prestige.
- Los dueños normales no crean otros dueños.
- Cada dueño tiene empleados, clientes, proveedores, guías, cobros, permisos y WhatsApp propios.
- Jeremías puede entrar a espacios ajenos en modo solo lectura.
- Jeremías puede copiar datos de proveedores, no datos de clientes.
