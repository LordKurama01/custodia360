// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function analyzeEvidence() {
  throw new Error("analyzeEvidence debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function getOCRResult() {
  throw new Error("getOCRResult debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

