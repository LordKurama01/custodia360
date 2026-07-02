"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/shared/state/AppStateProvider";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Field, Input, Select } from "@/shared/components/Fields";
import styles from "./PlatformOwnersView.module.css";

const INCLUDED_SPACES = 4;

export function PlatformOwnersView() {
  const { state, actions } = useAppState();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState<"owner" | "cliente" | "chofer" | "operario">("owner");
  const [selectedTenant, setSelectedTenant] = useState(state.activeTenantId);
  const [notice, setNotice] = useState("");

  const usedSpaces = state.tenants.length;
  const hasSpaceQuota = usedSpaces < INCLUDED_SPACES;

  const summary = useMemo(() => ({
    tenants: state.tenants.length,
    users: state.users.filter((user) => user.tenantId).length,
    clients: state.clients.length,
    requests: state.requests.length,
    gateways: (state.paymentGateways ?? []).filter((gateway) => gateway.status !== "desactivada").length,
  }), [state]);

  const createSpace = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (!hasSpaceQuota) {
      setNotice("Cupo completo. Solicitá autorización a Prestige para crear otro espacio.");
      return;
    }
    actions.createTenant(cleanName);
    setName("");
    setNotice("Espacio creado. Los datos quedan aislados dentro de la base central.");
  };

  const requestExtraSpace = () => {
    setNotice("Solicitud registrada para Prestige: habilitar un espacio operativo adicional.");
  };

  const createUser = () => {
    if (!selectedTenant || !userName.trim() || !userEmail.trim()) return;
    actions.createTenantUser(selectedTenant, role, userName.trim(), userEmail.trim());
    setUserName("");
    setUserEmail("");
    setNotice("Usuario creado dentro del espacio seleccionado.");
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <div className={styles.brandLockup}>
        <div className={styles.brand}><span>360</span> Custodia360</div>
        <small>Administrador general · base central · espacios aislados</small>
      </div>
      <div className={styles.headerActions}>
        <Link href="/login"><Button variant="ghost">Landing</Button></Link>
        <Link href="/owner/dashboard"><Button>Ir al espacio activo</Button></Link>
      </div>
    </header>

    <section className={styles.hero}>
      <div>
        <p>Control Prestige</p>
        <h1>Espacios operativos</h1>
        <span>Un solo sistema, una base central y operaciones separadas por espacio.</span>
      </div>
      <div className={styles.quotaCard}>
        <small>Cupo autorizado</small>
        <strong>{usedSpaces} / {INCLUDED_SPACES}</strong>
        <span>{hasSpaceQuota ? `${INCLUDED_SPACES - usedSpaces} disponible${INCLUDED_SPACES - usedSpaces === 1 ? "" : "s"}` : "Requiere autorización"}</span>
      </div>
    </section>

    {notice ? <div className={styles.notice}>{notice}</div> : null}

    <section className={styles.content}>
      <aside className={styles.side}>
        <Card className={styles.formCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <p>Nuevo espacio</p>
              <h2>Crear operación</h2>
            </div>
            <span>{usedSpaces}/{INCLUDED_SPACES}</span>
          </div>
          <div className={styles.form}>
            <Field label="Nombre del espacio">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Norte Operaciones" disabled={!hasSpaceQuota} />
            </Field>
            {hasSpaceQuota
              ? <Button onClick={createSpace}>Crear espacio</Button>
              : <Button onClick={requestExtraSpace}>Solicitar autorización</Button>}
          </div>
        </Card>

        <Card className={styles.formCard}>
          <div className={styles.cardTitleRow}>
            <div>
              <p>Usuario interno</p>
              <h2>Asignar a espacio</h2>
            </div>
          </div>
          <div className={styles.form}>
            <Field label="Espacio">
              <Select value={selectedTenant} onChange={(event) => setSelectedTenant(event.target.value)}>
                <option value="">Seleccionar</option>
                {state.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.code} · {tenant.name}</option>)}
              </Select>
            </Field>
            <Field label="Rol">
              <Select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
                <option value="owner">Owner</option>
                <option value="cliente">Cliente</option>
                <option value="chofer">Chofer</option>
                <option value="operario">Operario</option>
              </Select>
            </Field>
            <Field label="Nombre">
              <Input value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Nombre completo" />
            </Field>
            <Field label="Email">
              <Input value={userEmail} onChange={(event) => setUserEmail(event.target.value)} placeholder="usuario@empresa.com" />
            </Field>
            <Button onClick={createUser}>Crear usuario</Button>
          </div>
        </Card>
      </aside>

      <main className={styles.main}>
        <div className={styles.kpis}>
          <Card><span>Espacios</span><strong>{summary.tenants}</strong></Card>
          <Card><span>Usuarios</span><strong>{summary.users}</strong></Card>
          <Card><span>Clientes</span><strong>{summary.clients}</strong></Card>
          <Card><span>Solicitudes</span><strong>{summary.requests}</strong></Card>
          <Card><span>Pasarelas</span><strong>{summary.gateways}</strong></Card>
        </div>

        <div className={styles.ownerGrid}>
          {state.tenants.map((tenant) => {
            const users = state.users.filter((user) => user.tenantId === tenant.id);
            const clients = state.clients.filter((client) => client.tenantId === tenant.id);
            const requests = state.requests.filter((request) => request.tenantId === tenant.id);
            const payments = state.payments.filter((payment) => payment.tenantId === tenant.id);
            const drivers = users.filter((user) => user.role === "chofer").length;
            const operators = users.filter((user) => user.role === "operario").length;
            const isActive = state.activeTenantId === tenant.id;
            return <Card key={tenant.id} className={styles.owner}>
              <div className={styles.ownerHead}>
                <div>
                  <strong>{tenant.name}</strong>
                  <small>{tenant.code} · {tenant.legalName ?? "Espacio operativo"}</small>
                </div>
                <Button variant={isActive ? "primary" : "secondary"} onClick={() => { actions.setActiveTenant(tenant.id); setSelectedTenant(tenant.id); }}>{isActive ? "Activo" : "Usar espacio"}</Button>
              </div>
              <div className={styles.ownerSummary}>
                <span>{clients.length} clientes</span>
                <span>{drivers} choferes</span>
                <span>{operators} operarios</span>
                <span>{payments.length} cobros</span>
              </div>
              <div className={styles.ownerFoot}>
                <span>ID técnico: {tenant.id}</span>
                <b>{requests.length ? `${requests.length} solicitudes` : "Sin solicitudes"}</b>
              </div>
            </Card>;
          })}
        </div>
      </main>
    </section>
  </main>;
}
