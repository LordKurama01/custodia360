import Link from "next/link";
import styles from "./LoginView.module.css";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+54 9 236 000-0000";
const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/5492360000000";
const prestigeUrl = process.env.NEXT_PUBLIC_PRESTIGE_URL ?? "https://theprestige-group.com/";

export function LoginView() {
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

        <nav className={styles.nav} aria-label="Navegación principal">
          <a href="#soluciones">Soluciones</a>
          <a href="#operacion">Operación</a>
          <a href="#seguridad">Seguridad</a>
          <a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp</a>
          <Link href="/owner/dashboard" className={styles.loginButton}>Ingresar</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Logística · Transporte · Seguridad operativa</p>
          <h1>Gestión privada para operaciones logísticas.</h1>
          <p className={styles.lead}>
            Centralizá solicitudes, retiros, tareas, choferes, guías y evidencias en un sistema seguro de trabajo.
          </p>
          <div className={styles.heroActions}>
            <Link href="/owner/dashboard" className={styles.primary}>Ingresar al sistema</Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className={styles.secondary}>Contactar por WhatsApp</a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Visual operativo Custodia360">
          <img src="/media/logistics-hero-green.svg" alt="Mapa operativo con solicitud, tarea, guía y trazabilidad" />
          <div className={styles.signalCard}>
            <strong>Operación activa</strong>
            <span>CLI → JR → TAR → GUI</span>
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
          <p>Fotos, guías, estados e incidencias por usuario.</p>
        </article>
      </section>

      <section id="operacion" className={styles.operationBlock}>
        <div>
          <p className={styles.sectionLabel}>Sistema de trabajo</p>
          <h2>Del pedido al despacho, con responsables y evidencia.</h2>
          <p>
            El cliente carga una solicitud, el dueño la aprueba, el equipo ejecuta y cada avance queda registrado.
          </p>
        </div>
        <div className={styles.flowCard} aria-label="Flujo operativo Custodia360">
          <div><strong>CLI</strong><span>Solicitud</span></div>
          <div><strong>JR</strong><span>Orden interna</span></div>
          <div><strong>TAR</strong><span>Tarea</span></div>
          <div><strong>GUI</strong><span>Guía</span></div>
          <div><strong>COB</strong><span>Cobro</span></div>
        </div>
      </section>

      <section id="seguridad" className={styles.securityStrip}>
        <div>
          <strong>Ingreso único</strong>
          <span>La vista se asigna según permisos. El usuario no elige su rol.</span>
        </div>
        <div>
          <strong>Multi-dueño aislado</strong>
          <span>Cada negocio ve solo sus clientes, choferes y operaciones.</span>
        </div>
        <div>
          <strong>Pasarelas por negocio</strong>
          <span>Cada dueño puede configurar su forma de cobro sin afectar al resto.</span>
        </div>
      </section>

      <footer className={styles.prestigeFooter}>
        <div className={styles.footerBrand}>
          <span>Custodia360</span>
          <small>Logística · Transporte · Seguridad operativa · Trazabilidad</small>
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
