# Arquitectura Custodia360 — Versión 1 inicial

## Principios

- Multi-dueño desde la primera entrega.
- Aislamiento por `tenantId`.
- Mobile-first real por rol: cliente, chofer y operario.
- Owner mobile resumido.
- Desktop Owner como herramienta de trabajo.
- Integraciones aisladas por adaptadores.

## Capas

1. `domain`: entidades y reglas centrales.
2. `application`: casos de uso futuros.
3. `modules`: pantallas y lógica por módulo/rol.
4. `shared`: componentes, estado, mocks, utilidades.
5. `infrastructure`: adaptadores de proveedores externos.

## Integraciones

Mercado Pago, OCR, Auth y Storage no deben entrar directo a componentes. Se conectan vía puertos/adaptadores. Si cambia Mercado Pago, se cambia solo `src/infrastructure/adapters/payments/MercadoPagoAdapter.ts`.

## Separación de datos

Cada entidad operativa tiene `tenantId`. Las vistas filtran por dueño activo. Dueño A no accede a datos de Dueño B o C.
