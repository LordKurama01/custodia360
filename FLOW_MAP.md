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
