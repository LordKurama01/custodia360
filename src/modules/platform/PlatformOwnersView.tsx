"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/shared/state/AppStateProvider";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Field, Input, Select } from "@/shared/components/Fields";
import styles from "./PlatformOwnersView.module.css";

export function PlatformOwnersView() {
  const { state, actions } = useAppState();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<"owner" | "cliente" | "chofer" | "operario">("owner");
  const [selectedTenant, setSelectedTenant] = useState(state.activeTenantId);

  const summary = useMemo(() => ({
    tenants: state.tenants.length,
    users: state.users.filter(u => u.tenantId).length,
    clients: state.clients.length,
    requests: state.requests.length,
    gateways: (state.paymentGateways ?? []).filter(g => g.status !== "desactivada").length,
  }), [state]);

  const createUser = () => {
    if (!selectedTenant || !userName.trim() || !userEmail.trim()) return;
    actions.createTenantUser(selectedTenant, role, userName.trim(), userEmail.trim());
    setUserName(""); setUserEmail("");
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <div>
        <div className={styles.brand}><span>360</span> Custodia360</div>
        <small>Administrador General · plataforma multi-dueño · aislamiento por negocio</small>
      </div>
      <div className={styles.headerActions}>
        <Link href="/login"><Button variant="ghost">Landing</Button></Link>
        <Link href="/owner/dashboard"><Button>Ir al dueño activo</Button></Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div>
        <p>Control plataforma</p>
        <h1>Dueños separados, operaciones separadas.</h1>
        <span>El Administrador General crea negocios. Cada dueño administra sus clientes, choferes, operarios, pasarela y operación sin ver datos de otros dueños.</span>
      </div>
      <div className={styles.heroRule}>
        <strong>DUE-A ≠ DUE-B ≠ DUE-C</strong>
        <small>La regla de venta y de arquitectura: ningún dueño cruza clientes, tareas, evidencias, cobros ni configuración.</small>
      </div>
    </section>

    <section className={styles.content}>
      <aside className={styles.side}>
        <Card><h2>Crear dueño / negocio</h2><p>Se crea un espacio operativo aislado con su propio tenantId.</p><div className={styles.form}>
          <Field label="Nombre del dueño / negocio"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Dueño D - Nueva operación" /></Field>
          <Button onClick={() => { if (name.trim()) { actions.createTenant(name.trim()); setName(""); } }}>Crear dueño aislado</Button>
        </div></Card>
        <Card><h2>Crear usuario por dueño</h2><p>El usuario queda atado al negocio seleccionado.</p><div className={styles.form}>
          <Field label="Dueño"><Select value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}><option value="">Seleccionar</option>{state.tenants.map(t => <option key={t.id} value={t.id}>{t.code} · {t.name}</option>)}</Select></Field>
          <Field label="Rol"><Select value={role} onChange={e => setRole(e.target.value as typeof role)}><option value="owner">Owner</option><option value="cliente">Cliente</option><option value="chofer">Chofer</option><option value="operario">Operario</option></Select></Field>
          <Field label="Nombre"><Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nombre completo" /></Field>
          <Field label="Email"><Input value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="usuario@empresa.com" /></Field>
          <Button onClick={createUser}>Crear usuario aislado</Button>
        </div></Card>
      </aside>
      <main className={styles.main}>
        <div className={styles.kpis}>
          <Card><span>Dueños activos</span><strong>{summary.tenants}</strong></Card>
          <Card><span>Usuarios por dueño</span><strong>{summary.users}</strong></Card>
          <Card><span>Clientes cargados</span><strong>{summary.clients}</strong></Card>
          <Card><span>Solicitudes totales</span><strong>{summary.requests}</strong></Card>
          <Card><span>Pasarelas configuradas</span><strong>{summary.gateways}</strong></Card>
        </div>
        <div className={styles.ownerGrid}>
          {state.tenants.map(t => {
            const users = state.users.filter(u => u.tenantId === t.id);
            const clients = state.clients.filter(c => c.tenantId === t.id);
            const requests = state.requests.filter(r => r.tenantId === t.id);
            const tasks = state.tasks.filter(task => task.tenantId === t.id);
            const payments = state.payments.filter(p => p.tenantId === t.id);
            const gateways = (state.paymentGateways ?? []).filter(g => g.tenantId === t.id && g.status !== "desactivada");
            return <Card key={t.id} className={styles.owner}>
              <div className={styles.ownerHead}>
                <div><strong>{t.name}</strong><small>{t.code} · {t.legalName ?? "sin razón social"}</small></div>
                <Button variant={state.activeTenantId === t.id ? "primary" : "secondary"} onClick={() => { actions.setActiveTenant(t.id); setSelectedTenant(t.id); }}>Usar espacio</Button>
              </div>
              <div className={styles.ownerMetrics}>
                <span>{users.filter(u => u.role === "owner").length} owners</span>
                <span>{clients.length} clientes</span>
                <span>{users.filter(u => u.role === "chofer").length} choferes</span>
                <span>{users.filter(u => u.role === "operario").length} operarios</span>
                <span>{requests.length} solicitudes</span>
                <span>{tasks.length} tareas</span>
                <span>{payments.length} cobros</span>
                <span>{gateways.length ? "cobros configurados" : "cobros pendientes"}</span>
              </div>
              <div className={styles.isolationLine}><b>tenantId:</b> {t.id}<span>Datos operativos, usuarios y pagos aislados por este identificador.</span></div>
            </Card>;
          })}
        </div>
      </main>
    </section>
  </main>;
}
