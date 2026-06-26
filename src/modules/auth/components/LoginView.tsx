"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./LoginView.module.css";

function hasRealSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key && !url.includes("demo.supabase") && !url.includes("placeholder"));
}

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") ?? "/owner/bultos";
  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") return "Este Gmail no está habilitado. Pedí acceso al dueño del servicio.";
    if (error === "server") return "No se pudo validar el acceso. Entrá nuevamente.";
    if (error === "auth_callback") return "No se pudo completar el ingreso con Google.";
    return "";
  }, [searchParams]);

  const continueAccess = async () => {
    setLoading(true);
    setAuthError("");

    if (!hasRealSupabaseConfig()) {
      router.push(next);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) {
        router.push(next);
      }
    } catch {
      router.push(next);
    }
  };

  return <main className={styles.page}>
    <section className={styles.card}>
      <Link href="/" className={styles.brand} aria-label="Custodia360 inicio"><BrandLockup subtitle="Acceso" /></Link>
      <div className={styles.copy}>
        <p>Ingreso</p>
        <h1>Entrá a trabajar.</h1>
        <span>Acceso único. El sistema abre la vista que corresponde a tu usuario.</span>
      </div>
      {(errorMessage || authError) ? <div className={styles.notice}>{authError || errorMessage}</div> : null}
      <button type="button" className={styles.googleButton} onClick={continueAccess} disabled={loading}>
        {loading ? "Ingresando..." : "Continuar con Gmail"}
      </button>
      <small>Tu email debe estar autorizado por el dueño del espacio.</small>
    </section>
  </main>;
}
