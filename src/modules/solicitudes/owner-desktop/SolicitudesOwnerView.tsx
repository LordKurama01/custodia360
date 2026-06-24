"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { Button } from "@/shared/components/Button";
import { Field, Input } from "@/shared/components/Fields";
import styles from "./SolicitudesOwnerView.module.css";

const tabs = ["Todas", "Pendientes", "Aprobadas", "En operación", "Con incidencia"] as const;

function matchesTab(tab: (typeof tabs)[number], status: string) {
  return tab === "Todas" ||
    (tab === "Pendientes" && ["solicitud_recibida", "pendiente_revision"].includes(status)) ||
    (tab === "Aprobadas" && ["aprobada", "orden_generada"].includes(status)) ||
    (tab === "En operación" && !["solicitud_recibida", "pendiente_revision", "rechazada", "cerrado"].includes(status)) ||
    (tab === "Con incidencia" && status === "incidencia_reportada");
}

export function SolicitudesOwnerView() {
  const { requests, tenant } = useTenantData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Todas");
  const [query, setQuery] = useState("");
  const counts = useMemo(() => Object.fromEntries(tabs.map(t => [t, requests.filter(r => matchesTab(t, r.status)).length])) as Record<(typeof tabs)[number], number>, [requests]);
  const filtered = useMemo(() => requests.filter(r => {
    const q = query.toLowerCase();
    const matchQ = !q || [r.code, r.clientName, r.originName, r.destinationCity, r.productDescription].join(" ").toLowerCase().includes(q);
    return matchQ && matchesTab(tab, r.status);
  }), [requests, query, tab]);

  return <OwnerDesktopShell title="Solicitudes">
    <section className={styles.topPanel}>
      <div><p>Entrada operativa</p><h2>Solicitudes del negocio activo</h2><span>{tenant?.code} · solo se listan solicitudes, clientes y evidencias de este dueño.</span></div>
      <Button>Nueva solicitud manual</Button>
    </section>
    <div className={styles.toolbar}>
      <div className={styles.tabs}>{tabs.map(t => <button key={t} className={tab === t ? styles.activeTab : ""} onClick={() => setTab(t)}>{t} <strong>{counts[t]}</strong></button>)}</div>
      <Field label="Buscar"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cliente, código, origen, destino o producto" /></Field>
    </div>
    <Card>
      <DataTable><thead><tr><th>Código</th><th>Cliente</th><th>Origen</th><th>Destino</th><th>Producto</th><th>Prioridad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        {filtered.map(r => <tr key={r.id}><td><strong>{r.code}</strong><br/><small>{new Date(r.createdAt).toLocaleDateString("es-AR")}</small></td><td>{r.clientName}<br/><small>tenantId: {r.tenantId}</small></td><td>{r.originName}<br /><small>{r.originAddress}</small></td><td>{r.destinationCity}<br /><small>{r.destinationAddress}</small></td><td>{r.productDescription}<br/><small>{r.quantity} bultos/unid.</small></td><td><PriorityBadge priority={r.priority}/></td><td><StatusBadge status={r.status}/></td><td><div className={styles.actions}><Link href={`/owner/solicitudes/${r.id}`}><Button variant="secondary">Abrir</Button></Link>{["solicitud_recibida", "pendiente_revision"].includes(r.status) ? <Button variant="ghost">Aprobar</Button> : null}</div></td></tr>)}
      </tbody></DataTable>
      {filtered.length === 0 ? <div className={styles.empty}>No hay solicitudes para el filtro seleccionado.</div> : null}
    </Card>
  </OwnerDesktopShell>;
}
