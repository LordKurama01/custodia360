"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "./OwnerOperationsViews.module.css";

export function OwnerTripsView() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Viajes / Lotes">
    <section className={styles.hero}><div><p>Movimiento agrupado</p><h2>Viajes y lotes del negocio</h2><span>Agrupa pedidos, bultos, chofer, gastos y evidencias para medir operación y rentabilidad.</span></div><strong>{data.trips.length}</strong></section>
    <section className={styles.cards}>{data.trips.map(t => <Card key={t.id} className={styles.trip}><div className={styles.tripHead}><div><strong>{t.code}</strong><br/><small>{t.origin} → {t.destination}</small></div><StatusBadge status={t.status}/></div><div className={styles.meta}><div><span>Chofer</span><strong>{t.driverName}</strong></div><div><span>Vehículo</span><strong>{t.vehicle ?? "-"}</strong></div><div><span>Órdenes</span><strong>{t.orderIds.length}</strong></div><div><span>Gastos</span><strong>{t.expenseIds.length}</strong></div></div></Card>)}</section>
  </OwnerDesktopShell>;
}
