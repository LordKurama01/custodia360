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
    <section className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Custodia360 inicio"><BrandLockup subtitle="Acceso privado" /></Link>
        <Link href="/" className={styles.backLink}>Inicio</Link>
      </header>

      <div className={styles.loginGrid}>
        <div className={styles.copyPanel}>
          <p>ACCESO PRIVADO</p>
          <h1>Acceso autorizado.</h1>
          <span>Entrá con el Gmail habilitado para operar en Custodia360.</span>
        </div>

        <section className={styles.card} aria-label="Ingreso a Custodia360">
          <div className={styles.copy}>
            <p>Ingresar</p>
            <h2>Continuar al sistema</h2>
            <span>El acceso está limitado a usuarios autorizados.</span>
          </div>
          {(errorMessage || authError) ? <div className={styles.notice}>{authError || errorMessage}</div> : null}
          <button type="button" className={styles.googleButton} onClick={continueAccess} disabled={loading}>
            {loading ? "Ingresando..." : "Continuar con Gmail"}
          </button>
          <small>Solo cuentas habilitadas por el dueño del espacio.</small>
        </section>
      </div>
    </section>
  </main>;
}
