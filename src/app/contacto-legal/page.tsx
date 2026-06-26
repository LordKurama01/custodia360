import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Contacto legal", description: "Canales formales de contacto para Custodia360." };

export default function LegalContactPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.header}><span>Contacto formal</span><h1>Contacto legal</h1></section>
    <section className={styles.card}>
      <p>Para consultas formales sobre el sitio, privacidad, datos o condiciones de uso, utilizar los siguientes canales:</p>
      <ul><li>Responsable: [RESPONSABLE_DEL_SITIO]</li><li>Email: [EMAIL_CONTACTO]</li><li>WhatsApp: [WHATSAPP]</li><li>Razón social: [RAZON_SOCIAL]</li><li>CUIT: [CUIT]</li></ul>
      <p className={styles.notice}>Completar datos reales antes de publicación definitiva.</p>
    </section>
    <footer className={styles.footer}><Link href="/">Inicio</Link><span>Contacto legal · Custodia360</span></footer>
  </div></main>;
}
