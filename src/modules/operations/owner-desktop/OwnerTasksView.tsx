"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { useAppState } from "@/shared/state/AppStateProvider";
import styles from "./OwnerOperationsViews.module.css";

const columns = [
  { title: "Pendientes", statuses: ["tarea_asignada"] },
  { title: "En preparación", statuses: ["en_preparacion", "en_retiro", "retirado"] },
  { title: "Despacho", statuses: ["preparado", "despachado", "guia_cargada", "en_transito"] },
  { title: "Cerradas", statuses: ["entregado", "recibido_conforme", "cerrado"] },
] as const;

export function OwnerTasksView() {
  const data = useTenantData();
  const { actions } = useAppState();
  return <OwnerDesktopShell title="Tareas">
    <section className={styles.hero}><div><p>Tablero TAR</p><h2>Trabajo asignado a choferes y operarios</h2><span>Las tareas se actualizan desde mobile y quedan auditadas por usuario.</span></div><strong>{data.tasks.length}</strong></section>
    <section className={styles.kanban}>{columns.map(col => {
      const tasks = data.tasks.filter(t => col.statuses.includes(t.status as never));
      return <div className={styles.column} key={col.title}><h3>{col.title}<span>{tasks.length}</span></h3>{tasks.map(t => { const user = data.users.find(u=>u.id===t.assignedToUserId); return <article className={styles.task} key={t.id}><strong>{t.code} · {t.title}</strong><small>{user?.name ?? "Sin responsable"} · {t.assignedRole}</small><div className={styles.actions}><PriorityBadge priority={t.priority}/><StatusBadge status={t.status} role={t.assignedRole}/></div><div className={styles.actions}><Button variant="secondary" onClick={()=>actions.updateTaskStatus(t.id, t.assignedRole === "chofer" ? "retirado" : "en_preparacion", user?.id)}>Avanzar</Button><Button variant="ghost" onClick={()=>actions.attachEvidence(t.tenantId, "tarea", t.id, "foto_tarea.jpg", user?.id ?? "u-owner-a")}>Evidencia</Button></div></article>; })}</div>;
    })}</section>
  </OwnerDesktopShell>;
}
