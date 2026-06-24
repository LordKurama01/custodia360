"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Bultos"><Card><DataTable><thead><tr><th>Código</th><th>Descripción</th><th>Cantidad</th><th>Estado</th></tr></thead><tbody>{data.packages.map(p => <tr key={p.id}><td><strong>{p.code}</strong></td><td>{p.description}</td><td>{p.quantity}</td><td><StatusBadge status={p.status}/></td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
