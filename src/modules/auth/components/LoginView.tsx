"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { isDemoMode } from "@/shared/lib/demoMode";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./LoginView.module.css";

const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/5493757653075?text=Hola%2C%20quiero%20pedir%20acceso%20a%20Custodia360.";

export function LoginView() {
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") ?? "/owner/bultos";
  const demoMode = isDemoMode();

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") return "Este Gmail no está habilitado. Pedí acceso al dueño del servicio.";
    if (error === "server") return "No se pudo validar el acceso. Revisá Supabase.";
    if (error === "auth_callback") return "No se pudo completar el login con Google.";
    return "";
  }, [searchParams]);

  const signInWithGoogle = async () => {
    if (demoMode) {
      window.location.href = "/owner/bultos";
      return;
    }
    setLoading(true);
    setAuthError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  };

  return <main className={styles.page}>
    <section className={styles.card}>
      <Link href="/" className={styles.brand} aria-label="Custodia360 inicio"><BrandLockup subtitle="Acceso único" /></Link>
      <div className={styles.copy}>
        <p>Gmail único</p>
        <h1>Ingresá y seguí trabajando.</h1>
        <span>Custodia360 detecta tu email y abre la vista correcta: cliente, trabajador, dueño o super owner.</span>
      </div>
      {(demoMode || errorMessage || authError) ? <div className={styles.notice}>{authError || errorMessage || "Modo demo activo. Entrás directo al sistema."}</div> : null}
      <button type="button" className={styles.googleButton} onClick={signInWithGoogle} disabled={loading}>
        {demoMode ? "Entrar al demo" : loading ? "Abriendo Google..." : "Ingresar con Gmail"}
      </button>
      <small>Sin acceso libre. Tu Gmail tiene que estar autorizado por el dueño.</small>
    </section>
    <a className={styles.whatsappFab} href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Pedir acceso por WhatsApp">W</a>
  </main>;
}
