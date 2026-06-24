"use client";
import { MobileShell, ownerMobileNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileKpi } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { formatMoney } from "@/shared/lib/format";
import styles from "@/modules/mobileShared/mobileComponents.module.css";
export default function Page(){ const data=useTenantData(); return <MobileShell roleLabel="Owner resumido" nav={ownerMobileNav}><MobileHero title="Owner mobile" subtitle="Control resumido. Para trabajar completo usar desktop."/><div className={styles.kpis}><MobileKpi label="Solicitudes" value={data.requests.length}/><MobileKpi label="Tareas" value={data.tasks.length}/><MobileKpi label="Incidencias" value={data.incidents.length}/><MobileKpi label="Por cobrar" value={formatMoney(data.payments.filter(p=>p.status!=="cobrado").reduce((s,p)=>s+p.amount,0))}/></div><div className={styles.list}>{data.requests.slice(0,3).map(r=><div className="mobile-card" key={r.id}><strong>{r.code}</strong><p>{r.clientName} · {r.destinationCity}</p></div>)}</div></MobileShell> }
