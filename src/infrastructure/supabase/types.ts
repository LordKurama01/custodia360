export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type InternalRole = "owner" | "admin" | "operator" | "collector" | "viewer";
export type LogisticsStatus = "para_retirar" | "retirado" | "paso" | "deposito_1" | "despachado";
export type FinancialStatus = "pendiente" | "pago_parcial" | "pago_total";
export type PaymentMethod = "efectivo_pesos" | "efectivo_dolares" | "transferencia_1" | "transferencia_2";
export type Currency = "ARS" | "USD";
export type GuidePaidBy = "jeremias" | "cliente" | "pendiente";
export type GuidePaymentStatus =
  | "pendiente"
  | "pagada_por_jeremias"
  | "pagada_por_cliente"
  | "pendiente_reintegro"
  | "reintegrada";

type TableDef<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: InternalRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  default_price_per_package: number;
  notes: string | null;
  private_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type OperationRow = {
  id: string;
  client_id: string;
  serial_number: number;
  operation_date: string;
  provider_name: string;
  package_count: number;
  price_per_package: number;
  total_packages_amount: number;
  logistics_status: LogisticsStatus;
  financial_status: FinancialStatus;
  note: string | null;
  pass_amount: number;
  total_amount: number;
  paid_amount_ars: number;
  paid_amount_usd: number;
  balance_amount: number;
  visible_to_client: boolean;
  public_code: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OperationShipmentRow = {
  id: string;
  operation_id: string;
  company: string | null;
  guide_number: string | null;
  guide_amount: number;
  guide_paid_by: GuidePaidBy;
  guide_payment_status: GuidePaymentStatus;
  guide_payment_method: PaymentMethod | null;
  guide_payment_currency: Currency | null;
  guide_paid_amount: number;
  dispatch_date: string | null;
  created_at: string;
  updated_at: string;
};

export type OperationPaymentRow = {
  id: string;
  operation_id: string;
  concept: string;
  method: PaymentMethod;
  currency: Currency;
  amount: number;
  paid_at: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type AttachmentRow = {
  id: string;
  operation_id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  visible_to_client: boolean;
  created_by: string | null;
  created_at: string;
};

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before_data: Json | null;
  after_data: Json | null;
  created_at: string;
};

export type AppSettingRow = {
  id: string;
  key: string;
  value: Json;
  updated_at: string;
};

export type Database = {
  public: {
    Enums: {
      internal_role: InternalRole;
      logistics_status: LogisticsStatus;
      financial_status: FinancialStatus;
      payment_method: PaymentMethod;
      currency: Currency;
      guide_paid_by: GuidePaidBy;
      guide_payment_status: GuidePaymentStatus;
    };
    Tables: {
      profiles: TableDef<ProfileRow>;
      clients: TableDef<ClientRow>;
      operations: TableDef<OperationRow>;
      operation_shipments: TableDef<OperationShipmentRow>;
      operation_payments: TableDef<OperationPaymentRow>;
      attachments: TableDef<AttachmentRow>;
      audit_logs: TableDef<AuditLogRow>;
      app_settings: TableDef<AppSettingRow>;
    };
    Views: Record<string, never>;
    Functions: {
      get_client_portal_data: { Args: { code: string }; Returns: Json };
    };
    CompositeTypes: Record<string, never>;
  };
};
