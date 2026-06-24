"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileShell.module.css";

export type MobileNavItem = { label: string; href: string };

export function MobileShell({ roleLabel, nav, children }: { roleLabel: string; nav: MobileNavItem[]; children: ReactNode }) {
  const pathname = usePathname();
  return <div className={styles.shell}>
    <header className={styles.top}>
      <div>
        <div className={styles.brand}><span>360</span> Custodia360</div>
        <div className={styles.role}>{roleLabel}</div>
      </div>
      <div className={styles.menu}>☰</div>
    </header>
    <main className={styles.content}>{children}</main>
    <nav className={styles.bottom}>{nav.map(item => <Link key={item.href} href={item.href} className={pathname.startsWith(item.href) ? styles.active : ""}>{item.label}</Link>)}</nav>
  </div>;
}

export const clienteNav: MobileNavItem[] = [
  { label: "Inicio", href: "/cliente/inicio" }, { label: "Nueva", href: "/cliente/nueva-solicitud" }, { label: "Pedidos", href: "/cliente/mis-solicitudes" }, { label: "Ayuda", href: "/cliente/reportar-problema" },
];
export const choferNav: MobileNavItem[] = [
  { label: "Hoy", href: "/chofer/inicio" }, { label: "Tareas", href: "/chofer/tareas" }, { label: "Ruta", href: "/chofer/ruta" }, { label: "Incidencia", href: "/chofer/reportar-incidencia" },
];
export const operarioNav: MobileNavItem[] = [
  { label: "Inicio", href: "/operativo/inicio" }, { label: "Tareas", href: "/operativo/tareas" }, { label: "Bultos", href: "/operativo/bultos" }, { label: "Problema", href: "/operativo/reportar-incidencia" },
];
export const ownerMobileNav: MobileNavItem[] = [
  { label: "Inicio", href: "/owner-mobile/inicio" }, { label: "Pendientes", href: "/owner-mobile/pendientes" }, { label: "Viajes", href: "/owner-mobile/viajes-activos" }, { label: "Cobrar", href: "/owner-mobile/por-cobrar" },
];
