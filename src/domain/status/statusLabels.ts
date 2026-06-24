import type { OperationalStatus, UserRole } from "@/domain/entities/types";

export const internalStatusLabels: Record<OperationalStatus, string> = {
  solicitud_recibida: "Solicitud recibida",
  pendiente_revision: "Pendiente de revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  orden_generada: "Orden generada",
  tarea_asignada: "Tarea asignada",
  en_retiro: "En retiro",
  retirado: "Retirado",
  en_preparacion: "En preparación",
  preparado: "Preparado",
  despachado: "Despachado",
  guia_cargada: "Guía cargada",
  en_transito: "En tránsito",
  entregado: "Entregado",
  recibido_conforme: "Recibido conforme",
  incidencia_reportada: "Incidencia reportada",
  listo_para_cobrar: "Listo para cobrar",
  cobrado: "Cobrado",
  cerrado: "Cerrado",
};

const clientMap: Partial<Record<OperationalStatus, string>> = {
  solicitud_recibida: "Recibido",
  pendiente_revision: "En revisión",
  aprobada: "Aprobado",
  orden_generada: "En preparación",
  tarea_asignada: "En preparación",
  en_preparacion: "En preparación",
  preparado: "Preparado",
  despachado: "Despachado",
  guia_cargada: "Despachado",
  en_transito: "En camino",
  entregado: "Entregado",
  recibido_conforme: "Entregado",
  incidencia_reportada: "Con problema",
};

const driverMap: Partial<Record<OperationalStatus, string>> = {
  tarea_asignada: "Asignado",
  en_retiro: "Ir a retirar",
  retirado: "Retirado",
  despachado: "Despachar",
  guia_cargada: "Guía cargada",
  entregado: "Entregado",
  incidencia_reportada: "Incidencia",
};

const operatorMap: Partial<Record<OperationalStatus, string>> = {
  tarea_asignada: "Pendiente",
  en_preparacion: "En preparación",
  preparado: "Preparado",
  guia_cargada: "Con evidencia",
  incidencia_reportada: "Observado",
  cerrado: "Completado",
};

export function statusLabel(status: OperationalStatus, role?: UserRole): string {
  if (role === "cliente") return clientMap[status] ?? internalStatusLabels[status];
  if (role === "chofer") return driverMap[status] ?? internalStatusLabels[status];
  if (role === "operario") return operatorMap[status] ?? internalStatusLabels[status];
  return internalStatusLabels[status];
}

export function statusTone(status: OperationalStatus): "neutral" | "info" | "ok" | "warn" | "danger" {
  if (["aprobada", "preparado", "entregado", "recibido_conforme", "cobrado", "cerrado"].includes(status)) return "ok";
  if (["pendiente_revision", "tarea_asignada", "listo_para_cobrar"].includes(status)) return "warn";
  if (["rechazada", "incidencia_reportada"].includes(status)) return "danger";
  if (["en_retiro", "retirado", "en_preparacion", "despachado", "guia_cargada", "en_transito", "orden_generada"].includes(status)) return "info";
  return "neutral";
}
