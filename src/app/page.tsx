import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

export default function HomePage() {
  const wsp = "https://wa.me/5493757653075?text=Hola%2C%20quiero%20consultar%20por%20Custodia360.";

  return <main className={styles.page}>
    <header className={styles.header}>
      <BrandLockup subtitle="Mesa privada de logística" />
      <nav>
        <Link href="/consulta/demo">Consultar pedido</Link>
        <Link href="/login">Ingreso equipo</Link>
      </nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Compra · custodia · despacho</p>
        <h1>Entrás, pedís y te despachamos.</h1>
        <p>Controlamos tus compras, bultos, guías y pases desde una mesa privada. Si ya tenés código, consultás tu pedido. Si no, hablás directo por WhatsApp.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/consulta/demo">Consultar pedido</Link>
          <a className={styles.secondary} href={wsp} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>
          <Link className={styles.ghost} href="/login">Ingreso equipo</Link>
        </div>
      </div>

      <div className={styles.panel}>
        <span>Consulta privada</span>
        <strong>¿Ya tenés invitación?</strong>
        <p>Entrá con tu link o código para ver estado, guías y saldo actualizado.</p>
        <Link href="/consulta/demo">Ver ejemplo</Link>
      </div>
    </section>

    <section className={styles.steps}>
      <div><span>1</span><strong>Pedís</strong><p>Mandás la compra o consulta.</p></div>
      <div><span>2</span><strong>Controlamos</strong><p>Bultos, guías y pases.</p></div>
      <div><span>3</span><strong>Despachamos</strong><p>Recibís guía y seguimiento.</p></div>
    </section>
  </main>;
}
