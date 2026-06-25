"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { isDemoMode } from "@/shared/lib/demoMode";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./LoginView.module.css";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+54 9 236 000-0000";
const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/5492360000000";
const prestigeUrl = process.env.NEXT_PUBLIC_PRESTIGE_URL ?? "https://theprestige-group.com/";

export function LoginView() {
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") ?? "/owner/bultos";
  const demoMode = isDemoMode();

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") return "Tu Gmail no esta autorizado o tu usuario esta inactivo.";
    if (error === "server") return "No se pudo validar el acceso. Revisa la configuracion de Supabase.";
    if (error === "auth_callback") return "No se pudo completar el login con Google.";
    return "";
  }, [searchParams]);

  const enterDemo = () => {
    window.location.href = "/owner/bultos";
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
      setAuthError(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/login" className={styles.brand} aria-label="Custodia360 inicio">
          <BrandLockup subtitle="Control privado de bultos" />
        </Link>

        <nav className={styles.nav} aria-label="Navegacion principal">
          <a href="#soluciones">Soluciones</a>
          <a href="#operacion">Operacion</a>
          <a href="#seguridad">Seguridad</a>
          <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>
          <button type="button" className={styles.loginButton} onClick={demoMode ? enterDemo : signInWithGoogle} disabled={loading}>
            {demoMode ? "Ingresar demo" : loading ? "Conectando..." : "Ingresar"}
          </button>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Control de bultos · Guías · Pases USD</p>
          <h1>Mesa privada para controlar bultos, guías y cuentas corrientes.</h1>
          <p className={styles.lead}>
            Custodia360 ordena la operación real: clientes, bultos, guías, pases pendientes, pagos parciales y resúmenes claros por WhatsApp.
          </p>
          {demoMode ? <div className={styles.errorBox}>Modo demo local activo. No requiere Supabase ni Gmail para mostrar el sistema.</div> : errorMessage || authError ? <div className={styles.errorBox}>{authError || errorMessage}</div> : null}
          <div className={styles.heroActions}>
            <button type="button" className={styles.primary} onClick={demoMode ? enterDemo : signInWithGoogle} disabled={loading}>
              {demoMode ? "Ingresar al sistema" : loading ? "Abriendo Google..." : "Continuar con Google"}
            </button>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className={styles.secondary}>Contactar por WhatsApp</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Visual operativo Custodia360">
          <img src="/brand/custodia360_banner_1920x640.png" alt="Mapa operativo con solicitud, tarea, guia y trazabilidad" />
          <div className={styles.signalCard}>
            <strong>Operacion activa</strong>
            <span>CLI / JR / TAR / GUI</span>
          </div>
        </div>
      </section>

      <section id="soluciones" className={styles.quickActions} aria-label="Soluciones operativas">
        <article>
          <span>01</span>
          <h2>Bultos bajo control</h2>
          <p>Cada operación conserva cliente, proveedor, estado, guías y destinatarios.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Cuenta corriente simple</h2>
          <p>Pases USD, guías a reintegrar, pagos parciales y saldo por cliente.</p>
        </article>
        <article>
          <span>03</span>
          <h2>WhatsApp sin cuentas sueltas</h2>
          <p>El resumen sale desde la base: qué debe, qué pagó y qué falta cobrar.</p>
        </article>
      </section>

      <section id="operacion" className={styles.operationBlock}>
        <div>
          <p className={styles.sectionLabel}>Sistema de trabajo</p>
          <h2>De la compra al despacho, con cuenta clara por cliente.</h2>
          <p>
            El owner trabaja desde una mesa de control. El cliente ve una consulta simple: estado, guías, pases pendientes y contacto directo.
          </p>
        </div>
        <div className={styles.flowCard} aria-label="Flujo operativo Custodia360">
          <div><strong>CLI</strong><span>Cliente</span></div>
          <div><strong>BLT</strong><span>Bulto</span></div>
          <div><strong>GUI</strong><span>Guía</span></div>
          <div><strong>PAS</strong><span>Pase USD</span></div>
          <div><strong>CTA</strong><span>Cuenta</span></div>
        </div>
      </section>

      <section id="seguridad" className={styles.securityStrip}>
        <div>
          <strong>Ingreso controlado</strong>
          <span>Acceso privado para owner y equipo autorizado.</span>
        </div>
        <div>
          <strong>Operación separada</strong>
          <span>Mobile para velocidad; desktop para mesa de oficina.</span>
        </div>
        <div>
          <strong>Cliente simple</strong>
          <span>Ve estado, guías y deuda visible sin entrar a la cocina interna.</span>
        </div>
      </section>

      <footer className={styles.prestigeFooter}>
        <div className={styles.footerBrand}>
          <span>Custodia360</span>
          <small>Control de bultos · Guías · Pases USD · Trazabilidad</small>
        </div>
        <a href={prestigeUrl} target="_blank" rel="noopener noreferrer" className={styles.prestigeFooterLink}>
          <img src="/brand/prestige-diamond.png" alt="Prestige Group" />
          <span>PRESTIGE GROUP</span>
        </a>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className={styles.footerContact}>{whatsappNumber}</a>
      </footer>
    </main>
  );
}
