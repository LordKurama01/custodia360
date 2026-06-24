"use client";

import { useEffect, useState } from "react";
import { canManageUsers, roleLabels } from "@/infrastructure/auth/permissions";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { InternalRole, Json, ProfileRow } from "@/infrastructure/supabase/types";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Field, Input, Select } from "@/shared/components/Fields";
import { DataTable } from "@/shared/components/Table";
import styles from "./InternalUsersView.module.css";

type AuthorizedUser = {
  email: string;
  role: InternalRole;
  full_name?: string;
  active: boolean;
};

const roles: InternalRole[] = ["owner", "admin", "operator", "collector", "viewer"];

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function isAuthorizedUser(value: unknown): value is AuthorizedUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuthorizedUser>;
  return typeof candidate.email === "string" && !!candidate.role;
}

export function InternalUsersView() {
  const [currentProfile, setCurrentProfile] = useState<ProfileRow | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [form, setForm] = useState({ email: "", full_name: "", role: "viewer" as InternalRole });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canManage = canManageUsers(currentProfile?.role);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
        setCurrentProfile(data as ProfileRow | null);
      }

      const [profilesResult, settingsResult] = await Promise.all([
        supabase.from("profiles").select("*").order("email", { ascending: true }),
        supabase.from("app_settings").select("value").eq("key", "authorized_users").maybeSingle(),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (settingsResult.error) throw settingsResult.error;

      setProfiles((profilesResult.data ?? []) as ProfileRow[]);
      const users = Array.isArray(settingsResult.data?.value) ? settingsResult.data.value.filter(isAuthorizedUser) : [];
      setAuthorizedUsers(users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveAllowlist = async (users: AuthorizedUser[]) => {
    const supabase = createSupabaseBrowserClient();
    const { error: settingsError } = await supabase
      .from("app_settings")
      .upsert({ key: "authorized_users", value: users as unknown as Json }, { onConflict: "key" });
    if (settingsError) throw settingsError;
    await supabase.from("audit_logs").insert({
      actor_id: currentProfile?.id ?? null,
      entity_type: "app_settings",
      action: "authorized_users_updated",
      after_data: users as unknown as Json,
    });
  };

  const addAuthorizedEmail = async () => {
    if (!canManage) return setError("Tu rol no permite administrar usuarios.");
    const email = cleanEmail(form.email);
    if (!email) return setError("El email es obligatorio.");

    setSaving(true);
    setError("");
    try {
      const nextUsers = [
        ...authorizedUsers.filter((item) => cleanEmail(item.email) !== email),
        { email, full_name: form.full_name.trim() || email, role: form.role, active: true },
      ];
      await saveAllowlist(nextUsers);
      setAuthorizedUsers(nextUsers);
      setForm({ email: "", full_name: "", role: "viewer" });
      setMessage("Email autorizado. El perfil se creara al primer login con Google.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la allowlist.");
    } finally {
      setSaving(false);
    }
  };

  const updateAuthorizedUser = async (email: string, patch: Partial<AuthorizedUser>) => {
    if (!canManage) return setError("Tu rol no permite administrar usuarios.");
    setSaving(true);
    setError("");
    try {
      const nextUsers = authorizedUsers.map((item) => cleanEmail(item.email) === cleanEmail(email) ? { ...item, ...patch } : item);
      await saveAllowlist(nextUsers);
      setAuthorizedUsers(nextUsers);
      setMessage("Allowlist actualizada.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo actualizar la allowlist.");
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = async (profile: ProfileRow, patch: Partial<Pick<ProfileRow, "role" | "active">>) => {
    if (!canManage) return setError("Tu rol no permite administrar usuarios.");
    setSaving(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", profile.id);
      if (updateError) throw updateError;
      await supabase.from("audit_logs").insert({
        actor_id: currentProfile?.id ?? null,
        entity_type: "profile",
        entity_id: profile.id,
        action: "profile_permissions_updated",
        before_data: profile as unknown as Json,
        after_data: { ...profile, ...patch } as unknown as Json,
      });
      setMessage("Perfil actualizado.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return <OwnerDesktopShell title="Permisos">
    <section className={styles.hero}>
      <div>
        <p>Usuarios internos</p>
        <h2>Allowlist y roles</h2>
        <span>Autoriza emails antes del primer login. Cuando el usuario entra con Google, se crea su profile con el rol definido.</span>
      </div>
      <strong>{canManage ? "Owner/Admin" : "Solo lectura"}</strong>
    </section>

    {message ? <div className={styles.success}>{message}</div> : null}
    {error ? <div className={styles.error}>{error}</div> : null}

    <section className={styles.grid}>
      <Card className={styles.formCard}>
        <h2>Agregar email autorizado</h2>
        <div className={styles.form}>
          <Field label="Email Gmail">
            <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="usuario@gmail.com" disabled={!canManage || saving} />
          </Field>
          <Field label="Nombre">
            <Input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Nombre interno" disabled={!canManage || saving} />
          </Field>
          <Field label="Rol">
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as InternalRole })} disabled={!canManage || saving}>
              {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
            </Select>
          </Field>
          <Button onClick={addAuthorizedEmail} disabled={!canManage || saving}>Autorizar email</Button>
        </div>
      </Card>

      <Card>
        <h2>Allowlist pendiente / autorizada</h2>
        <DataTable>
          <thead><tr><th>Email</th><th>Nombre</th><th>Rol</th><th>Activo</th></tr></thead>
          <tbody>
            {authorizedUsers.map((user) => <tr key={user.email}>
              <td><strong>{user.email}</strong></td>
              <td>{user.full_name ?? "-"}</td>
              <td>
                <Select value={user.role} onChange={(event) => updateAuthorizedUser(user.email, { role: event.target.value as InternalRole })} disabled={!canManage || saving}>
                  {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                </Select>
              </td>
              <td>
                <Select value={user.active ? "true" : "false"} onChange={(event) => updateAuthorizedUser(user.email, { active: event.target.value === "true" })} disabled={!canManage || saving}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Select>
              </td>
            </tr>)}
          </tbody>
        </DataTable>
      </Card>
    </section>

    <Card className={styles.profiles}>
      <h2>Profiles creados</h2>
      {loading ? <p>Cargando usuarios...</p> : null}
      <DataTable>
        <thead><tr><th>Email</th><th>Nombre</th><th>Rol</th><th>Estado</th></tr></thead>
        <tbody>
          {profiles.map((profile) => <tr key={profile.id}>
            <td><strong>{profile.email}</strong></td>
            <td>{profile.full_name ?? "-"}</td>
            <td>
              <Select value={profile.role} onChange={(event) => updateProfile(profile, { role: event.target.value as InternalRole })} disabled={!canManage || saving}>
                {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
              </Select>
            </td>
            <td>
              <Select value={profile.active ? "true" : "false"} onChange={(event) => updateProfile(profile, { active: event.target.value === "true" })} disabled={!canManage || saving}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </td>
          </tr>)}
        </tbody>
      </DataTable>
    </Card>
  </OwnerDesktopShell>;
}
