"use client";
import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import styles from "./configuracion.module.css";

const configRows = [
  { area: "Datos del negocio", estado: "Preparado para configurar", action: null },
  { area: "Usuarios", estado: "Preparado por dueño", action: null },
  { area: "Estados operativos", estado: "Preparado por módulo", action: null },
  { area: "Pasarelas de pago", estado: "Configurable por dueño", action: { href: "/owner/configuracion/pagos", label: "Configurar pagos" } },
];

export default function Page() {
  return <OwnerDesktopShell title="Configuración">
    <Card className={styles.configCard}>
      <div className={styles.configIntro}>
        <h2>Configuración del espacio operativo</h2>
        <p>Configuración aislada por dueño. Los cambios de un negocio no afectan a otros dueños ni a sus clientes, choferes u operarios.</p>
      </div>

      <div className={styles.desktopTable}>
        <DataTable><thead><tr><th>Área</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
          {configRows.map((row) => <tr key={row.area}><td>{row.area}</td><td>{row.estado}</td><td>{row.action ? <Link href={row.action.href}><Button variant="secondary">{row.action.label}</Button></Link> : "-"}</td></tr>)}
        </tbody></DataTable>
      </div>

      <div className={styles.mobileConfigList} aria-label="Configuración del espacio">
        {configRows.map((row) => <div className={styles.mobileConfigItem} key={row.area}>
          <div><strong>{row.area}</strong><span>{row.estado}</span></div>
          {row.action ? <Link href={row.action.href}><Button variant="secondary">{row.action.label}</Button></Link> : <b>—</b>}
        </div>)}
      </div>
    </Card>
  </OwnerDesktopShell>;
}
