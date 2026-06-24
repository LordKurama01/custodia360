"use client";
import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";

export default function Page() {
  return <OwnerDesktopShell title="Configuración">
    <Card>
      <h2>Configuración del espacio operativo</h2>
      <p>Configuración aislada por dueño. Los cambios de un negocio no afectan a otros dueños ni a sus clientes, choferes u operarios.</p>
      <DataTable><thead><tr><th>Área</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
        <tr><td>Datos del negocio</td><td>Preparado para configurar</td><td>-</td></tr>
        <tr><td>Usuarios</td><td>Preparado por dueño</td><td>-</td></tr>
        <tr><td>Estados operativos</td><td>Preparado por módulo</td><td>-</td></tr>
        <tr><td>Pasarelas de pago</td><td>Configurable por dueño</td><td><Link href="/owner/configuracion/pagos"><Button variant="secondary">Configurar pagos</Button></Link></td></tr>
      </tbody></DataTable>
    </Card>
  </OwnerDesktopShell>;
}
