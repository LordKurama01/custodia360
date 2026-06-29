import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { Json } from "@/infrastructure/supabase/types";
import { isDemoMode } from "@/shared/lib/demoMode";
import type {
  ClientQuickInput,
  ControlBultosData,
  ControlClient,
  ControlOperation,
  ControlOperationEvent,
  ControlProvider,
  OperationFormInput,
  PaymentInput,
  ProviderQuickInput,
  ShipmentInput,
  SpecialMovementInput,
} from "../types";
import { DEFAULT_DOLLAR_RATE, calculateGuideCharge, isViaCargo, logisticsLabels } from "../types";

const operationSelect = `
  *,
  clients(id, name, phone, default_price_per_package, private_code),
  operation_shipments(*),
  operation_payments(*)
`;

const demoStorageKey = "custodia360:control-bultos-demo:v10-flujo-operativo";

function requireNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function cleanText(value: string) {
  return value.trim() || null;
}

function cleanOptionalPrice(value: number | "" | null | undefined) {
  if (value === "" || value === null || value === undefined) return 0;
  return Number(value || 0);
}

function mergeCityNotes(city?: string, notes?: string) {
  return [city?.trim() ? `Ciudad: ${city.trim()}` : "", notes?.trim() ?? ""].filter(Boolean).join("\n") || "";
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function makePublicCode(prefix = "C360") {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}


type OperationEventDraft = Partial<Omit<ControlOperationEvent, "action">> & Pick<ControlOperationEvent, "action">;

function demoActor() {
  return { id: "demo-owner", name: "Jeremías", role: "Owner" };
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    operation_created: "Creó pedido",
    operation_updated: "Modificó pedido",
    logistics_status_changed: "Cambió estado",
    shipment_saved: "Guardó guía",
    payment_created: "Registró cobro",
    special_movement_created: "Registró movimiento",
    operation_removed: "Eliminó operación",
  };
  return labels[action] ?? action.replaceAll("_", " ");
}

function makeEvent(operation: ControlOperation | null, draft: OperationEventDraft): ControlOperationEvent {
  const actor = demoActor();
  return {
    id: draft.id ?? makeId("event"),
    operation_id: draft.operation_id ?? operation?.id ?? null,
    client_id: draft.client_id ?? operation?.client_id ?? null,
    client_name: draft.client_name ?? operation?.clients?.name ?? null,
    operation_code: draft.operation_code ?? operation?.public_code ?? null,
    action: draft.action,
    action_label: draft.action_label || actionLabel(draft.action),
    from_status: draft.from_status ?? null,
    to_status: draft.to_status ?? null,
    actor_id: draft.actor_id ?? actor.id,
    actor_name: draft.actor_name || actor.name,
    actor_role: draft.actor_role ?? actor.role,
    note: draft.note ?? null,
    created_at: draft.created_at ?? nowIso(),
  };
}

function appendEvent(data: ControlBultosData, event: ControlOperationEvent) {
  return {
    ...data,
    operation_events: [event, ...(data.operation_events ?? [])].slice(0, 300),
  };
}

function seedOperationEvents(operations: ControlOperation[]): ControlOperationEvent[] {
  return operations.map((operation) => makeEvent(operation, {
    operation_id: operation.id,
    client_id: operation.client_id,
    action: "logistics_status_changed",
    action_label: "Cambio de estado inicial",
    from_status: null,
    to_status: operation.logistics_status,
    note: `Estado actual: ${logisticsLabels[operation.logistics_status]}`,
    created_at: operation.updated_at ?? operation.created_at,
  }));
}

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function normalizeOperation(operation: ControlOperation): ControlOperation {
  return {
    ...operation,
    operation_shipments: operation.operation_shipments ?? [],
    operation_payments: operation.operation_payments ?? [],
    special_movements: operation.special_movements ?? [],
  };
}

function getPassUsd(operation: ControlOperation) {
  const guidePassTotal = roundMoney(operation.operation_shipments.reduce((sum, shipment) => sum + Number(shipment.pass_usd_amount || 0), 0));
  return guidePassTotal > 0 ? guidePassTotal : Number(operation.pass_amount || 0);
}

function recalculateOperation(operation: ControlOperation): ControlOperation {
  const normalized = normalizeOperation(operation);
  const totalPackages = roundMoney(Number(normalized.package_count || 0) * Number(normalized.price_per_package || 0));
  const guideToCharge = normalized.operation_shipments.reduce((sum, shipment) => {
    if (shipment.guide_payment_status === "pagada_por_cliente") return sum;
    return sum + calculateGuideCharge(shipment.company, Number(shipment.guide_amount || 0));
  }, 0);
  const passUsd = getPassUsd(normalized);
  const passAmount = passUsd * DEFAULT_DOLLAR_RATE;
  const paidArs = normalized.operation_payments.reduce((sum, payment) => payment.currency === "ARS" ? sum + Number(payment.amount || 0) : sum, 0);
  const paidUsd = normalized.operation_payments.reduce((sum, payment) => payment.currency === "USD" ? sum + Number(payment.amount || 0) : sum, 0);
  const totalAmount = roundMoney(totalPackages + guideToCharge + passAmount);
  const balance = roundMoney(Math.max(totalAmount - paidArs, 0));

  return {
    ...normalized,
    total_packages_amount: totalPackages,
    pass_amount: passUsd,
    total_amount: totalAmount,
    paid_amount_ars: roundMoney(paidArs),
    paid_amount_usd: roundMoney(paidUsd),
    balance_amount: balance,
    financial_status: paidArs <= 0 && paidUsd <= 0 ? "pendiente" : balance <= 0 ? "pago_total" : "pago_parcial",
    updated_at: nowIso(),
  };
}

function getDemoSeed(): ControlBultosData {
  const created = "2026-06-24T10:00:00.000Z";
  const today = todayIso();
  const clients: ControlClient[] = [
    {
      id: "demo-client-estela",
      name: "Estela",
      phone: "+54 9 236 555-0101",
      email: null,
      default_price_per_package: 0,
      notes: "Cliente principal. Puede enviar compras a destinatarios propios y consultar por link privado.",
      private_code: "CLI-ESTELA",
      active: true,
      created_at: created,
      updated_at: created,
    },
    {
      id: "demo-client-matias",
      name: "Matías",
      phone: "+54 9 236 555-0202",
      email: null,
      default_price_per_package: 0,
      notes: "Cliente con pases pendientes ligados a guías.",
      private_code: "CLI-MATIAS",
      active: true,
      created_at: created,
      updated_at: created,
    },
  ];

  const estelaClient = { id: "demo-client-estela", name: "Estela", phone: "+54 9 236 555-0101", default_price_per_package: 0, private_code: "CLI-ESTELA" };
  const matiasClient = { id: "demo-client-matias", name: "Matías", phone: "+54 9 236 555-0202", default_price_per_package: 0, private_code: "CLI-MATIAS" };

  const providers: ControlProvider[] = [
    {
      id: "demo-provider-genesis",
      name: "Génesis",
      phone: "+595 981 000001",
      payment_methods: "Efectivo / transferencia / USDT a confirmar",
      address: "Ciudad del Este · referencia local",
      notes: "Proveedor habitual para compras de electrónica y accesorios.",
      active: true,
      created_at: created,
      updated_at: created,
    },
    {
      id: "demo-provider-atacado",
      name: "Atacado Game",
      phone: "+595 981 000002",
      payment_methods: "Transferencia / efectivo",
      address: "Galería comercial CDE",
      notes: "Usar foto de remito y validar bultos antes de retirar.",
      active: true,
      created_at: created,
      updated_at: created,
    },
  ];

  const operations: ControlOperation[] = [
    recalculateOperation({
      id: "demo-op-estela-telefonos",
      client_id: "demo-client-estela",
      serial_number: 1,
      operation_date: today,
      provider_name: "Génesis",
      package_count: 5,
      price_per_package: 0,
      total_packages_amount: 0,
      logistics_status: "despachado",
      financial_status: "pendiente",
      note: "Compra 5 teléfonos. Estela paga; cada guía identifica un pedido/envío para un destinatario diferente.",
      pass_amount: 550,
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: true,
      public_code: "ESTELA-5TEL",
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: created,
      updated_at: created,
      clients: estelaClient,
      operation_shipments: [
        {
          id: "demo-ship-estela-1",
          operation_id: "demo-op-estela-telefonos",
          company: "Vía Cargo",
          guide_number: "VC-10253",
          guide_amount: 57000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Matías",
          recipient_identity_number: "33.547.272",
          destination_detail: "Retira Matías por indicación de Estela.",
          pass_usd_amount: 80,
          pass_paid_usd_amount: 50,
          pass_payment_status: "parcial",
          pass_date: today,
          pass_note: "Pase asociado a guía VC-10253.",
          guide_cost_amount: 57000,
          guide_surcharge_percent: 2,
          guide_charge_amount: 58140,
          dispatch_date: today,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-estela-2",
          operation_id: "demo-op-estela-telefonos",
          company: "Buspack",
          guide_number: "BP-10254",
          guide_amount: 38000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Juan",
          recipient_identity_number: "31.111.111",
          destination_detail: "Entrega a cliente de Estela.",
          pass_usd_amount: 150,
          pass_paid_usd_amount: 80,
          pass_payment_status: "parcial",
          pass_date: today,
          pass_note: "Pase asociado a guía BP-10254.",
          guide_cost_amount: 38000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 38000,
          dispatch_date: today,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-estela-3",
          operation_id: "demo-op-estela-telefonos",
          company: "Crucero Express",
          guide_number: "CE-10255",
          guide_amount: 42000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Laura",
          recipient_identity_number: "29.222.222",
          destination_detail: "Entrega a tercero autorizado.",
          pass_usd_amount: 200,
          pass_paid_usd_amount: 0,
          pass_payment_status: "pendiente",
          pass_date: today,
          pass_note: "Pase asociado a guía CE-10255.",
          guide_cost_amount: 42000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 42000,
          dispatch_date: today,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-estela-4",
          operation_id: "demo-op-estela-telefonos",
          company: "Correo Argentino",
          guide_number: "CA-10256",
          guide_amount: 26000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Pedro",
          recipient_identity_number: "30.333.333",
          destination_detail: "Entrega a cuarto destinatario.",
          pass_usd_amount: 70,
          pass_paid_usd_amount: 70,
          pass_payment_status: "pagado",
          pass_date: today,
          pass_note: "Pase asociado a guía CA-10256.",
          guide_cost_amount: 26000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 26000,
          dispatch_date: today,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-estela-5",
          operation_id: "demo-op-estela-telefonos",
          company: "Buspack",
          guide_number: "BP-10257",
          guide_amount: 57000,
          guide_paid_by: "pendiente",
          guide_payment_status: "pendiente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Carla",
          recipient_identity_number: "32.444.444",
          destination_detail: "Guía no pagada / pendiente para mostrar en WhatsApp.",
          pass_usd_amount: 50,
          pass_paid_usd_amount: 0,
          pass_payment_status: "pendiente",
          pass_date: today,
          pass_note: "Pase asociado a guía BP-10257.",
          guide_cost_amount: 57000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 57000,
          dispatch_date: today,
          created_at: created,
          updated_at: created,
        },
      ],
      operation_payments: [],
      special_movements: [],
    }),
    recalculateOperation({
      id: "demo-op-matias-pases",
      client_id: "demo-client-matias",
      serial_number: 2,
      operation_date: today,
      provider_name: "Atacado Game",
      package_count: 3,
      price_per_package: 0,
      total_packages_amount: 0,
      logistics_status: "deposito_a",
      financial_status: "pendiente",
      note: "Compras varias con pases pendientes: USD 80 + USD 150 + USD 200. El equivalente en pesos se actualiza con el dólar del día.",
      pass_amount: 430,
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: true,
      public_code: "MATIAS-PASES",
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: created,
      updated_at: created,
      clients: matiasClient,
      operation_shipments: [
        {
          id: "demo-ship-matias-1",
          operation_id: "demo-op-matias-pases",
          company: "Vía Cargo",
          guide_number: "VC-20080",
          guide_amount: 50000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Matías",
          recipient_identity_number: "33.547.272",
          destination_detail: "Guía paga en destino.",
          pass_usd_amount: 80,
          pass_paid_usd_amount: 50,
          pass_payment_status: "parcial",
          pass_date: today,
          pass_note: "Pase variable cargado manualmente.",
          guide_cost_amount: 50000,
          guide_surcharge_percent: 2,
          guide_charge_amount: 51000,
          dispatch_date: null,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-matias-2",
          operation_id: "demo-op-matias-pases",
          company: "Correo Argentino",
          guide_number: "CA-20150",
          guide_amount: 30000,
          guide_paid_by: "cliente",
          guide_payment_status: "pagada_por_cliente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Matías",
          recipient_identity_number: "33.547.272",
          destination_detail: "Pase asociado a esta guía.",
          pass_usd_amount: 150,
          pass_paid_usd_amount: 80,
          pass_payment_status: "parcial",
          pass_date: today,
          pass_note: "Pase variable cargado manualmente.",
          guide_cost_amount: 30000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 30000,
          dispatch_date: null,
          created_at: created,
          updated_at: created,
        },
        {
          id: "demo-ship-matias-3",
          operation_id: "demo-op-matias-pases",
          company: "Buspack",
          guide_number: "BP-20200",
          guide_amount: 57000,
          guide_paid_by: "pendiente",
          guide_payment_status: "pendiente",
          guide_payment_method: null,
          guide_payment_currency: null,
          guide_paid_amount: 0,
          recipient_name: "Matías",
          recipient_identity_number: "33.547.272",
          destination_detail: "Guía pendiente: $57.000 Buspack.",
          pass_usd_amount: 200,
          pass_paid_usd_amount: 0,
          pass_payment_status: "pendiente",
          pass_date: today,
          pass_note: "Pase variable cargado manualmente.",
          guide_cost_amount: 57000,
          guide_surcharge_percent: 0,
          guide_charge_amount: 57000,
          dispatch_date: null,
          created_at: created,
          updated_at: created,
        },
      ],
      operation_payments: [],
      special_movements: [
        {
          id: "demo-special-matias-uza",
          operation_id: "demo-op-matias-pases",
          client_id: "demo-client-matias",
          type: "adelanto_jeremias",
          status: "pendiente",
          provider_name: "Atacado UZA",
          amount: 500000,
          currency: "ARS",
          money_source: "jeremias_adelanto",
          note: "Proveedor no aceptaba USDT. Jeremías adelantó el pago al proveedor; queda pendiente de reintegro.",
          created_at: created,
          updated_at: created,
        },
      ],
    }),
  ];

  return { clients, operations, providers, operation_events: seedOperationEvents(operations) };
}
function readDemoData(): ControlBultosData {
  if (typeof window === "undefined") return getDemoSeed();

  try {
    const raw = window.localStorage.getItem(demoStorageKey);
    if (!raw) {
      const seed = getDemoSeed();
      window.localStorage.setItem(demoStorageKey, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as ControlBultosData;
    return {
      clients: parsed.clients ?? [],
      operations: (parsed.operations ?? []).map((operation) => recalculateOperation(normalizeOperation(operation))),
      providers: parsed.providers ?? [],
      operation_events: parsed.operation_events ?? seedOperationEvents((parsed.operations ?? []).map((operation) => recalculateOperation(normalizeOperation(operation)))),
    };
  } catch {
    return getDemoSeed();
  }
}

function writeDemoData(data: ControlBultosData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(demoStorageKey, JSON.stringify({
    clients: data.clients,
    operations: data.operations.map((operation) => recalculateOperation(operation)),
    providers: data.providers ?? [],
    operation_events: data.operation_events ?? [],
  }));
}

const providerStorageKey = "custodia360:provider-directory:v1";

function readProviderDirectory(): ControlProvider[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(providerStorageKey);
    return raw ? JSON.parse(raw) as ControlProvider[] : [];
  } catch {
    return [];
  }
}

function writeProviderDirectory(providers: ControlProvider[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(providerStorageKey, JSON.stringify(providers));
}

async function getActorId() {
  if (isDemoMode()) return "demo-owner";
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function recordAudit(action: string, entityType: string, entityId: string | null, afterData?: Json, beforeData?: Json) {
  if (isDemoMode()) return;
  const supabase = createSupabaseBrowserClient();
  const actorId = await getActorId();
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    before_data: beforeData ?? null,
    after_data: afterData ?? null,
  });
}

export async function getControlBultosData(): Promise<ControlBultosData> {
  if (isDemoMode()) return readDemoData();

  const supabase = createSupabaseBrowserClient();
  const [clientsResult, operationsResult, auditResult, profilesResult] = await Promise.all([
    supabase.from("clients").select("*").eq("active", true).order("name", { ascending: true }),
    supabase.from("operations").select(operationSelect).order("operation_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("audit_logs").select("*").eq("entity_type", "operation").order("created_at", { ascending: false }).limit(250),
    supabase.from("profiles").select("id, full_name, email, role"),
  ]);

  requireNoError(clientsResult.error, "No se pudieron cargar clientes.");
  requireNoError(operationsResult.error, "No se pudieron cargar operaciones.");

  const operations = ((operationsResult.data ?? []) as unknown as ControlOperation[]).map(normalizeOperation);
  const operationMap = new Map(operations.map((operation) => [operation.id, operation]));
  const profileMap = new Map((profilesResult.data ?? []).map((profile: { id: string; full_name: string | null; email: string; role: string }) => [profile.id, profile]));
  const operationEvents: ControlOperationEvent[] = (auditResult.data ?? []).map((row) => {
    const operation = row.entity_id ? operationMap.get(row.entity_id) ?? null : null;
    const beforeData = row.before_data && typeof row.before_data === "object" && !Array.isArray(row.before_data) ? row.before_data as Record<string, Json> : null;
    const afterData = row.after_data && typeof row.after_data === "object" && !Array.isArray(row.after_data) ? row.after_data as Record<string, Json> : null;
    const actor = row.actor_id ? profileMap.get(row.actor_id) : null;
    return makeEvent(operation, {
      id: row.id,
      operation_id: row.entity_id,
      client_id: operation?.client_id ?? (typeof afterData?.client_id === "string" ? afterData.client_id : null),
      action: row.action,
      action_label: actionLabel(row.action),
      from_status: beforeData?.logistics_status as ControlOperationEvent["from_status"],
      to_status: afterData?.logistics_status as ControlOperationEvent["to_status"],
      actor_id: row.actor_id,
      actor_name: actor?.full_name || actor?.email || "Usuario autorizado",
      actor_role: actor?.role ?? null,
      note: row.action === "logistics_status_changed" ? "Cambio de estado registrado" : null,
      created_at: row.created_at,
    });
  });

  return {
    clients: (clientsResult.data ?? []) as ControlClient[],
    operations,
    providers: readProviderDirectory(),
    operation_events: operationEvents,
  };
}

export async function createQuickClient(input: ClientQuickInput) {
  if (isDemoMode()) {
    const data = readDemoData();
    const client: ControlClient = {
      id: makeId("demo-client"),
      name: input.name.trim(),
      phone: cleanText(input.phone),
      email: cleanText(input.email ?? ""),
      default_price_per_package: cleanOptionalPrice(input.default_price_per_package),
      notes: cleanText(mergeCityNotes(input.city, input.notes)),
      private_code: makePublicCode("CLI"),
      active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    writeDemoData({ ...data, clients: [...data.clients, client] });
    return client;
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: input.name.trim(),
      phone: cleanText(input.phone),
      email: cleanText(input.email ?? ""),
      default_price_per_package: cleanOptionalPrice(input.default_price_per_package),
      notes: cleanText(mergeCityNotes(input.city, input.notes)),
    })
    .select("*")
    .single();

  requireNoError(error, "No se pudo crear el cliente.");
  await recordAudit("client_created", "client", data?.id ?? null, data as Json);
  return data as ControlClient;
}


export async function createQuickProvider(input: ProviderQuickInput) {
  if (!input.name.trim()) throw new Error("El nombre del proveedor es obligatorio.");

  const provider: ControlProvider = {
    id: makeId("provider"),
    name: input.name.trim(),
    phone: cleanText(input.phone),
    payment_methods: cleanText(input.payment_methods ?? ""),
    address: cleanText(input.address ?? ""),
    notes: cleanText(input.notes ?? ""),
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  if (isDemoMode()) {
    const data = readDemoData();
    const providers = [...(data.providers ?? []).filter((item) => item.name.toLowerCase() !== provider.name.toLowerCase()), provider]
      .sort((a, b) => a.name.localeCompare(b.name));
    writeDemoData({ ...data, providers });
    return provider;
  }

  const providers = [...readProviderDirectory().filter((item) => item.name.toLowerCase() !== provider.name.toLowerCase()), provider]
    .sort((a, b) => a.name.localeCompare(b.name));
  writeProviderDirectory(providers);
  await recordAudit("provider_created", "provider", provider.id, provider as unknown as Json);
  return provider;
}

export async function createOperation(input: OperationFormInput) {
  if (isDemoMode()) {
    const data = readDemoData();
    const client = data.clients.find((item) => item.id === input.client_id);
    const operation = recalculateOperation({
      id: makeId("demo-op"),
      client_id: input.client_id,
      serial_number: data.operations.length + 1,
      operation_date: input.operation_date,
      provider_name: input.provider_name.trim(),
      package_count: Number(input.package_count || 1),
      price_per_package: Number(input.price_per_package || 0),
      total_packages_amount: 0,
      logistics_status: input.logistics_status,
      financial_status: "pendiente",
      note: cleanText(input.note),
      pass_amount: Number(input.pass_amount || 0),
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: input.visible_to_client,
      public_code: makePublicCode("DEMO"),
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: nowIso(),
      updated_at: nowIso(),
      clients: client ? { id: client.id, name: client.name, phone: client.phone, default_price_per_package: client.default_price_per_package, private_code: client.private_code } : null,
      operation_shipments: [],
      operation_payments: [],
      special_movements: [],
    });
    writeDemoData(appendEvent({ ...data, operations: [operation, ...data.operations] }, makeEvent(operation, { action: "operation_created", action_label: "Creó pedido", to_status: operation.logistics_status, note: "Pedido creado desde alta rápida" })));
    return operation;
  }

  const supabase = createSupabaseBrowserClient();
  const actorId = await getActorId();
  const { data, error } = await supabase
    .from("operations")
    .insert({
      client_id: input.client_id,
      operation_date: input.operation_date,
      provider_name: input.provider_name.trim(),
      package_count: input.package_count,
      price_per_package: input.price_per_package,
      logistics_status: input.logistics_status,
      note: cleanText(input.note),
      pass_amount: input.pass_amount,
      visible_to_client: input.visible_to_client,
      created_by: actorId,
      updated_by: actorId,
    })
    .select(operationSelect)
    .single();

  requireNoError(error, "No se pudo crear la operacion.");
  await recordAudit("operation_created", "operation", data?.id ?? null, data as Json);
  return normalizeOperation(data as unknown as ControlOperation);
}

export async function updateOperation(operationId: string, input: OperationFormInput) {
  if (isDemoMode()) {
    const data = readDemoData();
    const client = data.clients.find((item) => item.id === input.client_id);
    const before = data.operations.find((operation) => operation.id === operationId) ?? null;
    const operations = data.operations.map((operation) => operation.id === operationId ? recalculateOperation({
      ...operation,
      client_id: input.client_id,
      operation_date: input.operation_date,
      provider_name: input.provider_name.trim(),
      package_count: Number(input.package_count || 1),
      price_per_package: Number(input.price_per_package || 0),
      logistics_status: input.logistics_status,
      note: cleanText(input.note),
      pass_amount: Number(input.pass_amount || 0),
      visible_to_client: input.visible_to_client,
      updated_by: "demo-owner",
      clients: client ? { id: client.id, name: client.name, phone: client.phone, default_price_per_package: client.default_price_per_package, private_code: client.private_code } : null,
    }) : operation);
    const updated = operations.find((item) => item.id === operationId) ?? null;
    const action = before?.logistics_status !== updated?.logistics_status ? "logistics_status_changed" : "operation_updated";
    const note = before?.logistics_status !== updated?.logistics_status
      ? `Estado ${before ? logisticsLabels[before.logistics_status] : "-"} → ${updated ? logisticsLabels[updated.logistics_status] : "-"}`
      : "Pedido modificado: bultos, valor, proveedor, pase o descripción";
    writeDemoData(updated ? appendEvent({ ...data, operations }, makeEvent(updated, { action, action_label: actionLabel(action), from_status: before?.logistics_status ?? null, to_status: updated.logistics_status, note })) : { ...data, operations });
    return updated;
  }

  const supabase = createSupabaseBrowserClient();
  const actorId = await getActorId();
  const { data: before } = await supabase.from("operations").select("*").eq("id", operationId).maybeSingle();
  const { data, error } = await supabase
    .from("operations")
    .update({
      client_id: input.client_id,
      operation_date: input.operation_date,
      provider_name: input.provider_name.trim(),
      package_count: input.package_count,
      price_per_package: input.price_per_package,
      logistics_status: input.logistics_status,
      note: cleanText(input.note),
      pass_amount: input.pass_amount,
      visible_to_client: input.visible_to_client,
      updated_by: actorId,
    })
    .eq("id", operationId)
    .select(operationSelect)
    .single();

  requireNoError(error, "No se pudo editar la operacion.");
  const beforeStatus = before?.logistics_status as OperationFormInput["logistics_status"] | undefined;
  const nextStatus = (data as { logistics_status?: OperationFormInput["logistics_status"] } | null)?.logistics_status;
  await recordAudit(beforeStatus && nextStatus && beforeStatus !== nextStatus ? "logistics_status_changed" : "operation_updated", "operation", operationId, data as Json, before as Json);
  return normalizeOperation(data as unknown as ControlOperation);
}

export async function updateLogisticsStatus(operationId: string, logisticsStatus: OperationFormInput["logistics_status"]) {
  if (isDemoMode()) {
    const data = readDemoData();
    const before = data.operations.find((operation) => operation.id === operationId) ?? null;
    const operations = data.operations.map((operation) => operation.id === operationId ? recalculateOperation({ ...operation, logistics_status: logisticsStatus, updated_by: "demo-owner" }) : operation);
    const updated = operations.find((item) => item.id === operationId) ?? null;
    writeDemoData(updated ? appendEvent({ ...data, operations }, makeEvent(updated, {
      action: "logistics_status_changed",
      action_label: "Cambió estado",
      from_status: before?.logistics_status ?? null,
      to_status: logisticsStatus,
      note: `Estado ${before ? logisticsLabels[before.logistics_status] : "-"} → ${logisticsLabels[logisticsStatus]}`,
    })) : { ...data, operations });
    return updated;
  }

  const supabase = createSupabaseBrowserClient();
  const actorId = await getActorId();
  const { data: before } = await supabase.from("operations").select("*").eq("id", operationId).maybeSingle();
  const { data, error } = await supabase
    .from("operations")
    .update({ logistics_status: logisticsStatus, updated_by: actorId })
    .eq("id", operationId)
    .select(operationSelect)
    .single();

  requireNoError(error, "No se pudo cambiar el estado.");
  await recordAudit("logistics_status_changed", "operation", operationId, data as Json, before as Json);
  return normalizeOperation(data as unknown as ControlOperation);
}

export async function saveShipment(input: ShipmentInput) {
  if (input.guide_amount > 0 && input.paid && input.guide_paid_by === "pendiente") {
    throw new Error("Indica quien pago la guia.");
  }

  if (input.guide_amount > 0 && input.paid && (!input.method || !input.currency || !input.amount || input.amount <= 0)) {
    throw new Error("No se puede marcar la guia como pagada sin metodo, moneda y monto.");
  }

  if (isDemoMode()) {
    const data = readDemoData();
    const operations = data.operations.map((operation) => {
      if (operation.id !== input.operation_id) return operation;
      const guideAmount = Number(input.guide_amount || 0);
      const company = cleanText(input.company);
      const shipment = {
        id: makeId("demo-ship"),
        operation_id: input.operation_id,
        company,
        guide_number: cleanText(input.guide_number),
        guide_amount: guideAmount,
        guide_paid_by: input.paid ? input.guide_paid_by : "pendiente" as const,
        guide_payment_status: input.paid ? input.guide_payment_status : "pendiente" as const,
        guide_payment_method: input.paid ? input.method ?? null : null,
        guide_payment_currency: input.paid ? input.currency ?? null : null,
        guide_paid_amount: input.paid ? Number(input.amount || 0) : 0,
        recipient_name: cleanText(input.recipient_name ?? ""),
        recipient_identity_number: cleanText(input.recipient_identity_number ?? ""),
        destination_detail: cleanText(input.destination_detail ?? ""),
        guide_cost_amount: guideAmount,
        pass_usd_amount: Number(input.pass_usd_amount || 0),
        pass_paid_usd_amount: 0,
        pass_date: input.pass_date || todayIso(),
        pass_note: cleanText(input.pass_note ?? ""),
        pass_payment_status: "pendiente" as const,
        pass_paid_at: null,
        pass_payment_id: null,
        guide_surcharge_percent: isViaCargo(company) ? 2 : 0,
        guide_charge_amount: calculateGuideCharge(company, guideAmount),
        dispatch_date: input.dispatch_date,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      return recalculateOperation({ ...operation, operation_shipments: [...operation.operation_shipments, shipment] });
    });
    const updated = operations.find((item) => item.id === input.operation_id) ?? null;
    const saved = updated?.operation_shipments.at(-1) ?? null;
    writeDemoData(updated ? appendEvent({ ...data, operations }, makeEvent(updated, {
      action: "shipment_saved",
      action_label: "Guardó guía",
      to_status: updated.logistics_status,
      note: saved ? `Guía ${saved.guide_number || "sin número"} · ${saved.company || "sin empresa"}` : "Guía cargada",
    })) : { ...data, operations });
    return saved;
  }

  const supabase = createSupabaseBrowserClient();
  const company = cleanText(input.company);
  const guideAmount = Number(input.guide_amount || 0);
  const payload = {
    operation_id: input.operation_id,
    company,
    guide_number: cleanText(input.guide_number),
    guide_amount: guideAmount,
    guide_paid_by: input.paid ? input.guide_paid_by : "pendiente",
    guide_payment_status: input.paid ? input.guide_payment_status : "pendiente",
    guide_payment_method: input.paid ? input.method ?? null : null,
    guide_payment_currency: input.paid ? input.currency ?? null : null,
    guide_paid_amount: input.paid ? input.amount ?? 0 : 0,
    recipient_name: cleanText(input.recipient_name ?? ""),
    recipient_identity_number: cleanText(input.recipient_identity_number ?? ""),
    destination_detail: cleanText(input.destination_detail ?? ""),
    guide_cost_amount: guideAmount,
    pass_usd_amount: Number(input.pass_usd_amount || 0),
    pass_date: input.pass_date || todayIso(),
    pass_note: cleanText(input.pass_note ?? ""),
    guide_surcharge_percent: isViaCargo(company) ? 2 : 0,
    guide_charge_amount: calculateGuideCharge(company, guideAmount),
    dispatch_date: input.dispatch_date,
  };

  const { data, error } = await supabase.from("operation_shipments").insert(payload).select("*").single();
  requireNoError(error, "No se pudo guardar la guia.");
  await recordAudit("shipment_saved", "operation", input.operation_id, data as Json);
  return data;
}

export async function createPayment(input: PaymentInput) {
  if (!input.method) throw new Error("El metodo de pago es obligatorio.");
  if (!input.amount || input.amount <= 0) throw new Error("El monto debe ser mayor a cero.");

  if (isDemoMode()) {
    const data = readDemoData();
    const operations = data.operations.map((operation) => {
      if (operation.id !== input.operation_id) return operation;
      const payment = {
        id: makeId("demo-pay"),
        operation_id: input.operation_id,
        concept: input.concept.trim(),
        method: input.method,
        currency: input.currency,
        amount: Number(input.amount || 0),
        paid_at: nowIso(),
        note: cleanText(input.note ?? ""),
        created_by: "demo-owner",
        created_at: nowIso(),
      };
      const selectedPassIds = input.selectedPassIds ?? [];
      let remainingUsdToApply = input.currency === "USD" ? Number(input.amount || 0) : Number(input.amount || 0) / DEFAULT_DOLLAR_RATE;
      const nextShipments = operation.operation_shipments.map((shipment) => {
        const withGuideStatus = input.markGuideReimbursed && shipment.guide_payment_status === "pendiente_reintegro"
          ? { ...shipment, guide_payment_status: "reintegrada" as const }
          : shipment;
        if (!selectedPassIds.includes(shipment.id)) return withGuideStatus;

        const passTotal = Number(shipment.pass_usd_amount || 0);
        const alreadyPaid = Number(shipment.pass_paid_usd_amount || 0);
        const openBalance = Math.max(passTotal - alreadyPaid, 0);
        const appliedUsd = Math.min(openBalance, Math.max(remainingUsdToApply, 0));
        remainingUsdToApply = Math.max(remainingUsdToApply - appliedUsd, 0);
        const nextPaid = roundMoney(alreadyPaid + appliedUsd);
        const nextBalance = roundMoney(Math.max(passTotal - nextPaid, 0));

        return {
          ...withGuideStatus,
          pass_paid_usd_amount: nextPaid,
          pass_payment_status: nextBalance <= 0.01 ? "pagado" as const : nextPaid > 0 ? "parcial" as const : "pendiente" as const,
          pass_paid_at: nextPaid > 0 ? nowIso() : shipment.pass_paid_at ?? null,
          pass_payment_id: nextPaid > 0 ? payment.id : shipment.pass_payment_id ?? null,
        };
      });
      const nextSpecialMovements = (operation.special_movements ?? []).map((movement) => {
        const shouldClose = input.note?.includes(movement.id);
        return shouldClose ? { ...movement, status: "reintegrado" as const, updated_at: nowIso() } : movement;
      });
      return recalculateOperation({
        ...operation,
        operation_shipments: nextShipments,
        operation_payments: [...operation.operation_payments, { ...payment, selected_pass_ids: selectedPassIds }],
        special_movements: nextSpecialMovements,
      });
    });
    const updated = operations.find((item) => item.id === input.operation_id) ?? null;
    const paymentSaved = updated?.operation_payments.at(-1) ?? null;
    writeDemoData(updated ? appendEvent({ ...data, operations }, makeEvent(updated, {
      action: "payment_created",
      action_label: "Registró cobro",
      to_status: updated.logistics_status,
      note: paymentSaved ? `${paymentSaved.concept} · ${paymentSaved.currency} ${paymentSaved.amount}` : "Cobro registrado",
    })) : { ...data, operations });
    return paymentSaved;
  }

  const supabase = createSupabaseBrowserClient();
  const actorId = await getActorId();
  const { data, error } = await supabase
    .from("operation_payments")
    .insert({
      operation_id: input.operation_id,
      concept: input.concept.trim(),
      method: input.method,
      currency: input.currency,
      amount: input.amount,
      note: cleanText([input.note, input.selectedPassIds?.length ? `Pases seleccionados: ${input.selectedPassIds.join(", ")}` : ""].filter(Boolean).join(" | ")),
      created_by: actorId,
    })
    .select("*")
    .single();

  requireNoError(error, "No se pudo cargar el pago.");

  if (input.markGuideReimbursed) {
    await supabase
      .from("operation_shipments")
      .update({ guide_payment_status: "reintegrada" })
      .eq("operation_id", input.operation_id)
      .eq("guide_payment_status", "pendiente_reintegro");
  }

  await recordAudit("payment_created", "operation", input.operation_id, data as Json);
  return data;
}

export async function createSpecialMovement(input: SpecialMovementInput) {
  if (!input.operation_id) throw new Error("Selecciona una operación.");
  if (!input.provider_name.trim()) throw new Error("El proveedor o tienda es obligatorio.");
  if (!input.amount || input.amount <= 0) throw new Error("El monto debe ser mayor a cero.");

  if (isDemoMode()) {
    const data = readDemoData();
    const movement = {
      id: makeId("demo-special"),
      operation_id: input.operation_id,
      client_id: input.client_id,
      type: input.type,
      status: input.status,
      provider_name: input.provider_name.trim(),
      amount: Number(input.amount || 0),
      currency: input.currency,
      money_source: input.money_source,
      note: cleanText(input.note ?? ""),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    const operations = data.operations.map((operation) => operation.id === input.operation_id
      ? recalculateOperation({ ...operation, special_movements: [...(operation.special_movements ?? []), movement] })
      : operation);
    const updated = operations.find((item) => item.id === input.operation_id) ?? null;
    writeDemoData(updated ? appendEvent({ ...data, operations }, makeEvent(updated, {
      action: "special_movement_created",
      action_label: "Registró movimiento",
      to_status: updated.logistics_status,
      note: `${movement.provider_name} · ${movement.currency} ${movement.amount}`,
    })) : { ...data, operations });
    return movement;
  }

  await recordAudit("special_movement_created", "operation", input.operation_id, input as unknown as Json);
  return {
    id: makeId("local-special"),
    operation_id: input.operation_id,
    client_id: input.client_id,
    type: input.type,
    status: input.status,
    provider_name: input.provider_name.trim(),
    amount: Number(input.amount || 0),
    currency: input.currency,
    money_source: input.money_source,
    note: cleanText(input.note ?? ""),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
}
