"use client";
import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/Button";
import styles from "./OwnerOperationsViews.module.css";

export function OwnerOrdersView() {
  const data = useTenantData();
  const taskCount = data.tasks.length;
  const packageCount = data.packages.length;
  const guideCount = data.guides.length;
  const readyToBill = data.orders.filter(o => ["guia_cargada", "entregado", "listo_para_cobrar"].includes(o.status)).length;
  return <OwnerDesktopShell title="Órdenes internas">
    <section className={styles.hero}><div><p>Flujo JR</p><h2>Órdenes internas del dueño activo</h2><span>Las órdenes nacen desde una solicitud aprobada y concentran tareas, bultos, evidencias, guías y cobros del mismo negocio.</span></div><strong>{data.orders.length}</strong></section>
    <section className={styles.summaryCards}>
      <Card><span>Órdenes activas</span><strong>{data.orders.length}</strong><small>{data.tenant?.code}</small></Card>
      <Card><span>Tareas asociadas</span><strong>{taskCount}</strong><small>Choferes y operarios</small></Card>
      <Card><span>Bultos</span><strong>{packageCount}</strong><small>Preparación interna</small></Card>
      <Card><span>Guías</span><strong>{guideCount}</strong><small>Cargadas por operación</small></Card>
      <Card><span>Listo para cobrar</span><strong>{readyToBill}</strong><small>Control Owner</small></Card>
    </section>
    <Card><DataTable><thead><tr><th>Código</th><th>Cliente</th><th>Solicitud origen</th><th>Tareas</th><th>Bultos</th><th>Guía</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{data.orders.map(o => { const req = data.requests.find(r=>r.id===o.requestId); const guides = data.guides.filter(g => g.orderId === o.id); return <tr key={o.id}><td><strong>{o.code}</strong><br/><small>{new Date(o.createdAt).toLocaleString("es-AR")}</small></td><td>{o.clientName}<br/><small>{o.tenantId}</small></td><td>{req?.code ?? "-"}</td><td>{o.assignedTaskIds.length}</td><td>{data.packages.filter(p=>p.orderId===o.id).length}</td><td>{guides.length ? guides.map(g => g.code).join(", ") : "Pendiente"}</td><td><StatusBadge status={o.status}/></td><td><div className={styles.actions}><Button variant="secondary">Abrir</Button><Link href="/owner/tareas"><Button variant="ghost">Crear tarea</Button></Link><Button variant="ghost">Cargar guía</Button></div></td></tr>; })}</tbody></DataTable></Card>
  </OwnerDesktopShell>;
}
