"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Incidencias"><Card><DataTable><thead><tr><th>Código</th><th>Título</th><th>Entidad</th><th>Estado</th></tr></thead><tbody>{data.incidents.map(i => <tr key={i.id}><td><strong>{i.code}</strong></td><td>{i.title}</td><td>{i.entityType}</td><td>{i.status}</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
