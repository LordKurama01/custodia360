// Capa de servicio preparada para reemplazar estado local por API/DB sin tocar componentes.
export async function canAccessTenant() {
  throw new Error("canAccessTenant debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function canViewFinance() {
  throw new Error("canViewFinance debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function canManageUsers() {
  throw new Error("canManageUsers debe conectarse al repositorio correspondiente. La UI usa AppStateProvider en Versión 1 inicial.");
}

