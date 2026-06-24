"use client";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/Table";
import { StatusBadge } from "@/shared/components/StatusBadge";

export default function Page() {
  const data = useTenantData();
  return <OwnerDesktopShell title="Permisos"><Card><DataTable><thead><tr><th>Regla</th><th>Estado</th></tr></thead><tbody>{["Owner ve todo","Cliente ve solo lo propio","Chofer ve tareas asignadas","Operario ve tareas internas"].map((p,i)=><tr key={i}><td>{p}</td><td>Preparado</td></tr>)}</tbody></DataTable></Card></OwnerDesktopShell>;
}
