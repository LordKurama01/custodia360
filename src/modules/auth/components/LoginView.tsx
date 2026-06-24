"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { isDemoMode } from "@/shared/lib/demoMode";
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
          <span className={styles.brandSlot}>360</span>
          <span className={styles.brandCopy}>
            <span>Custodia</span>
            <strong>360</strong>
          </span>
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
          <p className={styles.eyebrow}>Logistica · Transporte · Seguridad operativa</p>
          <h1>Gestion privada para operaciones logisticas.</h1>
          <p className={styles.lead}>
            Centraliza solicitudes, retiros, tareas, choferes, guias y evidencias en un sistema seguro de trabajo.
          </p>
          {demoMode ? <div className={styles.errorBox}>Modo demo local activo. No requiere Supabase ni Gmail para mostrar el sistema.</div> : errorMessage || authError ? <div className={styles.errorBox}>{authError || errorMessage}</div> : null}
          <div className={styles.heroActions}>
            <button type="button" className={styles.primary} onClick={demoMode ? enterDemo : signInWithGoogle} disabled={loading}>
              {demoMode ? "Ingresar en modo demo" : loading ? "Abriendo Google..." : "Continuar con Google"}
            </button>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className={styles.secondary}>Contactar por WhatsApp</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Visual operativo Custodia360">
          <img src="/media/logistics-hero-green.svg" alt="Mapa operativo con solicitud, tarea, guia y trazabilidad" />
          <div className={styles.signalCard}>
            <strong>Operacion activa</strong>
            <span>CLI / JR / TAR / GUI</span>
          </div>
        </div>
      </section>

      <section id="soluciones" className={styles.quickActions} aria-label="Soluciones operativas">
        <article>
          <span>01</span>
          <h2>Solicitudes ordenadas</h2>
          <p>Pedidos con retiro, destino, bulto y comprobantes.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Trabajo asignado</h2>
          <p>Tareas claras para choferes y operarios.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Trazabilidad segura</h2>
          <p>Fotos, guias, estados e incidencias por usuario.</p>
        </article>
      </section>

      <section id="operacion" className={styles.operationBlock}>
        <div>
          <p className={styles.sectionLabel}>Sistema de trabajo</p>
          <h2>Del pedido al despacho, con responsables y evidencia.</h2>
          <p>
            El cliente consulta sus bultos por link privado y el equipo interno actualiza estados, guias y pagos.
          </p>
        </div>
        <div className={styles.flowCard} aria-label="Flujo operativo Custodia360">
          <div><strong>CLI</strong><span>Cliente</span></div>
          <div><strong>BLT</strong><span>Bulto</span></div>
          <div><strong>GUI</strong><span>Guia</span></div>
          <div><strong>COB</strong><span>Cobro</span></div>
          <div><strong>AUD</strong><span>Auditoria</span></div>
        </div>
      </section>

      <section id="seguridad" className={styles.securityStrip}>
        <div>
          <strong>Ingreso con Google</strong>
          <span>Solo entran Gmail autorizados en Supabase.</span>
        </div>
        <div>
          <strong>Roles internos</strong>
          <span>Owner, admin, operador, cobranzas y solo lectura.</span>
        </div>
        <div>
          <strong>Consulta cliente</strong>
          <span>Link privado por codigo, sin acceso de edicion.</span>
        </div>
      </section>

      <footer className={styles.prestigeFooter}>
        <div className={styles.footerBrand}>
          <span>Custodia360</span>
          <small>Logistica · Transporte · Seguridad operativa · Trazabilidad</small>
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
