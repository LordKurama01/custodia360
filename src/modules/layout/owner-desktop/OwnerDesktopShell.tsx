"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { roleLabels } from "@/infrastructure/auth/permissions";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { demoProfile, isDemoMode } from "@/shared/lib/demoMode";
import type { ProfileRow } from "@/infrastructure/supabase/types";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import styles from "./OwnerDesktopShell.module.css";

const groups = [
  { title: "Operacion", items: [["Dashboard", "/owner/dashboard"], ["Solicitudes", "/owner/solicitudes"], ["Ordenes", "/owner/ordenes"], ["Tareas", "/owner/tareas"], ["Viajes / Lotes", "/owner/viajes-lotes"], ["Control de Bultos", "/owner/bultos"]] },
  { title: "Personas", items: [["Clientes", "/owner/clientes"], ["Choferes", "/owner/choferes"], ["Operarios", "/owner/operarios"]] },
  { title: "Control", items: [["Guias", "/owner/guias"], ["Evidencias", "/owner/evidencias"], ["Incidencias", "/owner/incidencias"], ["Auditoria", "/owner/auditoria"]] },
  { title: "Finanzas", items: [["Pagos / Cobros", "/owner/pagos-cobros"], ["Gastos", "/owner/gastos"], ["Rentabilidad", "/owner/rentabilidad"], ["Pasarelas", "/owner/configuracion/pagos"]] },
  { title: "Sistema", items: [["Permisos", "/owner/permisos"], ["Configuracion", "/owner/configuracion"]] },
] as const;

export function OwnerDesktopShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenantData();
  const { state, actions } = useAppState();
  const [profile, setProfile] = useState<Pick<ProfileRow, "email" | "full_name" | "role"> | null>(null);
  const gateways = (state.paymentGateways ?? []).filter((gateway) => gateway.tenantId === state.activeTenantId);
  const connectedGateway = gateways.find((gateway) => gateway.status === "conectada");
  const activeTenantUsers = state.users.filter((user) => user.tenantId === state.activeTenantId);

  useEffect(() => {
    let alive = true;

    if (isDemoMode()) {
      setProfile(demoProfile);
      return () => {
        alive = false;
      };
    }

    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        const { data } = await supabase
          .from("profiles")
          .select("email, full_name, role")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (alive && data) setProfile(data);
      } catch {
        if (alive) setProfile(null);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const logout = async () => {
    if (isDemoMode()) {
      router.push("/login");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      router.push("/login");
    }
  };

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brandWrap}>
        <div className={styles.brand}><span className={styles.brandMark}>360</span><span>Custodia<span>360</span></span></div>
        <small>Sistema privado operativo</small>
      </div>

      <div className={styles.platformMode}>
        <span className={styles.dot} />
        <div>
          <strong>{isDemoMode() ? "Modo demo local" : "Modo multi-dueno"}</strong>
          <small>{isDemoMode() ? "Sin Supabase. Datos guardados en este navegador." : "Los datos se aislan por negocio activo."}</small>
        </div>
      </div>

      <div className={styles.tenantSwitch}>
        <span>Negocio activo</span>
        <select value={state.activeTenantId} onChange={(event) => actions.setActiveTenant(event.target.value)}>
          {state.tenants.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
        </select>
        <div className={styles.tenantMiniStats}>
          <small>{activeTenantUsers.filter((user) => user.role === "chofer").length} choferes</small>
          <small>{activeTenantUsers.filter((user) => user.role === "operario").length} operarios</small>
          <small>{activeTenantUsers.filter((user) => user.role === "cliente").length} usuarios cliente</small>
        </div>
        <Link href="/platform" className={styles.adminLink}>Administrador General</Link>
      </div>

      <nav className={styles.nav}>
        {groups.map((group) => <div key={group.title} className={styles.navGroup}>
          <div className={styles.groupTitle}>{group.title}</div>
          {group.items.map(([label, href]) => <Link key={href} href={href} className={pathname.startsWith(href) ? styles.active : ""}>{label}</Link>)}
        </div>)}
      </nav>

      <div className={styles.tenantBox}>
        <div className={styles.tenantCode}>{tenant?.code ?? "Sin dueno"}</div>
        <strong>{tenant?.name ?? "Sin dueno activo"}</strong>
        <small>Clientes, choferes, operarios, tareas, cobros y evidencias se filtran por tenantId.</small>
        <div className={connectedGateway ? styles.gatewayOk : styles.gatewayWarn}>{connectedGateway ? "Cobros conectados" : "Cobros por configurar"}</div>
      </div>
    </aside>
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operacion activa - {tenant?.name ?? "Sin negocio"}</p>
          <h1>{title}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/owner/bultos"><span>Bultos</span></Link>
          <Link href="/owner/solicitudes"><span>Solicitudes</span></Link>
          <Link href="/owner/configuracion/pagos"><span>Cobros</span></Link>
          <Link href="/platform"><span>Duenos</span></Link>
          <div className={styles.user}>
            {profile?.full_name ?? profile?.email ?? "Owner"}<br />
            <strong>{profile?.role ? roleLabels[profile.role] : tenant?.code}</strong>
          </div>
          <button type="button" className={styles.logoutButton} onClick={logout}>Salir</button>
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  </div>;
}
