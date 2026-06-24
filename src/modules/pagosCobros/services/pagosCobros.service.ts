// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function getPayments() {
  throw new Error("getPayments debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getPendingPayments() {
  throw new Error("getPendingPayments debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function createPayment() {
  throw new Error("createPayment debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

