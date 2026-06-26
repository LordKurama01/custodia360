import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Política de cookies", description: "Uso de cookies técnicas y medición en Custodia360." };

export default function CookiesPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.header}><span>Cookies</span><h1>Política de cookies</h1><p>Última actualización: [FECHA_ULTIMA_ACTUALIZACION]</p></section>
    <section className={styles.card}>
      <p>El sitio puede utilizar cookies técnicas para recordar preferencias y cookies de análisis para medir uso de rutas públicas cuando el usuario acepta.</p>
      <h2>Cookies técnicas</h2><p>Permiten recordar la preferencia de cookies y mantener funciones básicas del sitio.</p>
      <h2>Cookies de análisis</h2><p>Google Analytics 4 puede cargarse sólo si existe NEXT_PUBLIC_GA_MEASUREMENT_ID y el usuario acepta cookies. No deben enviarse datos privados del portal o dashboard.</p>
      <h2>Cómo aceptar o rechazar</h2><p>El banner inicial permite aceptar o rechazar. La preferencia se guarda localmente en el navegador.</p>
      <p className={styles.notice}>Texto base editable. Debe ser revisado por el titular o asesor legal antes de uso definitivo.</p>
    </section>
    <footer className={styles.footer}><Link href="/">Inicio</Link><span>Términos · Privacidad · Cookies</span></footer>
  </div></main>;
}
