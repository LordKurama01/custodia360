"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Evidencias"><Card><DataTable><thead><tr><th>Archivo</th><th>Entidad</th><th>Tipo</th><th>Fecha</th></tr></thead><tbody>{data.evidences.map(e => <tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.entityType}</td><td>{e.type}</td><td>{e.uploadedAt}</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
