"use client";

import Link from "next/link";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { KpiCard } from "@/shared/components/KpiCard";
import { Card } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/shared/components/Button";
import { formatMoney } from "@/shared/lib/format";
import styles from "./OwnerDashboardView.module.css";

const flowKeys = ["CLI", "JR", "TAR", "GUI", "COB"] as const;

export function OwnerDashboardView() {
  const data = useTenantData();
  const pending = data.requests.filter(r => ["solicitud_recibida", "pendiente_revision"].includes(r.status)).length;
  const activeTasks = data.tasks.filter(t => !["cerrado", "entregado", "recibido_conforme"].includes(t.status)).length;
  const openIncidents = data.incidents.filter(i => i.status !== "resuelta").length;
  const pendingPayments = data.payments.filter(p => p.status !== "cobrado").reduce((sum, p) => sum + p.amount, 0);
  const expenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const result = data.profitability.reduce((s, p) => s + p.income - p.expenses, 0);
  const gateways = data.paymentGateways.filter(g => g.status !== "desactivada");
  const clients = data.clients.length;
  const drivers = data.users.filter(u => u.role === "chofer").length;
  const operators = data.users.filter(u => u.role === "operario").length;
  const flowCounts = {
    CLI: data.requests.length,
    JR: data.orders.length,
    TAR: data.tasks.length,
    GUI: data.guides.length,
    COB: data.payments.length,
  };

  return <OwnerDesktopShell title="Dashboard">
    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>Control operativo del negocio</p>
        <h2>{data.tenant?.name ?? "Dueño activo"}</h2>
        <p>Vista de trabajo del dueño activo. Cada cliente, chofer, operario, tarea, cobro y evidencia se filtra por espacio aislado.</p>
      </div>
      <div className={styles.quickActions}>
        <Link href="/owner/solicitudes"><Button>Nueva solicitud</Button></Link>
        <Link href="/owner/clientes"><Button variant="secondary">Crear cliente</Button></Link>
        <Link href="/owner/configuracion/pagos"><Button variant="ghost">Configurar cobros</Button></Link>
      </div>
    </section>

    <section className={styles.tenantSummary}>
      <div><span>Espacio activo</span><strong>{data.tenant?.code}</strong><small>{data.tenant?.name}</small></div>
      <div><span>Clientes</span><strong>{clients}</strong><small>Solo del dueño actual</small></div>
      <div><span>Choferes</span><strong>{drivers}</strong><small>Asignables a tareas</small></div>
      <div><span>Operarios</span><strong>{operators}</strong><small>Preparación y evidencia</small></div>
      <div><span>Cobros</span><strong>{gateways.length ? "Activo" : "Pendiente"}</strong><small>Por negocio</small></div>
    </section>

    <section className={styles.kpis}>
      <KpiCard label="Solicitudes pendientes" value={pending} helper="Ingresos por revisar" />
      <KpiCard label="Órdenes internas" value={data.orders.length} helper="Operaciones activas" />
      <KpiCard label="Tareas activas" value={activeTasks} helper="Choferes y operarios" />
      <KpiCard label="Incidencias" value={openIncidents} helper="Requieren acción" />
    </section>

    <Card className={styles.flowPanel}>
      <div className={styles.panelHead}><div><p className={styles.eyebrow}>Flujo operativo</p><h2>CLI → JR → TAR → GUI → COB</h2></div><small>La operación avanza sin cruzar datos entre dueños.</small></div>
      <div className={styles.flowLine}>{flowKeys.map((key, index) => <div className={styles.flowStep} key={key}><strong>{key}</strong><span>{flowCounts[key]}</span>{index < flowKeys.length - 1 ? <i /> : null}</div>)}</div>
    </Card>

    <section className={styles.grid}>
      <Card className={styles.panel}><div className={styles.panelHead}><h2>Solicitudes recientes</h2><Link href="/owner/solicitudes">Ver todas</Link></div><div className={styles.list}>{data.requests.slice(0,5).map(r => <Link href={`/owner/solicitudes/${r.id}`} key={r.id} className={styles.row}><div><strong>{r.code}</strong><br /><small>{r.clientName} · {r.originName} → {r.destinationCity}</small></div><StatusBadge status={r.status} /></Link>)}</div></Card>
      <Card className={styles.panel}><div className={styles.panelHead}><h2>Tareas críticas</h2><Link href="/owner/tareas">Tablero</Link></div><div className={styles.list}>{data.tasks.slice(0,5).map(t => <div key={t.id} className={styles.row}><div><strong>{t.code}</strong><br /><small>{t.title} · {data.users.find(u=>u.id===t.assignedToUserId)?.name ?? "sin responsable"}</small></div><StatusBadge status={t.status} role={t.assignedRole} /></div>)}</div></Card>
    </section>

    <section className={styles.money}>
      <KpiCard label="Por cobrar" value={formatMoney(pendingPayments)} helper="Solo Owner" />
      <KpiCard label="Gastos registrados" value={formatMoney(expenses)} helper="Operación actual" />
      <KpiCard label="Resultado estimado" value={formatMoney(result)} helper="Vista preliminar" />
      <KpiCard label="Pasarelas" value={gateways.length} helper={gateways.length ? "Por dueño" : "Pendiente"} />
    </section>

    <section className={styles.bottomGrid}>
      <Card className={styles.panel}><h2>Aislamiento multi-dueño</h2><p>Estás operando dentro de <strong>{data.tenant?.code}</strong>. La pantalla solo consume datos con ese tenantId. Si cambiás a otro dueño, cambian clientes, choferes, solicitudes, cobros y evidencias.</p><Link href="/platform"><Button variant="secondary">Administrar dueños</Button></Link></Card>
      <Card className={styles.panel}><h2>Actividad reciente</h2><div className={styles.audit}>{data.audit.slice(0,6).map(a => <div key={a.id}><strong>{a.action}</strong><small>{new Date(a.createdAt).toLocaleString("es-AR")}</small></div>)}</div></Card>
    </section>
  </OwnerDesktopShell>;
}
