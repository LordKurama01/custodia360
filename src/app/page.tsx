import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

export default function HomePage() {
  const wsp = "https://wa.me/5493757653075?text=Hola%2C%20quiero%20hacer%20un%20pedido%20o%20consultar%20por%20Custodia360.";

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLockup subtitle="Mesa privada de logística" />
      <nav>
        <Link href="/consulta/demo">Tengo invitación</Link>
        <Link href="/login">Ingreso equipo</Link>
      </nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Compra · custodia · despacho</p>
        <h1>Entrás, pedís y te despachamos.</h1>
        <p>Controlamos tus compras, bultos, guías y pases desde una mesa privada. Si ya tenés código, consultás tu pedido. Si no, hablás directo por WhatsApp.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/consulta/demo">Tengo invitación</Link>
          <a className={styles.secondary} href={wsp} target="_blank" rel="noreferrer">Quiero hacer un pedido</a>
          <Link className={styles.ghost} href="/login">Ingreso equipo</Link>
        </div>
      </div>

      <div className={styles.panel}>
        <span>Consulta privada</span>
        <strong>¿Ya tenés invitación?</strong>
        <p>El acceso al portal cliente se activa por link enviado por WhatsApp. Si no tenés link, escribinos y armamos tu pedido.</p>
        <Link href="/consulta/demo">Entrar con invitación</Link>
      </div>
    </section>

    <section className={styles.steps}>
      <div><span>1</span><strong>Pedís</strong><p>Mandás la compra o consulta.</p></div>
      <div><span>2</span><strong>Controlamos</strong><p>Bultos, guías y pases.</p></div>
      <div><span>3</span><strong>Despachamos</strong><p>Recibís guía y seguimiento.</p></div>
    </section>

    <footer className={styles.footer}>
      <span>© 2026 Custodia360</span>
      <nav>
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
        <Link href="/contacto-legal">Contacto legal</Link>
      </nav>
    </footer>
  </main>;
}
