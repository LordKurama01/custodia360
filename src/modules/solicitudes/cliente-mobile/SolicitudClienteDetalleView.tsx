"use client";
import { MobileShell, clienteNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/modules/mobileShared/mobileComponents.module.css";
export function SolicitudClienteDetalleView({id}:{id:string}){ const data=useTenantData(); const r=data.requests.find(x=>x.id===id); if(!r) return <MobileShell roleLabel="Cliente" nav={clienteNav}><MobileSection>No encontrada</MobileSection></MobileShell>; return <MobileShell roleLabel="Cliente" nav={clienteNav}><MobileHero title={r.code} subtitle="Seguimiento de tu solicitud"/><MobileSection><div className={styles.detail}><div className={styles.detailRow}><span>Estado</span><StatusBadge status={r.status} role="cliente"/></div><div className={styles.detailRow}><span>Retiro</span><strong>{r.originName}</strong></div><div className={styles.detailRow}><span>Destino</span><strong>{r.destinationCity}</strong></div><div className={styles.detailRow}><span>Bulto</span><strong>{r.productDescription}</strong></div><Button>Confirmar recibido</Button><Button variant="danger">Reportar problema</Button></div></MobileSection></MobileShell> }
