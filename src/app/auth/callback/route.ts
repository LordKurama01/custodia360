import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/infrastructure/supabase/server";
import type { InternalRole, ProfileRow } from "@/infrastructure/supabase/types";

type AuthorizedUser = {
  email: string;
  role: InternalRole;
  full_name?: string;
  active?: boolean;
};

const validRoles = new Set<InternalRole>(["owner", "admin", "operator", "collector", "viewer"]);

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function cleanEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function isAuthorizedUser(value: unknown): value is AuthorizedUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuthorizedUser>;
  return typeof candidate.email === "string" && !!candidate.role && validRoles.has(candidate.role);
}

async function getAllowlistedUser(email: string) {
  const ownerEmail = cleanEmail(process.env.INTERNAL_OWNER_EMAIL);
  if (ownerEmail && email === ownerEmail) {
    return { email, role: "owner" as const, active: true };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "authorized_users")
    .maybeSingle();

  const users = Array.isArray(data?.value) ? data.value : [];
  return users.filter(isAuthorizedUser).find((user) => cleanEmail(user.email) === email && user.active !== false) ?? null;
}

async function ensureAuthorizedProfile(userId: string, email: string, fullName?: string | null) {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (existingError) throw existingError;
  if (existing) return existing.active ? existing : null;

  const allowlisted = await getAllowlistedUser(email);
  if (!allowlisted) return null;

  const { data: created, error: createError } = await admin
    .from("profiles")
    .insert({
      id: userId,
      email,
      full_name: allowlisted.full_name ?? fullName ?? email,
      role: allowlisted.role,
      active: true,
    })
    .select("*")
    .single<ProfileRow>();

  if (createError) throw createError;

  await admin.from("audit_logs").insert({
    actor_id: userId,
    entity_type: "profile",
    entity_id: userId,
    action: "profile_bootstrapped_from_allowlist",
    after_data: { email, role: created.role },
  });

  return created;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/owner/bultos";

  if (!code) return redirectTo(request, "/login?error=auth_callback");

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirectTo(request, "/login?error=auth_callback");

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;
    const email = cleanEmail(user?.email);

    if (userError || !user || !email) {
      return redirectTo(request, "/login?error=unauthorized");
    }

    const profile = await ensureAuthorizedProfile(
      user.id,
      email,
      typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    );

    if (!profile) {
      await supabase.auth.signOut();
      return redirectTo(request, "/login?error=unauthorized");
    }

    return redirectTo(request, next.startsWith("/") ? next : "/owner/bultos");
  } catch {
    return redirectTo(request, "/login?error=server");
  }
}
