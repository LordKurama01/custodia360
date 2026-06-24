// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function getProfitabilitySummary() {
  throw new Error("getProfitabilitySummary debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getProfitabilityByOrder() {
  throw new Error("getProfitabilityByOrder debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getProfitabilityByTrip() {
  throw new Error("getProfitabilityByTrip debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

