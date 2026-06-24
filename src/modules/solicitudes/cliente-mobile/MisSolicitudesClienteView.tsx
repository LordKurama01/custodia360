"use client";
import Link from "next/link";
import { MobileShell, clienteNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/modules/mobileShared/mobileComponents.module.css";
export function MisSolicitudesClienteView(){ const data=useTenantData(); const list=data.requests.filter(r=>r.clientId==="client-a1"); return <MobileShell roleLabel="Cliente" nav={clienteNav}><MobileHero title="Mis solicitudes" subtitle="Estados simplificados, sin operación interna."/><div className={styles.list}>{list.map(r=><Link href={`/cliente/mis-solicitudes/${r.id}`} key={r.id}><div className="mobile-card"><strong>{r.code}</strong><p>{r.originName} → {r.destinationCity}</p><StatusBadge status={r.status} role="cliente"/></div></Link>)}</div></MobileShell> }
