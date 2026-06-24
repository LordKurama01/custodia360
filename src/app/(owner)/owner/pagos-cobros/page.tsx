"use client";
import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { formatMoney } from "@/shared/lib/format";

export default function Page() {
  const data = useTenantData();
  const activeGateway = data.paymentGateways.find(g => g.status === "conectada") ?? data.paymentGateways[0];
  return <OwnerDesktopShell title="Pagos / Cobros">
    <Card>
      <h2>Pasarela del dueño</h2>
      {activeGateway ? <p>{activeGateway.displayName} · estado: <strong>{activeGateway.status.replaceAll("_", " ")}</strong></p> : <p>Este dueño todavía no configuró pasarela de pago.</p>}
      <Link href="/owner/configuracion/pagos"><Button variant="secondary">Configurar pasarela</Button></Link>
    </Card>
    <Card>
      <DataTable><thead><tr><th>Código</th><th>Concepto</th><th>Monto</th><th>Estado</th><th>Pasarela</th><th>Checkout</th></tr></thead><tbody>{data.payments.map(p => <tr key={p.id}><td><strong>{p.code}</strong></td><td>{p.concept}</td><td>{formatMoney(p.amount)}</td><td>{p.status}</td><td>{p.provider ?? "manual"}</td><td>{p.checkoutUrl ? "link preparado" : "sin link"}</td></tr>)}</tbody></DataTable>
    </Card>
  </OwnerDesktopShell>;
}
