export function isDemoMode() {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;

  if (flag === "true") return true;
  if (flag === "false") return false;

  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const demoProfile = {
  id: "demo-owner",
  email: "demo@custodia360.local",
  full_name: "Jeremias Demo",
  role: "owner" as const,
  active: true,
  created_at: "2026-06-24T00:00:00.000Z",
  updated_at: "2026-06-24T00:00:00.000Z",
};
