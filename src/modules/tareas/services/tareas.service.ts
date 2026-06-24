// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function getTasks() {
  throw new Error("getTasks debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getTaskById() {
  throw new Error("getTaskById debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getTasksByUser() {
  throw new Error("getTasksByUser debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function assignTask() {
  throw new Error("assignTask debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function startTask() {
  throw new Error("startTask debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function completeTask() {
  throw new Error("completeTask debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function reportTaskIssue() {
  throw new Error("reportTaskIssue debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function attachTaskEvidence() {
  throw new Error("attachTaskEvidence debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

