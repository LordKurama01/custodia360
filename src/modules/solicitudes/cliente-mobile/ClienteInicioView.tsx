"use client";
import Link from "next/link";
import { MobileShell, clienteNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileKpi } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/Button";
import styles from "@/modules/mobileShared/mobileComponents.module.css";

export function ClienteInicioView() {
  const data = useTenantData();
  const clientRequests = data.requests.filter(r => r.clientId === "client-a1");
  return <MobileShell roleLabel="Cliente" nav={clienteNav}>
    <MobileHero title="Mis operaciones" subtitle="Cargá solicitudes y consultá el avance sin entrar al sistema interno." />
    <div className={styles.kpis}><MobileKpi label="Solicitudes" value={clientRequests.length}/><MobileKpi label="Pendientes" value={clientRequests.filter(r=>r.status!=="entregado").length}/></div>
    <Link href="/cliente/nueva-solicitud"><Button style={{width:"100%"}}>Nueva solicitud</Button></Link>
    <div className={styles.list}>{clientRequests.map(r => <Link key={r.id} href={`/cliente/mis-solicitudes/${r.id}`}><div className="mobile-card"><strong>{r.code}</strong><p>{r.productDescription}</p><StatusBadge status={r.status} role="cliente"/></div></Link>)}</div>
  </MobileShell>;
}
