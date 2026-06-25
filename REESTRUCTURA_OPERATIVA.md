# Custodia360 — Fase 1 Control de Bultos

Esta versión deja como eje principal **Control de Bultos**. No se agregan módulos externos al alcance de Fase 1.

## Alcance de Fase 1

El flujo principal es:

```text
Cliente base → Operación / pedido de bultos → Estado interno → Guías → Pases USD → Pagos simples → Resumen WhatsApp
```

Quedan fuera de Fase 1: IA, reportes avanzados, CRM, finanzas complejas, mapas, push, chat interno y módulos no relacionados directamente con bultos.

## Apps separadas

### App administrador / owner

Ruta principal:

```text
/owner/bultos
```

Pantalla inicial: **Seguimiento operativo**.

En mobile usa navegación inferior con 4 accesos y un botón central elevado:

```text
Seguimiento | Guías | + Nueva | Pases | Más
```

La carga queda abajo o en paneles de acción; el dashboard no debe ser una página larga con todo mezclado.

### App cliente

Ruta:

```text
/consulta/[code]
```

El cliente ve una experiencia separada y simple:

```text
Inicio | Pedidos | Guías | Pagos | Ayuda
```

El cliente solo ve estados resumidos, guías, pases/deuda si corresponde y detalle de guía.

## Estados

### Estados internos

```text
Para retirar
Retirado
Depósito CD
Depósito A
Depósito B
Despachado
```

### Estados visibles para cliente

```text
Para retirar / Retirado / Depósito CD → En preparación
Depósito A / Depósito B → En tránsito
Despachado → Despachado
```

## Guías

Una operación puede tener varias guías.
Cada guía queda ligada al cliente y puede representar un pedido/envío distinto.

Cada guía debe guardar:

```text
Número de guía / pedido cliente
Empresa
Destinatario
DNI / identidad
Fecha despacho
Valor real
Valor cobrado al cliente
Condición: pagada cliente/en destino, pendiente, pagada por Gere/Jeremías, pendiente reintegro, reintegrada
Pase USD asociado
Fecha del pase
Nota del pase
```

En estado Despachado, owner y cliente ven guías clickeables. Al abrir una guía aparece todo el detalle.

## Vía Cargo

Si la empresa es Vía Cargo, se aplica recargo automático del 2% sobre el valor real de guía.

```text
Valor real: $57.000
Recargo 2%: $1.140
Total guía cliente: $58.140
```

Se guardan ambos valores: costo real y valor cobrado.

## Pases

El pase pertenece al cliente y puede vincularse a una guía y una fecha.
No tiene precio fijo.

Puede variar libremente:

```text
USD 80
USD 150
USD 200
USD 500
```

El equivalente en pesos se calcula con el dólar vigente/seleccionado al momento de consulta o cobro.

## Dólar

El sistema muestra el pase en USD como base. El importe en pesos cambia según dólar vigente si no fue pactado manualmente.

```text
USD 100 x $1500 = $150.000 hoy
USD 100 x $1600 = $160.000 otro día
```

## Guías en WhatsApp

El resumen de WhatsApp siempre debe mostrar la guía.

Ejemplos:

```text
Guía VC-10253 - Vía Cargo - Destinatario Matías - Guía pagada por cliente/en destino: $58.140 - Pase USD 80
Guía BP-20200 - Buspack - Destinatario Juan - Guía no pagada / pendiente: $57.000 - Pase USD 150
Guía VC-10254 - Vía Cargo - Destinatario Laura - Guía pagada por Gere, a reintegrar: $32.640 - Pase USD 200
```

## Alta de cliente por invitación

El cliente no se registra libremente.

El owner o empleado autorizado genera un link de invitación de un solo uso.

Regla:

```text
El número correlativo CLI-000X se asigna cuando el invitado activa el link, no cuando el link se envía.
```

Estados de invitación:

```text
Pendiente
Usada
Vencida
Revocada
```

Luego de usarse, el link queda consumido y no funciona más. Si el cliente deja de ser cliente, el owner puede cortar su acceso.

## Regla visual

No escribir que la app es premium. Debe sentirse sólida por diseño:

```text
Menos texto
Menos repetición
Dashboard compacto
Bottom nav móvil
Botón central elevado
Acciones separadas
Footer Prestige discreto
```
