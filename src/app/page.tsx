import Link from "next/link";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.shell}>
      <BrandLockup subtitle="Control privado de bultos" />
      <div className={styles.hero}>
        <p>Compras · bultos · guías · cobros</p>
        <h1>Controlá cada despacho sin perder el rastro.</h1>
        <span>Custodia360 convierte el pizarrón, la agenda y la cuenta corriente en una mesa privada para trabajar desde el celular.</span>
      </div>
      <div className={styles.benefits} aria-label="Beneficios">
        <span>Mesa operativa</span>
        <span>Contactos y proveedores</span>
        <span>Cobros y guías activas</span>
      </div>
      <Link className={styles.loginButton} href="/login">Ingresar al sistema</Link>
      <nav className={styles.legal} aria-label="Legal">
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
      </nav>
    </section>
  </main>;
}
