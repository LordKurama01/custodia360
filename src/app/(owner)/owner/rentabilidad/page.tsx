"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatMoney } from "@/shared/lib/format";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Rentabilidad"><Card><DataTable><thead><tr><th>Tipo</th><th>Entidad</th><th>Ingreso</th><th>Gasto</th><th>Resultado</th></tr></thead><tbody>{data.profitability.map(p => <tr key={p.id}><td><strong>{p.entityType}</strong></td><td>{p.entityId}</td><td>{formatMoney(p.income)}</td><td>{formatMoney(p.expenses)}</td><td>{formatMoney(p.income-p.expenses)}</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
