import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.shell}>
      <BrandLockup subtitle="Control privado de bultos" />
      <div className={styles.hero}>
        <p>Compras · bultos · guías · despacho</p>
        <h1>Entrás, pedís y te despachamos.</h1>
        <span>Acceso único con Gmail. El sistema detecta si sos cliente, trabajador, dueño o super owner.</span>
      </div>
      <Link className={styles.loginButton} href="/login">Ingresar con Gmail</Link>
      <small className={styles.help}>¿No tenés acceso? Usá el WhatsApp del dueño del servicio.</small>
      <nav className={styles.legal} aria-label="Legal">
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
      </nav>
    </section>
  </main>;
}
