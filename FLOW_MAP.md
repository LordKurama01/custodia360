# Flow Map v20

## Público

`/` → landing corta → `Ingresar` → `/login`

## Login

`/login` → `Continuar con Gmail`

- Con Supabase real: OAuth Google → callback → redirección por rol.
- Sin Supabase real: acceso operativo inicial → `/owner/bultos`.

## Owner / operación

Arquitectura visual:

```txt
          Mesa
Contactos | Cobros | Guías | Más
```

- Mesa: pizarrón operativo vivo.
- Contactos: clientes y proveedores.
- Cobros: parte contable viva.
- Guías: guías activas / a confirmar.
- Más: configuración, permisos, dueños y soporte.

## Cliente

El cliente ve solo su visor y su información. WhatsApp aparece solo en contexto cliente y usa el WhatsApp del dueño/tenant.


## V22 — Landing Comercial Premium
- Landing pública rearmada como pieza comercial corta.
- Un solo botón visible: Ingresar al sistema.
- Sin secciones largas ni botones repetidos.
- Login operativo queda separado.


## v23 — Pasada fina entregable

Pulido visual final: navegación mobile más fina, ficha cliente compacta, botón `+` menos invasivo, Más sin vacío y ajustes de densidad para dejar el sistema más presentable sin sumar funciones.


## v28 — Cobros final + acciones contextuales

- Cobros queda con resumen superior: Pendiente, Pagos, En caja y Guías a cobrar.
- Debajo quedan las acciones/vistas: Registrar cobro, Registrar adelanto, Guías para cobrar y Trabajos extras.
- El botón `+` ahora cambia según pantalla: Mesa, Contactos, Cobros y Guías. En Más queda oculto.
- Se evita mezclar dinero a cuenta como pendiente común.
