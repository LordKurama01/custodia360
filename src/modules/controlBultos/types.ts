import type {
  ClientRow,
  Currency,
  FinancialStatus,
  GuidePaidBy,
  GuidePaymentStatus,
  LogisticsStatus,
  OperationPaymentRow,
  OperationRow,
  OperationShipmentRow,
  PaymentMethod,
} from "@/infrastructure/supabase/types";

export type ControlClient = ClientRow;

export type ControlProvider = {
  id: string;
  name: string;
  phone: string | null;
  payment_methods: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PassPaymentStatus = "pendiente" | "parcial" | "pagado" | "anulado";

export type ControlShipment = OperationShipmentRow & {
  pass_payment_status?: PassPaymentStatus;
  pass_paid_at?: string | null;
  pass_payment_id?: string | null;
  /** Operativo: monto abonado de este pase. En base real se debe llevar con payment_allocations. */
  pass_paid_usd_amount?: number | null;
};
export type ControlPayment = OperationPaymentRow & { selected_pass_ids?: string[] };

export type SpecialMovementType = "pago_proveedor" | "adelanto_jeremias" | "dinero_recibido" | "mercaderia_agotada" | "devolucion" | "aplicado_otra_compra";
export type SpecialMovementStatus = "pendiente" | "pagado_proveedor" | "mercaderia_confirmada" | "mercaderia_agotada" | "a_devolver" | "aplicado_otra_compra" | "reintegrado" | "cerrado";

export type SpecialMovement = {
  id: string;
  operation_id: string;
  client_id: string;
  type: SpecialMovementType;
  status: SpecialMovementStatus;
  provider_name: string;
  amount: number;
  currency: Currency;
  money_source: "cliente_envio" | "jeremias_adelanto";
  note: string | null;
  created_at: string;
  updated_at: string;
};


export type OperationAuditAction =
  | "operation_created"
  | "operation_updated"
  | "logistics_status_changed"
  | "shipment_saved"
  | "payment_created"
  | "special_movement_created"
  | "operation_removed";

export type ControlOperationEvent = {
  id: string;
  operation_id: string | null;
  client_id: string | null;
  client_name?: string | null;
  operation_code?: string | null;
  action: OperationAuditAction | string;
  action_label: string;
  from_status?: LogisticsStatus | null;
  to_status?: LogisticsStatus | null;
  actor_id: string | null;
  actor_name: string;
  actor_role?: string | null;
  note?: string | null;
  created_at: string;
};

export type ControlOperation = OperationRow & {
  clients: Pick<ClientRow, "id" | "name" | "phone" | "default_price_per_package" | "private_code"> | null;
  operation_shipments: ControlShipment[];
  operation_payments: ControlPayment[];
  special_movements?: SpecialMovement[];
};

export type ControlBultosData = {
  clients: ControlClient[];
  operations: ControlOperation[];
  providers: ControlProvider[];
  operation_events?: ControlOperationEvent[];
};

export type OperationFormInput = {
  client_id: string;
  operation_date: string;
  provider_name: string;
  package_count: number;
  price_per_package: number;
  logistics_status: LogisticsStatus;
  note: string;
  pass_amount: number;
  visible_to_client: boolean;
};

export type ClientQuickInput = {
  name: string;
  phone: string;
  city?: string;
  email?: string;
  /** Campo de UI editable/limpiable: puede quedar vacío sin forzar 0 visual. */
  default_price_per_package?: number | "" | null;
  notes?: string;
};

export type ProviderQuickInput = {
  name: string;
  phone: string;
  payment_methods?: string;
  address?: string;
  notes?: string;
};

export type ShipmentInput = {
  operation_id: string;
  company: string;
  guide_number: string;
  guide_amount: number;
  dispatch_date: string | null;
  recipient_name?: string;
  recipient_identity_number?: string;
  destination_detail?: string;
  paid: boolean;
  guide_paid_by: GuidePaidBy;
  guide_payment_status: GuidePaymentStatus;
  method?: PaymentMethod;
  currency?: Currency;
  amount?: number;
  pass_usd_amount?: number;
  pass_date?: string | null;
  pass_note?: string;
};

export type PaymentInput = {
  operation_id: string;
  concept: string;
  method: PaymentMethod;
  currency: Currency;
  amount: number;
  note?: string;
  markGuideReimbursed?: boolean;
  selectedPassIds?: string[];
  dollarRate?: number;
};

export type SpecialMovementInput = {
  operation_id: string;
  client_id: string;
  type: SpecialMovementType;
  status: SpecialMovementStatus;
  provider_name: string;
  amount: number;
  currency: Currency;
  money_source: "cliente_envio" | "jeremias_adelanto";
  note?: string;
};

export type OperationTotals = {
  totalPackages: number;
  guideToCharge: number;
  passAmount: number;
  passAmountArs: number;
  totalAmount: number;
  paidArs: number;
  paidUsd: number;
  balanceArs: number;
  financialStatus: FinancialStatus;
};

export const DEFAULT_DOLLAR_RATE = 1500;
export const VIA_CARGO_SURCHARGE = 0.02;

export const logisticsStatusOptions: Array<{ value: LogisticsStatus; label: string; clientLabel: string }> = [
  { value: "para_retirar", label: "Para retirar", clientLabel: "En preparación" },
  { value: "retirado", label: "Retirado", clientLabel: "En preparación" },
  { value: "cd", label: "Depósito CD", clientLabel: "En preparación" },
  { value: "deposito_a", label: "Depósito A", clientLabel: "En tránsito" },
  { value: "deposito_b", label: "Depósito B", clientLabel: "En tránsito" },
  { value: "en_transito", label: "En tránsito", clientLabel: "En tránsito" },
  { value: "despachado", label: "Despachado", clientLabel: "Despachado" },
  { value: "recibido", label: "Recibido", clientLabel: "Recibido" },
];

export const transportCompanyOptions = ["Vía Cargo", "Buspack", "Crucero Express", "Correo Argentino", "Otro"];

export function getClientVisibleStatus(status: LogisticsStatus) {
  return logisticsStatusOptions.find((item) => item.value === status)?.clientLabel ?? "En preparación";
}

export function isViaCargo(company?: string | null) {
  return (company ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("via cargo");
}

export function calculateGuideCharge(company: string | null | undefined, amount: number) {
  const base = Number(amount || 0);
  return Math.round((isViaCargo(company) ? base * (1 + VIA_CARGO_SURCHARGE) : base) * 100) / 100;
}

export const financialStatusOptions: Array<{ value: FinancialStatus; label: string }> = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pago_parcial", label: "Pago parcial" },
  { value: "pago_total", label: "Pago total" },
];

export const paymentMethodOptions: Array<{ value: PaymentMethod; label: string; currency: Currency }> = [
  { value: "efectivo_pesos", label: "Pago en pesos", currency: "ARS" },
  { value: "efectivo_dolares", label: "Pago en dolares", currency: "USD" },
  { value: "transferencia_1", label: "Transferencia 1", currency: "ARS" },
  { value: "transferencia_2", label: "Transferencia 2", currency: "ARS" },
];

export const logisticsLabels = Object.fromEntries(logisticsStatusOptions.map((item) => [item.value, item.label])) as Record<LogisticsStatus, string>;
export const clientLogisticsLabels = Object.fromEntries(logisticsStatusOptions.map((item) => [item.value, item.clientLabel])) as Record<LogisticsStatus, string>;
export const financialLabels = Object.fromEntries(financialStatusOptions.map((item) => [item.value, item.label])) as Record<FinancialStatus, string>;
export const paymentMethodLabels = Object.fromEntries(paymentMethodOptions.map((item) => [item.value, item.label])) as Record<PaymentMethod, string>;

export const guidePaymentLabels: Record<GuidePaymentStatus, string> = {
  pendiente: "Pendiente",
  pagada_por_jeremias: "A reintegrar",
  pagada_por_cliente: "Pagada por cliente / destino",
  pendiente_reintegro: "A reintegrar",
  reintegrada: "Reintegrada",
};
