<p align="left"><img src="https://raw.githubusercontent.com/LordKurama01/theprestige-group/main/branding/tpg-diamondgold.png" alt="Diamante original de The Prestige Group" width="56" /> <strong>The Prestige Group</strong></p>

# Custodia360 — Gestión de operaciones, guías y cobros

**Una mesa de trabajo para organizar movimientos, contactos y tareas operativas.**

Custodia360 reúne flujos cotidianos de una operación que administra bultos o movimientos, guías, proveedores, clientes y cobros, con una interfaz orientada a la operación diaria.

## El problema que resuelve

Cuando pedidos, contactos, entregas y pagos se siguen en conversaciones y planillas separadas, se pierde visibilidad sobre qué está pendiente, quién debe actuar y qué se cobró.

## Áreas del producto

| Área | Propósito |
| --- | --- |
| **Mesa** | Vista de trabajo y seguimiento de movimientos |
| **Contactos** | Clientes y proveedores |
| **Cobros** | Registro y consulta de cobros y adelantos |
| **Guías** | Guías activas y pendientes de confirmación |
| **Más** | Configuración y funciones administrativas |

La documentación del repositorio describe también el seguimiento de pedidos, estados, acciones contextuales en móvil y distintos roles. Esas descripciones no sustituyen las pruebas funcionales.

## Arquitectura y desarrollo

Aplicación web basada en **Next.js 15, React 19 y TypeScript**, con referencias a integración de datos y autenticación mediante Supabase en el código del proyecto.

```bash
npm install
npm run dev
```

Validaciones disponibles en el `package.json`:

```bash
npm run typecheck
npm run build
```

**Importante:** esta modificación del README no ejecuta ni acredita esas pruebas. No se garantiza que estén completas la autenticación, las restricciones por rol o la configuración productiva.

## Documentación relevante

- [Mapa de flujos](FLOW_MAP.md)
- [Roles y permisos](ROLES_AND_PERMISSIONS.md)
- [Auditoría funcional histórica](PRODUCT_AUDIT.md)
- [Cambios de experiencia móvil](CAMBIOS_V36_1_MOBILE_PREMIUM.md)
- [Instrucciones de continuidad](AGENTS.md)
- [Bitácora acumulativa](BITACORA.md)

Las notas de versiones históricas permanecen en documentos existentes y en el historial Git. Esta portada se concentra en lo que un tercero necesita entender primero.

## Seguridad y estado

La documentación histórica incluye configuraciones de acceso local utilizadas durante el desarrollo. **No deben darse por aptas para producción** sin revisar autenticación, autorización y aislamiento de datos. Esta reorganización no cambia ese comportamiento, y no publica instrucciones de acceso operativo en el README principal.

**Siguiente validación técnica:** auditar accesos y roles, ejecutar typecheck/build, y probar los flujos críticos en un entorno controlado antes de afirmar disponibilidad productiva.

[**Portfolio del grupo**](https://github.com/LordKurama01/theprestige-group)

---

<sub><img src="https://raw.githubusercontent.com/LordKurama01/theprestige-group/main/branding/tpg-diamondgold.png" alt="" width="18" /> The Prestige Group · Software y operaciones.</sub>
