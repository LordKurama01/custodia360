import type { LogisticsStatus, GuidePaymentStatus } from "@/infrastructure/supabase/types";
import type { ControlOperation } from "../types";

/**
 * Bloque UI/operativo aislado para Mesa.
 * Mantiene separada la regla de visibilidad de la vista, formularios, guías y cobros.
 */
export const mesaVisibleStatuses = new Set<LogisticsStatus>([
  "para_retirar",
  "cd",
  "deposito_a",
  "deposito_b",
  "en_transito",
]);

export const mesaExitStatuses = new Set<LogisticsStatus>([
  "retirado",
  "despachado",
  "recibido",
]);

export function shouldShowOnMesa(operation: Pick<ControlOperation, "logistics_status">) {
  return mesaVisibleStatuses.has(operation.logistics_status);
}

export function leavesMesaOnStatus(status: LogisticsStatus) {
  return mesaExitStatuses.has(status);
}

export function statusVisualClass(status: LogisticsStatus | GuidePaymentStatus | string) {
  const map: Record<string, string> = {
    para_retirar: "statusParaRetirar",
    retirado: "statusRetirado",
    cd: "statusCd",
    deposito_a: "statusDepositoA",
    deposito_b: "statusDepositoB",
    en_transito: "statusEnTransito",
    despachado: "statusDespachado",
    recibido: "statusRecibido",
    pago_total: "ok",
    reintegrada: "ok",
    pagada_por_cliente: "ok",
    pagado: "ok",
    cerrado: "ok",
    reintegrado: "ok",
    pendiente_reintegro: "warn",
    pendiente: "warn",
    pagada_por_jeremias: "warn",
    pago_parcial: "info",
    parcial: "info",
    pagado_proveedor: "info",
  };
  return map[status] ?? "neutral";
}

export function guideStateLabel(operation: ControlOperation) {
  const shipments = operation.operation_shipments;
  if (!shipments.length) return "Guía: sin cargar";
  if (shipments.some((shipment) => !shipment.guide_number)) return "Guía: completar";
  if (shipments.every((shipment) => ["pagada_por_cliente", "reintegrada"].includes(shipment.guide_payment_status))) return "Guía: cerrada";
  return `Guía: ${shipments.length}`;
}

export function guideStateTone(operation: ControlOperation) {
  const label = guideStateLabel(operation);
  if (label.includes("sin cargar") || label.includes("completar")) return "warn";
  if (label.includes("cerrada")) return "ok";
  return "info";
}
