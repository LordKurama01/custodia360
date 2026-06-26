import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Términos y condiciones", description: "Condiciones base de uso de Custodia360." };

export default function TermsPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.header}><span>Legal</span><h1>Términos y condiciones</h1><p>Última actualización: [FECHA_ULTIMA_ACTUALIZACION]</p></section>
    <section className={styles.card}>
      <p>Estos términos regulan el uso de [DOMINIO_WEB] y los servicios vinculados a [NOMBRE_COMERCIAL]. Los datos definitivos del titular deben ser completados por [RESPONSABLE_DEL_SITIO].</p>
      <h2>Identificación</h2><ul><li>Nombre comercial: [NOMBRE_COMERCIAL]</li><li>Razón social: [RAZON_SOCIAL]</li><li>CUIT: [CUIT]</li><li>Domicilio: [DOMICILIO], [PROVINCIA], [PAIS]</li></ul>
      <h2>Uso permitido</h2><p>El sitio y el portal se ofrecen para consultar, gestionar o solicitar información sobre operaciones de custodia, bultos, guías, pases, pedidos y comunicaciones vinculadas al servicio.</p>
      <h2>Responsabilidad del usuario</h2><p>El usuario debe aportar datos correctos, mantener resguardado su link de invitación y no compartir accesos privados con terceros no autorizados.</p>
      <h2>Pagos, guías y saldos</h2><p>Los importes visibles pueden depender del dólar vigente, estado de guía, pagos parciales, reintegros o acuerdos operativos. Todo dato comercial debe ser confirmado por el responsable del servicio.</p>
      <h2>Contacto</h2><p>Canales: [EMAIL_CONTACTO] · [WHATSAPP].</p>
      <p className={styles.notice}>Texto base editable. Debe ser revisado por el titular o asesor legal antes de uso definitivo.</p>
    </section>
    <footer className={styles.footer}><Link href="/">Inicio</Link><span>Términos · Privacidad · Cookies</span></footer>
  </div></main>;
}
