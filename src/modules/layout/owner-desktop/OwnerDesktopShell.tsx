"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { roleLabels } from "@/infrastructure/auth/permissions";
import { BrandLockup } from "@/shared/components/BrandLockup";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { demoProfile, isDemoMode } from "@/shared/lib/demoMode";
import type { ProfileRow } from "@/infrastructure/supabase/types";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";
import styles from "./OwnerDesktopShell.module.css";

const groups = [
  {
    title: "Operación diaria",
    mode: "primary",
    items: [
      ["Mesa de control", "/owner/bultos#seguimiento"],
      ["Clientes / planillas", "/owner/bultos#cuentas"],
      ["Guías", "/owner/bultos#guias"],
      ["Cuenta corriente", "/owner/bultos#cuentas"],
    ],
  },
  {
    title: "Gestión",
    mode: "support",
    items: [
      ["Configuración", "/owner/configuracion"],
      ["Permisos", "/owner/permisos"],
      ["Dueños", "/platform"],
    ],
  },
  {
    title: "Preparado / no principal",
    mode: "future",
    items: [
      ["Dashboard anterior", "/owner/dashboard"],
      ["Solicitudes", "/owner/solicitudes"],
      ["Órdenes", "/owner/ordenes"],
      ["Tareas", "/owner/tareas"],
      ["Viajes / Lotes", "/owner/viajes-lotes"],
      ["Choferes", "/owner/choferes"],
      ["Operarios", "/owner/operarios"],
      ["Evidencias", "/owner/evidencias"],
      ["Incidencias", "/owner/incidencias"],
      ["Auditoría", "/owner/auditoria"],
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  const cleanHref = href.split("#")[0];
  return cleanHref === "/owner/bultos" ? pathname.startsWith("/owner/bultos") : pathname.startsWith(cleanHref);
}

export function OwnerDesktopShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenantData();
  const { state, actions } = useAppState();
  const [profile, setProfile] = useState<Pick<ProfileRow, "email" | "full_name" | "role"> | null>(null);
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
      <Link href="/owner/bultos" className={styles.brandWrap} aria-label="Custodia360 operación">
        <BrandLockup subtitle="Mesa privada de logística" />
      </Link>

      <div className={styles.platformMode}>
        <span className={styles.dot} />
        <div>
          <strong>{isDemoMode() ? "Demo operativo" : "Operación real"}</strong>
          <small>Tablero general, planilla por cliente, guías y cuenta corriente.</small>
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
          <small>{activeTenantUsers.filter((user) => user.role === "cliente").length} clientes</small>
        </div>
      </div>

      <nav className={styles.nav}>
        {groups.map((group) => <div key={group.title} className={`${styles.navGroup} ${group.mode === "future" ? styles.futureGroup : ""}`}>
          <div className={styles.groupTitle}>{group.title}{group.mode === "future" ? <small>stand-by</small> : null}</div>
          {group.items.map(([label, href]) => group.mode === "future" ? <span key={href} className={styles.futureLink} aria-disabled="true">{label}<em>En construcción</em></span> : <Link key={href} href={href} className={isActive(pathname, href) ? styles.active : ""}>{label}</Link>)}
        </div>)}
      </nav>

      <div className={styles.tenantBox}>
        <div className={styles.tenantCode}>{tenant?.code ?? "Sin dueño"}</div>
        <strong>{tenant?.name ?? "Sin dueño activo"}</strong>
        <small>Flujo real: pizarrón digital → ficha cliente → guías → pases → pagos → WhatsApp.</small>
      </div>
    </aside>
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <p className={styles.eyebrow}>Operación activa · {tenant?.name ?? "sin negocio"}</p>
          <h1>{title}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/consulta/demo"><span>Vista cliente</span></Link>
          <div className={styles.user}>
            {profile?.full_name ?? profile?.email ?? "Owner"}<br />
            <strong>{profile?.role ? roleLabels[profile.role] : tenant?.code}</strong>
          </div>
          <button type="button" className={styles.logoutButton} onClick={logout}>Salir</button>
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </main>
    <nav className={styles.mobileBottomNav} aria-label="Navegación principal móvil">
      <Link href="/owner/bultos#seguimiento" className={pathname.startsWith("/owner/bultos") ? styles.mobileNavActive : ""}>
        <span>●</span>
        <strong>Mesa</strong>
      </Link>
      <Link href="/owner/bultos#cuentas">
        <span>▦</span>
        <strong>Clientes</strong>
      </Link>
      <Link href="/owner/bultos#nueva" className={styles.mobileFab} aria-label="Nueva carga">
        <span>+</span>
        <strong>Nueva</strong>
      </Link>
      <Link href="/owner/bultos#cuentas">
        <span>$</span>
        <strong>Cuentas</strong>
      </Link>
      <Link href="/owner/bultos#mas">
        <span>⋯</span>
        <strong>Más</strong>
      </Link>
    </nav>
  </div>;
}
