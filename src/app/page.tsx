import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.shell}>
      <BrandLockup subtitle="Control privado de bultos" />
      <div className={styles.hero}>
        <p>Compras · bultos · guías</p>
        <h1>Todo el despacho bajo control.</h1>
        <span>Una mesa privada para ver pedidos, guías y cobros sin perder el rastro.</span>
      </div>
      <Link className={styles.loginButton} href="/login">Ingresar</Link>
      <nav className={styles.legal} aria-label="Legal">
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
      </nav>
    </section>
  </main>;
}
