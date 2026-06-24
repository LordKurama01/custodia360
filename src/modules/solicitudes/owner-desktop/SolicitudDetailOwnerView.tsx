"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Field, Select, Input } from "@/shared/components/Fields";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import styles from "./SolicitudDetailOwnerView.module.css";

export function SolicitudDetailOwnerView() {
  const params = useParams<{ id: string }>();
  const data = useTenantData();
  const { actions } = useAppState();
  const request = data.requests.find(r => r.id === params.id) ?? data.requests[0];
  const existingOrder = data.orders.find(o => o.requestId === request?.id);
  const [assignee, setAssignee] = useState(data.users.find(u => u.role === "chofer" || u.role === "operario")?.id ?? "");
  const selectedUser = data.users.find(u => u.id === assignee);
  const [taskTitle, setTaskTitle] = useState("Retirar / preparar operación");
  const evidence = useMemo(() => data.evidences.filter(e => request?.evidenceIds.includes(e.id)), [data.evidences, request]);

  if (!request) return <OwnerDesktopShell title="Solicitud"><Card>Solicitud no encontrada.</Card></OwnerDesktopShell>;

  const approveAndOrder = () => {
    actions.approveRequest(request.id);
    actions.convertRequestToOrder(request.id);
  };
  const assign = () => {
    const order = data.orders.find(o => o.requestId === request.id);
    if (!order || !selectedUser || (selectedUser.role !== "chofer" && selectedUser.role !== "operario")) return;
    actions.assignTask(request.tenantId, order.id, selectedUser.id, taskTitle, selectedUser.role);
  };

  return <OwnerDesktopShell title={`Solicitud ${request.code}`}>
    <div className={styles.headerCard}>
      <div><p>Solicitud cliente</p><h2>{request.code}</h2><span>{request.clientName}</span></div>
      <div className={styles.badges}><PriorityBadge priority={request.priority}/><StatusBadge status={request.status}/></div>
      <div className={styles.actions}><Button onClick={approveAndOrder}>Aprobar y generar JR</Button><Button variant="secondary" onClick={() => actions.attachEvidence(request.tenantId, "solicitud", request.id, "evidencia_manual.jpg", "u-owner-a")}>Adjuntar evidencia</Button><Link href="/owner/solicitudes"><Button variant="ghost">Volver</Button></Link></div>
    </div>
    <section className={styles.grid}>
      <Card className={styles.panel}><h2>Datos de retiro</h2><div className={styles.detail}><span>Proveedor / lugar</span><strong>{request.originName}</strong><span>Dirección</span><strong>{request.originAddress}</strong><span>Producto</span><strong>{request.productDescription}</strong><span>Cantidad</span><strong>{request.quantity}</strong><span>Retira</span><strong>{request.withdrawalPersonName ?? "No informado"}</strong></div></Card>
      <Card className={styles.panel}><h2>Datos de destino</h2><div className={styles.detail}><span>Ciudad</span><strong>{request.destinationCity}</strong><span>Dirección</span><strong>{request.destinationAddress}</strong><span>Observaciones</span><strong>{request.notes ?? "Sin observaciones"}</strong></div></Card>
      <Card className={styles.panel}><h2>Orden interna</h2>{existingOrder ? <div className={styles.orderBox}><strong>{existingOrder.code}</strong><StatusBadge status={existingOrder.status}/><small>{existingOrder.assignedTaskIds.length} tareas asociadas</small></div> : <p>No hay orden generada todavía.</p>}</Card>
      <Card className={styles.panel}><h2>Asignar tarea</h2><div className={styles.form}><Field label="Tarea"><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} /></Field><Field label="Responsable"><Select value={assignee} onChange={e => setAssignee(e.target.value)}>{data.users.filter(u => u.role === "chofer" || u.role === "operario").map(u => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}</Select></Field><Button onClick={assign} disabled={!existingOrder}>Asignar TAR</Button></div></Card>
      <Card className={styles.panel}><h2>Evidencias</h2>{evidence.length ? evidence.map(e => <div key={e.id} className={styles.file}><strong>{e.name}</strong><small>{e.type} · {new Date(e.uploadedAt).toLocaleString("es-AR")}</small></div>) : <p>Sin evidencias adjuntas.</p>}</Card>
      <Card className={styles.panel}><h2>Actividad</h2><div className={styles.timeline}>{data.audit.filter(a => a.entityId === request.id || a.action.includes(request.code)).slice(0,6).map(a => <div key={a.id}><strong>{a.action}</strong><small>{new Date(a.createdAt).toLocaleString("es-AR")}</small></div>)}</div></Card>
    </section>
  </OwnerDesktopShell>;
}
