"use client";
import { MobileShell, operarioNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero } from "@/modules/mobileShared/MobilePieces";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/modules/mobileShared/mobileComponents.module.css";
export default function Page(){const data=useTenantData();return <MobileShell roleLabel="Operario" nav={operarioNav}><MobileHero title="Bultos" subtitle="Preparación asignada."/><div className={styles.list}>{data.packages.map(p=><div className="mobile-card" key={p.id}><strong>{p.code}</strong><p>{p.description}</p><StatusBadge status={p.status} role="operario"/></div>)}</div></MobileShell>}
