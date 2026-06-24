export type UserRole = "platform_admin" | "owner" | "cliente" | "chofer" | "operario";
export type Priority = "baja" | "media" | "alta" | "critica";
export type PaymentProvider = "mercado_pago" | "stripe" | "mobbex" | "manual_transfer" | "custom";
export type PaymentGatewayStatus = "sin_configurar" | "borrador" | "conectada" | "requiere_revision" | "desactivada";

export type OperationalStatus =
  | "solicitud_recibida"
  | "pendiente_revision"
  | "aprobada"
  | "rechazada"
  | "orden_generada"
  | "tarea_asignada"
  | "en_retiro"
  | "retirado"
  | "en_preparacion"
  | "preparado"
  | "despachado"
  | "guia_cargada"
  | "en_transito"
  | "entregado"
  | "recibido_conforme"
  | "incidencia_reportada"
  | "listo_para_cobrar"
  | "cobrado"
  | "cerrado";

export interface Tenant {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string | null;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  city?: string;
  active: boolean;
}

export interface ClientRequest {
  id: string;
  tenantId: string;
  clientId: string;
  code: string;
  clientName: string;
  originName: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  productDescription: string;
  quantity: number;
  withdrawalPersonName?: string;
  withdrawalDocument?: string;
  notes?: string;
  status: OperationalStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  evidenceIds: string[];
}

export interface InternalOrder {
  id: string;
  tenantId: string;
  requestId: string;
  code: string;
  clientName: string;
  status: OperationalStatus;
  createdAt: string;
  assignedTaskIds: string[];
}

export interface Task {
  id: string;
  tenantId: string;
  orderId: string;
  code: string;
  title: string;
  description?: string;
  assignedToUserId: string;
  assignedRole: UserRole;
  status: OperationalStatus;
  priority: Priority;
  dueAt?: string;
  evidenceRequired: boolean;
}

export interface TripBatch {
  id: string;
  tenantId: string;
  code: string;
  driverId: string;
  driverName: string;
  vehicle?: string;
  origin: string;
  destination: string;
  status: OperationalStatus;
  orderIds: string[];
  expenseIds: string[];
  evidenceIds: string[];
}

export interface PackageItem {
  id: string;
  tenantId: string;
  code: string;
  orderId: string;
  description: string;
  quantity: number;
  status: OperationalStatus;
}

export interface Guide {
  id: string;
  tenantId: string;
  code: string;
  orderId: string;
  carrier: string;
  guideNumber: string;
  status: OperationalStatus;
  evidenceId?: string;
}

export interface EvidenceFile {
  id: string;
  tenantId: string;
  entityType: "solicitud" | "orden" | "tarea" | "viaje" | "guia" | "incidencia";
  entityId: string;
  name: string;
  type: "image" | "pdf" | "audio" | "document";
  uploadedByUserId: string;
  uploadedAt: string;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  code: string;
  orderId?: string;
  clientId?: string;
  concept: string;
  amount: number;
  status: "pendiente" | "cobrado" | "vencido";
  dueAt?: string;
  provider?: PaymentProvider;
  providerIntentId?: string;
  checkoutUrl?: string;
}


export interface TenantPaymentGateway {
  id: string;
  tenantId: string;
  provider: PaymentProvider;
  status: PaymentGatewayStatus;
  displayName: string;
  publicKey?: string;
  accessTokenLast4?: string;
  webhookSecretConfigured: boolean;
  sandboxMode: boolean;
  enabledMethods: Array<"checkout_link" | "qr" | "manual_mark_as_paid" | "bank_transfer">;
  connectedAt?: string;
  updatedAt: string;
  notes?: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  code: string;
  concept: string;
  amount: number;
  category: "flete" | "viatico" | "combustible" | "peaje" | "imprevisto" | "otro";
  linkedTripId?: string;
  linkedOrderId?: string;
}

export interface ProfitabilityRecord {
  id: string;
  tenantId: string;
  entityType: "orden" | "viaje" | "periodo";
  entityId: string;
  income: number;
  expenses: number;
}

export interface Incident {
  id: string;
  tenantId: string;
  code: string;
  entityType: "solicitud" | "orden" | "tarea" | "viaje" | "bulto";
  entityId: string;
  title: string;
  description: string;
  status: "abierta" | "en_revision" | "resuelta";
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  entityType: "tenant" | "cliente" | "solicitud" | "orden" | "tarea" | "viaje" | "pago" | "incidencia" | "evidencia";
  entityId: string;
  action: string;
  previousStatus?: OperationalStatus;
  newStatus?: OperationalStatus;
  createdAt: string;
}

export interface OCRResult {
  id: string;
  tenantId: string;
  evidenceId: string;
  status: "pendiente" | "procesado" | "requiere_revision";
  extractedGuideNumber?: string;
  extractedCarrier?: string;
  extractedProvider?: string;
  confidence?: number;
}

export interface AppState {
  activeTenantId: string;
  tenants: Tenant[];
  users: User[];
  clients: Client[];
  requests: ClientRequest[];
  orders: InternalOrder[];
  tasks: Task[];
  trips: TripBatch[];
  packages: PackageItem[];
  guides: Guide[];
  evidences: EvidenceFile[];
  payments: PaymentRecord[];
  paymentGateways: TenantPaymentGateway[];
  expenses: Expense[];
  profitability: ProfitabilityRecord[];
  incidents: Incident[];
  audit: AuditEvent[];
}
