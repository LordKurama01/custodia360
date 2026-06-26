function hasRealSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && anonKey && !url.includes("demo.supabase") && !url.includes("placeholder"));
}

/**
 * Modo operativo local/inicial.
 * No se muestra como demo en UI: solo evita bloquear el acceso cuando la auth real todavía no está conectada.
 */
export function isDemoMode() {
  const localAccess = process.env.NEXT_PUBLIC_LOCAL_ACCESS;
  if (localAccess === "true") return true;
  if (localAccess === "false") return false;
  return !hasRealSupabaseConfig();
}

export const demoProfile = {
  id: "system-owner",
  email: "owner@custodia360.local",
  full_name: "Owner Custodia360",
  role: "owner" as const,
  active: true,
  created_at: "2026-06-24T00:00:00.000Z",
  updated_at: "2026-06-24T00:00:00.000Z",
};
