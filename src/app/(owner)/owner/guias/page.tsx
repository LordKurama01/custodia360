"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Guías"><Card><DataTable><thead><tr><th>Código</th><th>Transporte</th><th>Número</th><th>Estado</th></tr></thead><tbody>{data.guides.map(g => <tr key={g.id}><td><strong>{g.code}</strong></td><td>{g.carrier}</td><td>{g.guideNumber}</td><td><StatusBadge status={g.status}/></td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
