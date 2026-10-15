# AGENTS.md — custodia360

## Continuidad obligatoria

Antes de editar: leer este archivo, las últimas entradas de `BITACORA.md`, revisar el repositorio y rama reales, obtener el HEAD, y verificar los archivos y el estado funcional existentes. La evidencia del repositorio prevalece sobre recuerdos.

## Alcance y arquitectura

Respetar la arquitectura, los nombres, las configuraciones y los flujos existentes. Reutilizar antes de incorporar dependencias o rehacer módulos. Priorizar cambios pequeños, verificables y reversibles; no agregar funcionalidades por una intervención documental.

## Seguridad y presentación

- No publicar secretos, cuentas de clientes, tokens, accesos internos ni datos personales.
- En material público, explicar problema, valor y funciones verificadas, sin insinuar un despliegue o una certificación inexistente.
- Usar únicamente el PNG oficial de Prestige: `LordKurama01/theprestige-group/branding/tpg-diamondgold.png`; no reemplazarlo por un emoji o dibujo.
- No cambiar autenticación, roles, permisos, despliegues, variables de entorno ni datos de producción sin verificar consecuencias.

## Validación y cierre

Para cambios de producto: ejecutar pruebas disponibles pertinentes, typecheck, build y QA; registrar resultado exacto. Para cambios exclusivamente Markdown: verificar el contenido remoto, los enlaces y el alcance; no afirmar tests de aplicación no ejecutados.

Actualizar `BITACORA.md` después de cada intervención relevante con fecha, objetivo, diagnóstico, cambios/archivos, verificaciones y resultados, rama/HEAD/commits o PR, estado, riesgos, rollback, pendientes y siguiente acción exacta. No borrar entradas previas.
