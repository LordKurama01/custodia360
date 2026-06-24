// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function getExpenses() {
  throw new Error("getExpenses debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function createExpense() {
  throw new Error("createExpense debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

