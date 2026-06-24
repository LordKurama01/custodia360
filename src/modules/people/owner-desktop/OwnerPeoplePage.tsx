"use client";

import { useMemo, useState } from "react";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { Button } from "@/shared/components/Button";
import { Field, Input } from "@/shared/components/Fields";
import type { Client, User, UserRole } from "@/domain/entities/types";
import styles from "./OwnerPeoplePage.module.css";

type Mode = "clientes" | "choferes" | "operarios";

type PeopleConfig = {
  title: string;
  singular: string;
  role?: Extract<UserRole, "cliente" | "chofer" | "operario">;
};

const labels: Record<Mode, PeopleConfig> = {
  clientes: { title: "Clientes", singular: "cliente", role: "cliente" },
  choferes: { title: "Choferes", singular: "chofer", role: "chofer" },
  operarios: { title: "Operarios", singular: "operario", role: "operario" },
};

function normalizeLocalEmail(name: string) {
  const localPart = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");

  return `${localPart || "usuario"}@custodia.local`;
}

function ClientRows({ rows }: { rows: Client[] }) {
  return (
    <tbody>
      {rows.map((client) => (
        <tr key={client.id}>
          <td>
            <strong>{client.name}</strong>
          </td>
          <td>{client.email ?? "-"}</td>
          <td>{client.phone ?? "-"}</td>
          <td>{client.city ?? "-"}</td>
          <td>Activo</td>
        </tr>
      ))}
    </tbody>
  );
}

function UserRows({ rows }: { rows: User[] }) {
  return (
    <tbody>
      {rows.map((user) => (
        <tr key={user.id}>
          <td>
            <strong>{user.name}</strong>
          </td>
          <td>{user.email}</td>
          <td>{user.phone ?? "-"}</td>
          <td>{user.role}</td>
          <td>{user.active ? "Activo" : "Inactivo"}</td>
        </tr>
      ))}
    </tbody>
  );
}

export function OwnerPeoplePage({ mode }: { mode: Mode }) {
  const data = useTenantData();
  const { state, actions } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const cfg = labels[mode];

  const rows = useMemo(() => {
    if (mode === "clientes") return data.clients;
    return data.users.filter((user) => user.role === cfg.role);
  }, [cfg.role, data.clients, data.users, mode]);

  const create = () => {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (mode === "clientes") {
      actions.createClient(state.activeTenantId, {
        name: cleanName,
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
      });
    }

    if ((mode === "choferes" || mode === "operarios") && cfg.role) {
      actions.createTenantUser(
        state.activeTenantId,
        cfg.role,
        cleanName,
        email.trim() || normalizeLocalEmail(cleanName),
      );
    }

    setName("");
    setEmail("");
    setPhone("");
    setCity("");
  };

  return (
    <OwnerDesktopShell title={cfg.title}>
      <section className={styles.hero}>
        <div>
          <p>Gestión por dueño</p>
          <h2>{cfg.title} del negocio activo</h2>
          <span>Cada registro se guarda con tenantId. Dueño A no ve lo cargado en Dueño B.</span>
        </div>
        <strong>{rows.length}</strong>
      </section>

      <section className={styles.grid}>
        <Card className={styles.formCard}>
          <h2>Crear {cfg.singular}</h2>
          <div className={styles.form}>
            <Field label="Nombre">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={`Nombre del ${cfg.singular}`} />
            </Field>
            <Field label="Email">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@empresa.com" />
            </Field>
            <Field label="Teléfono">
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+54..." />
            </Field>
            {mode === "clientes" ? (
              <Field label="Ciudad">
                <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Junín / CABA / Rosario" />
              </Field>
            ) : null}
            <Button onClick={create}>Crear {cfg.singular}</Button>
          </div>
        </Card>

        <Card>
          <DataTable>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad / Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            {mode === "clientes" ? <ClientRows rows={rows as Client[]} /> : <UserRows rows={rows as User[]} />}
          </DataTable>
        </Card>
      </section>
    </OwnerDesktopShell>
  );
}
