import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/infrastructure/supabase/middleware";
import { isDemoMode } from "@/shared/lib/demoMode";

function loginRedirect(request: NextRequest, error?: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  if (isDemoMode()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  try {
    const supabase = createSupabaseMiddlewareClient(request, response);
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return loginRedirect(request);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, active")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError || !profile?.active) {
      return loginRedirect(request, "unauthorized");
    }

    return response;
  } catch {
    return loginRedirect(request, "server");
  }
}

export const config = {
  matcher: ["/owner/:path*", "/platform/:path*"],
};
