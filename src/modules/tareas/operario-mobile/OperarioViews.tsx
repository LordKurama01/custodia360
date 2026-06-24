"use client";
import Link from "next/link";
import { MobileShell, operarioNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileKpi, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/Button";
import styles from "@/modules/mobileShared/mobileComponents.module.css";
const opId="u-op-a";
export function OperarioInicioView(){ const data=useTenantData(); const tasks=data.tasks.filter(t=>t.assignedToUserId===opId); return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileHero title="Trabajo asignado" subtitle="Preparación, verificación y evidencias."/><div className={styles.kpis}><MobileKpi label="Tareas" value={tasks.length}/><MobileKpi label="Bultos" value={data.packages.length}/></div><div className={styles.list}>{tasks.map(t=><Link href={`/operativo/tareas/${t.id}`} key={t.id}><div className="mobile-card"><strong>{t.code}</strong><p>{t.title}</p><StatusBadge status={t.status} role="operario"/></div></Link>)}</div></MobileShell> }
export function OperarioTareasView(){return <OperarioInicioView/>}
export function OperarioTaskDetailView({id}:{id:string}){ const {actions}=useAppState(); const data=useTenantData(); const t=data.tasks.find(x=>x.id===id); if(!t)return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileSection>Tarea no encontrada</MobileSection></MobileShell>; return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileHero title={t.code} subtitle={t.title}/><MobileSection><div className={styles.detail}><div className={styles.detailRow}><span>Estado</span><StatusBadge status={t.status} role="operario"/></div><div className={styles.detailRow}><span>Instrucción</span><strong>{t.description}</strong></div><Button onClick={()=>actions.updateTaskStatus(t.id,"en_preparacion",opId)}>Iniciar preparación</Button><Button onClick={()=>actions.updateTaskStatus(t.id,"preparado",opId)} variant="secondary">Marcar preparado</Button><Button onClick={()=>actions.attachEvidence(t.tenantId,"tarea",t.id,"foto_bulto.jpg",opId)} variant="ghost">Subir evidencia</Button><Button variant="danger" onClick={()=>actions.reportIncident(t.tenantId,"tarea",t.id,"Problema en preparación","Reporte desde operario")}>Reportar problema</Button></div></MobileSection></MobileShell>}
