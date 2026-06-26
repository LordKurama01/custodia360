# PRODUCT_AUDIT — Custodia360 v11

## Diagnóstico
- Tipo de producto: landing pública + sistema logístico interno + portal cliente privado por invitación.
- Stack detectado: Next.js App Router, React, TypeScript, Supabase preparado, demo local.
- Problema real: digitalizar el pizarrón operativo y la planilla por cliente de Jeremías sin hacer más lento el trabajo que hoy hace a mano.

## Problemas detectados
| Prioridad | Problema | Impacto |
|---|---|---|
| Alta | El flujo se sentía como página larga | Baja uso diario |
| Alta | Portal cliente mostraba demasiadas secciones juntas | Confusión del cliente |
| Alta | Dinero a cuenta no estaba como acción clara | Riesgo de perder saldo |
| Alta | WhatsApp usaba mensajes demasiado genéricos | Consultas pobres y repetidas |
| Media | Estados internos aparecían en varios lugares | Ruido visual |
| Media | Falta preparación comercial/SEO/legal | Menos confianza para publicar |

## Mejoras necesarias
- Mesa de control como flujo guiado.
- Cliente como planilla digital.
- Cuenta corriente con pago parcial y dinero a cuenta.
- Portal por pestañas reales: Inicio, Pedidos, Guías, Pagos, Ayuda.
- Landing: con invitación entra, sin invitación WhatsApp.
- Noindex en rutas privadas.

## Riesgos
- La base real debe incluir payment_allocations para auditoría fina.
- En demo se simula parte de la asignación de pagos.
- Los textos legales usan placeholders y requieren revisión del titular.
