// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function getAuditEvents() {
  throw new Error("getAuditEvents debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getAuditEventsByEntity() {
  throw new Error("getAuditEventsByEntity debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function createAuditEvent() {
  throw new Error("createAuditEvent debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

