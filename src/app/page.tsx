import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

const sellingPoints = ["Mesa tipo pizarrón", "Contactos ordenados", "Cobros y guías activas"];
const flow = [
  ["01", "Pedís", "Compra o consulta"],
  ["02", "Controlás", "Proveedor, bultos y estado"],
  ["03", "Despachás", "Guías, cobros y confirmación"],
];

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.landingShell}>
      <header className={styles.topbar}>
        <BrandLockup subtitle="Mesa privada de logística" />
        <span className={styles.privateTag}>Acceso privado</span>
      </header>

      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <p>COMPRA · CUSTODIA · DESPACHO</p>
          <h1>Entrás, pedís y te despachamos.</h1>
          <span>Custodia360 ordena compras, bultos, proveedores, guías y cobros en una mesa privada para no perder el rastro de cada pedido.</span>

          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/login">Ingresar al sistema</Link>
          </div>
        </div>

        <aside className={styles.sideCard} aria-label="Resumen de Custodia360">
          <p>MESA PRIVADA</p>
          <h2>Todo bajo control.</h2>
          <span>Ves qué está en proveedor, qué se retiró, qué quedó en depósito, qué salió con guía y qué falta cobrar.</span>
          <div className={styles.sideList}>
            {sellingPoints.map((item) => <strong key={item}>{item}</strong>)}
          </div>
        </aside>
      </div>

      <div className={styles.flowStrip} aria-label="Cómo trabaja Custodia360">
        {flow.map(([number, title, text]) => <article key={number}>
          <b>{number}</b>
          <div>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        </article>)}
      </div>

      <nav className={styles.legal} aria-label="Legal">
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
      </nav>
    </section>
  </main>;
}
