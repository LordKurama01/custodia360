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
  { title: "Principal", mode: "primary", items: [["Seguimiento clientes", "/owner/bultos"]] },
  { title: "Apoyo", mode: "support", items: [["Clientes", "/owner/clientes"], ["Guias", "/owner/guias"], ["Pagos / Cobros", "/owner/pagos-cobros"], ["Permisos", "/owner/permisos"], ["Configuracion", "/owner/configuracion"]] },
  { title: "Preparado / no principal", mode: "future", items: [["Dashboard anterior", "/owner/dashboard"], ["Solicitudes", "/owner/solicitudes"], ["Ordenes", "/owner/ordenes"], ["Tareas", "/owner/tareas"], ["Viajes / Lotes", "/owner/viajes-lotes"], ["Choferes", "/owner/choferes"], ["Operarios", "/owner/operarios"], ["Evidencias", "/owner/evidencias"], ["Incidencias", "/owner/incidencias"], ["Auditoria", "/owner/auditoria"], ["Gastos", "/owner/gastos"], ["Rentabilidad", "/owner/rentabilidad"], ["Pasarelas", "/owner/configuracion/pagos"]] },
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
          <strong>{isDemoMode() ? "Modo demo local" : "Seguimiento principal"}</strong>
          <small>{isDemoMode() ? "Pantalla principal: clientes, guías, pases, dólar y WhatsApp." : "La operación central vive en Seguimiento clientes."}</small>
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
        {groups.map((group) => <div key={group.title} className={`${styles.navGroup} ${group.mode === "future" ? styles.futureGroup : ""}`}>
          <div className={styles.groupTitle}>{group.title}{group.mode === "future" ? <small>stand-by</small> : null}</div>
          {group.items.map(([label, href]) => <Link key={href} href={href} className={`${pathname.startsWith(href) ? styles.active : ""} ${group.mode === "future" ? styles.futureLink : ""}`}>{label}</Link>)}
        </div>)}
      </nav>

      <div className={styles.tenantBox}>
        <div className={styles.tenantCode}>{tenant?.code ?? "Sin dueno"}</div>
        <strong>{tenant?.name ?? "Sin dueno activo"}</strong>
        <small>El flujo principal es cliente → operación → guías → pases USD → pagos → WhatsApp.</small>
        <div className={connectedGateway ? styles.gatewayOk : styles.gatewayWarn}>{connectedGateway ? "Cobros conectados" : "Cobros por configurar"}</div>
      </div>
    </aside>
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operacion activa principal - {tenant?.name ?? "Sin negocio"}</p>
          <h1>{title}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/owner/bultos"><span>Seguimiento</span></Link>
          <Link href="/consulta/demo"><span>Portal demo</span></Link>
          <Link href="/owner/configuracion"><span>Config.</span></Link>
          <Link href="/platform"><span>Dueños</span></Link>
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
