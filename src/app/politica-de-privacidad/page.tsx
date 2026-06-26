import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Política de privacidad", description: "Tratamiento base de datos y privacidad en Custodia360." };

export default function PrivacyPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.header}><span>Privacidad</span><h1>Política de privacidad</h1><p>Última actualización: [FECHA_ULTIMA_ACTUALIZACION]</p></section>
    <section className={styles.card}>
      <p>[NOMBRE_COMERCIAL] puede tratar datos necesarios para operar el servicio: nombre, WhatsApp, email, datos de pedido, guías, pagos visibles, observaciones operativas y comunicaciones.</p>
      <h2>Finalidad</h2><ul><li>Gestionar consultas, invitaciones y acceso al portal.</li><li>Registrar operaciones, bultos, guías, pases, pagos y cuenta corriente.</li><li>Contactar por WhatsApp o canales informados.</li><li>Medir uso de rutas públicas si Analytics está configurado y consentido.</li></ul>
      <h2>Rutas privadas</h2><p>El portal cliente y panel interno son privados. No deben indexarse ni enviarse a Analytics datos sensibles como nombres, teléfonos, guías, domicilios, DNI/CUIT, saldos o pagos.</p>
      <h2>Conservación y derechos</h2><p>Los datos se conservan mientras sean necesarios para el servicio. Para solicitar actualización o baja, contactar a [EMAIL_CONTACTO] o [WHATSAPP].</p>
      <p className={styles.notice}>Texto base editable. Debe ser revisado por el titular o asesor legal antes de uso definitivo.</p>
    </section>
    <footer className={styles.footer}><Link href="/">Inicio</Link><span>Privacidad · Cookies · Contacto legal</span></footer>
  </div></main>;
}
