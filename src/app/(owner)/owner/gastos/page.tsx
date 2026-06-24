"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatMoney } from "@/shared/lib/format";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Gastos"><Card><DataTable><thead><tr><th>Código</th><th>Concepto</th><th>Categoría</th><th>Monto</th></tr></thead><tbody>{data.expenses.map(e => <tr key={e.id}><td><strong>{e.code}</strong></td><td>{e.concept}</td><td>{e.category}</td><td>{formatMoney(e.amount)}</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
