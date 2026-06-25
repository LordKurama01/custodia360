"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { isDemoMode } from "@/shared/lib/demoMode";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./LoginView.module.css";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+54 9 3757 65-3075";
const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/5493757653075";
const prestigeUrl = process.env.NEXT_PUBLIC_PRESTIGE_URL ?? "https://theprestige-group.com/";

export function LoginView() {
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientCode, setClientCode] = useState("");
  const next = searchParams.get("next") ?? "/owner/bultos";
  const demoMode = isDemoMode();

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") return "Tu Gmail no está autorizado o tu usuario está inactivo.";
    if (error === "server") return "No se pudo validar el acceso. Revisá la configuración de Supabase.";
    if (error === "auth_callback") return "No se pudo completar el login con Google.";
    return "";
  }, [searchParams]);

  const enterDemo = () => {
    window.location.href = "/owner/bultos";
  };

  const enterClientPortal = () => {
    const code = clientCode.trim();
    window.location.href = code ? `/consulta/${encodeURIComponent(code)}` : "/consulta/demo";
  };

  const signInWithGoogle = async () => {
    if (demoMode) {
      enterDemo();
      return;
    }

    setLoading(true);
    setAuthError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/login" className={styles.brand} aria-label="Custodia360 inicio">
          <BrandLockup subtitle="Control privado de bultos" />
        </Link>

        <nav className={styles.nav} aria-label="Navegación principal">
          <a href="#consultar">Consultar pedido</a>
          <a href="#equipo">Ingreso equipo</a>
          <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Compras · bultos · guías · despacho</p>
          <h1>Entrás, pedís y te despachamos.</h1>
          <p className={styles.lead}>Custodia360 controla tus compras, bultos, guías, pases y entregas desde una mesa privada.</p>
          {(demoMode || errorMessage || authError) ? <div className={styles.notice}>{authError || errorMessage || "Modo demo activo para mostrar el sistema sin Supabase."}</div> : null}
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#consultar">Consultar pedido</a>
            <button type="button" className={styles.secondaryButton} onClick={demoMode ? enterDemo : signInWithGoogle} disabled={loading}>
              {demoMode ? "Ingreso equipo" : loading ? "Abriendo Google..." : "Ingreso trabajadores"}
            </button>
          </div>
        </div>

        <aside className={styles.accessCard} aria-label="Accesos Custodia360">
          <div className={styles.logoPanel}>
            <img src="/brand/custodia360_isologotipo.png" alt="Custodia360" />
          </div>

          <div id="consultar" className={styles.portalBox}>
            <span>Portal cliente</span>
            <h2>Buscá tu pedido</h2>
            <p>Ingresá con el código o link de invitación que te enviaron. No hay registro libre.</p>
            <div className={styles.codeRow}>
              <input value={clientCode} onChange={(event) => setClientCode(event.target.value)} placeholder="Código / invitación" />
              <button type="button" onClick={enterClientPortal}>Entrar</button>
            </div>
          </div>

          <div id="equipo" className={styles.teamBox}>
            <span>Equipo interno</span>
            <h2>Mesa de control</h2>
            <p>Acceso para owner, operadores y trabajadores autorizados.</p>
            <button type="button" onClick={demoMode ? enterDemo : signInWithGoogle} disabled={loading}>
              {demoMode ? "Entrar al demo" : "Continuar con Google"}
            </button>
          </div>
        </aside>
      </section>

      <section className={styles.promise} aria-label="Promesa operativa">
        <article><strong>01</strong><span>Pedís</span><p>El cliente pide por invitación y queda asociado a su ficha.</p></article>
        <article><strong>02</strong><span>Controlamos</span><p>Bultos, proveedor, guía, destino, pase y estado en una sola mesa.</p></article>
        <article><strong>03</strong><span>Despachamos</span><p>El cliente ve sus guías y puede consultar por WhatsApp.</p></article>
      </section>

      <footer className={styles.footer}>
        <span>Custodia360 · Sistema privado operativo</span>
        <a href={whatsappLink} target="_blank" rel="noreferrer">{whatsappNumber}</a>
        <a href={prestigeUrl} target="_blank" rel="noopener noreferrer">The Prestige Group</a>
      </footer>
    </main>
  );
}
