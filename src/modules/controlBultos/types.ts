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
export type ControlShipment = OperationShipmentRow;
export type ControlPayment = OperationPaymentRow;

export type ControlOperation = OperationRow & {
  clients: Pick<ClientRow, "id" | "name" | "phone" | "default_price_per_package" | "private_code"> | null;
  operation_shipments: ControlShipment[];
  operation_payments: ControlPayment[];
};

export type ControlBultosData = {
  clients: ControlClient[];
  operations: ControlOperation[];
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
  email?: string;
  default_price_per_package: number;
  notes?: string;
};

export type ShipmentInput = {
  operation_id: string;
  company: string;
  guide_number: string;
  guide_amount: number;
  dispatch_date: string | null;
  paid: boolean;
  guide_paid_by: GuidePaidBy;
  guide_payment_status: GuidePaymentStatus;
  method?: PaymentMethod;
  currency?: Currency;
  amount?: number;
};

export type PaymentInput = {
  operation_id: string;
  concept: string;
  method: PaymentMethod;
  currency: Currency;
  amount: number;
  note?: string;
  markGuideReimbursed?: boolean;
};

export type OperationTotals = {
  totalPackages: number;
  guideToCharge: number;
  passAmount: number;
  totalAmount: number;
  paidArs: number;
  paidUsd: number;
  balanceArs: number;
  financialStatus: FinancialStatus;
};

export const logisticsStatusOptions: Array<{ value: LogisticsStatus; label: string }> = [
  { value: "para_retirar", label: "Para retirar" },
  { value: "retirado", label: "Retirado" },
  { value: "paso", label: "Paso" },
  { value: "deposito_1", label: "Deposito 1" },
  { value: "despachado", label: "Despachado" },
];

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
export const financialLabels = Object.fromEntries(financialStatusOptions.map((item) => [item.value, item.label])) as Record<FinancialStatus, string>;
export const paymentMethodLabels = Object.fromEntries(paymentMethodOptions.map((item) => [item.value, item.label])) as Record<PaymentMethod, string>;

export const guidePaymentLabels: Record<GuidePaymentStatus, string> = {
  pendiente: "Pendiente",
  pagada_por_jeremias: "Pagada por Jeremias",
  pagada_por_cliente: "Pagada por cliente",
  pendiente_reintegro: "Pendiente reintegro",
  reintegrada: "Reintegrada",
};
