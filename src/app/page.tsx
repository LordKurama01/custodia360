import Link from "next/link";
import Image from "next/image";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./home.module.css";

const operations = [
  ["Pedidos", "Cliente, proveedor y bultos en una mesa."],
  ["Guías", "Despacho, número y condición de cobro."],
  ["Cobros", "Saldos, adelantos y dinero a cuenta."],
];
const boardRows = [
  ["Mesa", "Retirar", "5 pedidos"],
  ["Guías", "Sin número", "2 pendientes"],
  ["Cobros", "A cuenta", "$ 500.000"],
];

export default function HomePage() {
  return <main className={styles.page}>
    <section className={styles.landingShell}>
      <header className={styles.topbar}>
        <BrandLockup subtitle="Mesa privada de logística" />
        <Link className={styles.loginPill} href="/login">Ingresar</Link>
      </header>

      <section className={styles.heroStage} aria-label="Custodia360 acceso principal">
        <div className={styles.heroCopy}>
          <p>COMPRA · CUSTODIA · DESPACHO</p>
          <h1>Entrás, pedís y te despachamos.</h1>
          <span>Custodia360 ordena pedidos, bultos, proveedores, guías y cobros en una mesa privada de operación.</span>

          <div className={styles.operationLine} aria-label="Alcance operativo">Pedidos · Bultos · Guías · Cobros</div>
        </div>

        <aside className={styles.desktopPreview} aria-label="Vista rápida del sistema">
          <div className={styles.previewTop}>
            <Image src="/brand/custodia360_isotipo.png" alt="" width={42} height={42} />
            <div>
              <strong>Control operativo</strong>
              <span>Pedidos · Guías · Cobros</span>
            </div>
          </div>
          <div className={styles.previewRows}>
            {boardRows.map(([label, state, value]) => <article key={label}>
              <div>
                <span>{label}</span>
                <strong>{state}</strong>
              </div>
              <b>{value}</b>
            </article>)}
          </div>
          <div className={styles.previewFooter}>
            {operations.map(([title, text]) => <div key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>)}
          </div>
        </aside>
      </section>

      <nav className={styles.legal} aria-label="Legal">
        <Link href="/terminos-y-condiciones">Términos</Link>
        <Link href="/politica-de-privacidad">Privacidad</Link>
        <Link href="/politica-de-cookies">Cookies</Link>
      </nav>
    </section>
  </main>;
}
