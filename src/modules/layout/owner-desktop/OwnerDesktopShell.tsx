"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./OwnerDesktopShell.module.css";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { useAppState } from "@/shared/state/AppStateProvider";

const groups = [
  { title: "Operación", items: [["Dashboard", "/owner/dashboard"], ["Solicitudes", "/owner/solicitudes"], ["Órdenes", "/owner/ordenes"], ["Tareas", "/owner/tareas"], ["Viajes / Lotes", "/owner/viajes-lotes"], ["Bultos", "/owner/bultos"]] },
  { title: "Personas", items: [["Clientes", "/owner/clientes"], ["Choferes", "/owner/choferes"], ["Operarios", "/owner/operarios"]] },
  { title: "Control", items: [["Guías", "/owner/guias"], ["Evidencias", "/owner/evidencias"], ["Incidencias", "/owner/incidencias"], ["Auditoría", "/owner/auditoria"]] },
  { title: "Finanzas", items: [["Pagos / Cobros", "/owner/pagos-cobros"], ["Gastos", "/owner/gastos"], ["Rentabilidad", "/owner/rentabilidad"], ["Pasarelas", "/owner/configuracion/pagos"]] },
  { title: "Sistema", items: [["Permisos", "/owner/permisos"], ["Configuración", "/owner/configuracion"]] },
] as const;

export function OwnerDesktopShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const { tenant } = useTenantData();
  const { state, actions } = useAppState();
  const gateways = (state.paymentGateways ?? []).filter(g => g.tenantId === state.activeTenantId);
  const connectedGateway = gateways.find(g => g.status === "conectada");
  const activeTenantUsers = state.users.filter(u => u.tenantId === state.activeTenantId);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brandWrap}>
        <div className={styles.brand}><span className={styles.brandMark}>360</span><span>Custodia<span>360</span></span></div>
        <small>Sistema privado operativo</small>
      </div>

      <div className={styles.platformMode}>
        <span className={styles.dot} />
        <div>
          <strong>Modo multi-dueño</strong>
          <small>Los datos se aíslan por negocio activo.</small>
        </div>
      </div>

      <div className={styles.tenantSwitch}>
        <span>Negocio activo</span>
        <select value={state.activeTenantId} onChange={e => actions.setActiveTenant(e.target.value)}>
          {state.tenants.map(t => <option key={t.id} value={t.id}>{t.code} · {t.name}</option>)}
        </select>
        <div className={styles.tenantMiniStats}>
          <small>{activeTenantUsers.filter(u => u.role === "chofer").length} choferes</small>
          <small>{activeTenantUsers.filter(u => u.role === "operario").length} operarios</small>
          <small>{activeTenantUsers.filter(u => u.role === "cliente").length} usuarios cliente</small>
        </div>
        <Link href="/platform" className={styles.adminLink}>Administrador General</Link>
      </div>

      <nav className={styles.nav}>
        {groups.map(group => <div key={group.title} className={styles.navGroup}>
          <div className={styles.groupTitle}>{group.title}</div>
          {group.items.map(([label, href]) => <Link key={href} href={href} className={pathname.startsWith(href) ? styles.active : ""}>{label}</Link>)}
        </div>)}
      </nav>

      <div className={styles.tenantBox}>
        <div className={styles.tenantCode}>{tenant?.code ?? "Sin dueño"}</div>
        <strong>{tenant?.name ?? "Sin dueño activo"}</strong>
        <small>Clientes, choferes, operarios, tareas, cobros y evidencias se filtran por tenantId.</small>
        <div className={connectedGateway ? styles.gatewayOk : styles.gatewayWarn}>{connectedGateway ? "Cobros conectados" : "Cobros por configurar"}</div>
      </div>
    </aside>
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operación activa · {tenant?.name ?? "Sin negocio"}</p>
          <h1>{title}</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/owner/solicitudes"><span>Solicitudes</span></Link>
          <Link href="/owner/configuracion/pagos"><span>Cobros</span></Link>
          <Link href="/platform"><span>Dueños</span></Link>
          <div className={styles.user}>Owner<br /><strong>{tenant?.code}</strong></div>
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  </div>;
}
