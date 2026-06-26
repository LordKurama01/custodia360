# Custodia360

Sistema privado para control de compras, bultos, guías, cobros y entregas.

## Versión actual

**v18 — Cierre operativo final**

## Estructura operativa

```txt
          Mesa
Contactos | Cobros | Guías | Más
```

- **Mesa**: pizarrón operativo principal.
- **Contactos**: clientes y proveedores como agenda.
- **Cobros**: parte contable viva.
- **Guías**: guías activas y confirmaciones.
- **Más**: configuración, permisos, dueños, soporte y banner cliente.

## Reglas clave

- Ingreso único con Gmail.
- Sin accesos de prueba visibles.
- Sin datos mezclados entre dueños.
- Cada dueño tiene su propio espacio por `tenant_id` / `owner_id`.
- Lo pagado sale de Cobros y queda en la ficha del cliente.
- Lo recibido sale de Mesa y queda en la ficha del cliente.
- WhatsApp visible solo donde corresponde, con número configurado por dueño.

## Deploy

```powershell
$ErrorActionPreference = "Stop"

cd C:\Proyectos\custodia360

npm install
npm run typecheck
npm run build

git status
git add -A
git commit -m "custodia360 v18 cierre operativo final"
git push
```
