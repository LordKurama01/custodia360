# Modo demo local — Custodia360

## Objetivo

Mostrar el sistema sin Supabase real, usando datos demo guardados en el navegador.

## Rutas

- `/login`
- `/owner/bultos`
- `/consulta/demo`
- `/consulta/estela`
- `/consulta/matias`

## Regla de organización

El flujo principal es `/owner/bultos`. El resto de módulos queda más abajo como preparado/no principal.

## Datos demo principales

### Estela

Operación: compra de 5 teléfonos.

- 5 guías.
- 5 destinatarios.
- Pases asociados a cada guía.
- Una guía Buspack pendiente de $57.000 para mostrar deuda de guía.
- Guías pagadas en destino como informativas.

### Matías

Operación: pases pendientes.

- Pase USD 80 ligado a guía Vía Cargo.
- Pase USD 150 ligado a guía Correo Argentino.
- Pase USD 200 ligado a guía Buspack.
- Guía Buspack pendiente: $57.000.

## Dólar demo

```txt
$1500
```

El equivalente en pesos se muestra al día de consulta. Si el pago se hace otro día, el valor puede cambiar según el dólar cargado.
