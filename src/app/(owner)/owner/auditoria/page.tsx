"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Auditoría"><Card><DataTable><thead><tr><th>Fecha</th><th>Usuario</th><th>Entidad</th><th>Acción</th></tr></thead><tbody>{data.audit.map(a => <tr key={a.id}><td>{a.createdAt}</td><td>{a.userName}</td><td>{a.entityType}</td><td>{a.action}</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
