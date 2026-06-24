"use client";
import Link from "next/link";
import { MobileShell, choferNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileKpi, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/Button";
import styles from "@/modules/mobileShared/mobileComponents.module.css";

const driverId = "u-driver-a";
export function ChoferInicioView(){ const data=useTenantData(); const tasks=data.tasks.filter(t=>t.assignedToUserId===driverId); return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileHero title="Tareas de hoy" subtitle="Retiros, destinos y evidencias asignadas."/><div className={styles.kpis}><MobileKpi label="Asignadas" value={tasks.length}/><MobileKpi label="Incidencias" value={data.incidents.length}/></div><div className={styles.list}>{tasks.map(t=><Link href={`/chofer/tareas/${t.id}`} key={t.id}><div className="mobile-card"><strong>{t.code}</strong><p>{t.title}</p><StatusBadge status={t.status} role="chofer"/></div></Link>)}</div></MobileShell> }
export function ChoferTareasView(){return <ChoferInicioView/>}
export function ChoferTaskDetailView({id}:{id:string}){ const {actions}=useAppState(); const data=useTenantData(); const t=data.tasks.find(x=>x.id===id); if(!t)return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileSection>Tarea no encontrada</MobileSection></MobileShell>; const order=data.orders.find(o=>o.id===t.orderId); return <MobileShell roleLabel="Chofer" nav={choferNav}><MobileHero title={t.code} subtitle={t.title}/><MobileSection><div className={styles.detail}><div className={styles.detailRow}><span>Orden</span><strong>{order?.code}</strong></div><div className={styles.detailRow}><span>Estado</span><StatusBadge status={t.status} role="chofer"/></div><div className={styles.detailRow}><span>Instrucción</span><strong>{t.description}</strong></div><Button onClick={()=>actions.updateTaskStatus(t.id,"en_retiro",driverId)}>Iniciar retiro</Button><Button onClick={()=>actions.updateTaskStatus(t.id,"retirado",driverId)} variant="secondary">Marcar retirado</Button><Button onClick={()=>actions.updateTaskStatus(t.id,"despachado",driverId)} variant="secondary">Marcar despachado</Button><Button onClick={()=>actions.attachEvidence(t.tenantId,"tarea",t.id,"foto_retiro.jpg",driverId)} variant="ghost">Subir foto</Button><Button variant="danger" onClick={()=>actions.reportIncident(t.tenantId,"tarea",t.id,"Problema en ruta","Reporte desde app chofer")}>Reportar incidencia</Button></div></MobileSection></MobileShell>}
