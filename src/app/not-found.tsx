import Link from "next/link";
import styles from "./home.module.css";

export default function NotFound() {
  const wsp = "https://wa.me/5493757653075?text=Hola%2C%20necesito%20ayuda%20con%20un%20enlace%20de%20Custodia360.";
  return <main className={styles.page}>
    <section className={styles.hero} style={{ minHeight: "70vh", gridTemplateColumns: "1fr" }}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Página no encontrada</p>
        <h1>No encontramos este enlace.</h1>
        <p>Puede que la dirección haya cambiado, que el código no exista o que el acceso haya expirado.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Volver al inicio</Link>
          <a className={styles.secondary} href={wsp} target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
        </div>
      </div>
    </section>
  </main>;
}
