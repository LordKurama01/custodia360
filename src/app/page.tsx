import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

const modules = [
  ["Mesa operativa", "Pizarrón digital para ver qué está en proveedor, qué se retiró, qué está en depósito y qué ya se despachó."],
  ["Contactos", "Clientes y proveedores separados, buscables y con ficha propia para no perder datos ni conversaciones."],
  ["Cobros", "Pendientes, parciales, adelantos, reintegros y dinero a cuenta en una vista contable simple."],
  ["Guías", "Guías activas, sin número, despachadas o a confirmar, vinculadas a cada cliente."],
];

const steps = ["Pedís", "Controlamos", "Despachamos", "Confirmás"];

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.heroSection}>
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <BrandLockup subtitle="Control privado de bultos" />
          <Link className={styles.accessLink} href="/login">Ingresar</Link>
        </div>

        <div className={styles.heroCopy}>
          <p>COMPRAS · BULTOS · GUÍAS · COBROS</p>
          <h1>Ordená cada despacho sin perder el rastro.</h1>
          <span>Custodia360 convierte el pizarrón, la agenda de clientes, los proveedores, las guías y la cuenta corriente en una mesa privada para operar desde el celular.</span>
        </div>

        <div className={styles.heroActions}>
          <Link className={styles.primaryCta} href="/login">Ingresar al sistema</Link>
          <a className={styles.secondaryCta} href="#como-funciona">Ver cómo funciona</a>
        </div>

        <div className={styles.trustStrip}>
          <span>Mesa tipo pizarrón</span>
          <span>Clientes y proveedores</span>
          <span>Cobros y guías</span>
        </div>
      </div>
    </section>

    <section id="como-funciona" className={styles.sectionBlock}>
      <p className={styles.eyebrow}>Cómo trabaja</p>
      <h2>Del pedido al despacho, todo queda visible.</h2>
      <div className={styles.stepGrid}>
        {steps.map((step, index) => <article key={step}>
          <b>{String(index + 1).padStart(2, "0")}</b>
          <strong>{step}</strong>
          <span>{index === 0 ? "El cliente o el equipo carga la compra." : index === 1 ? "Se controla estado, proveedor y bultos." : index === 2 ? "Se cargan guías y condiciones." : "El cliente confirma y se archiva."}</span>
        </article>)}
      </div>
    </section>

    <section className={styles.sectionBlock}>
      <p className={styles.eyebrow}>Módulos principales</p>
      <h2>Una app simple para operar y cobrar.</h2>
      <div className={styles.moduleGrid}>
        {modules.map(([title, copy]) => <article key={title}>
          <strong>{title}</strong>
          <span>{copy}</span>
        </article>)}
      </div>
    </section>

    <section className={styles.closeCard}>
      <div>
        <p className={styles.eyebrow}>Acceso privado</p>
        <h2>Entrá con Gmail y abrí tu espacio.</h2>
        <span>El sistema detecta el usuario autorizado y muestra la vista que corresponde: cliente, trabajador, dueño o plataforma.</span>
      </div>
      <Link className={styles.primaryCta} href="/login">Ingresar</Link>
    </section>

    <nav className={styles.legal} aria-label="Legal">
      <Link href="/terminos-y-condiciones">Términos</Link>
      <Link href="/politica-de-privacidad">Privacidad</Link>
      <Link href="/politica-de-cookies">Cookies</Link>
    </nav>
  </main>;
}
