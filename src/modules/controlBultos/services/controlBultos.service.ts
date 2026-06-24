import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { Json } from "@/infrastructure/supabase/types";
import { isDemoMode } from "@/shared/lib/demoMode";
import type {
  ClientQuickInput,
  ControlBultosData,
  ControlClient,
  ControlOperation,
  OperationFormInput,
  PaymentInput,
  ShipmentInput,
} from "../types";

const operationSelect = `
  *,
  clients(id, name, phone, default_price_per_package, private_code),
  operation_shipments(*),
  operation_payments(*)
`;

const demoStorageKey = "custodia360:control-bultos-demo:v2";

function requireNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function cleanText(value: string) {
  return value.trim() || null;
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

function roundMoney(value: number) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function normalizeOperation(operation: ControlOperation): ControlOperation {
  return {
    ...operation,
    operation_shipments: operation.operation_shipments ?? [],
    operation_payments: operation.operation_payments ?? [],
  };
}

function recalculateOperation(operation: ControlOperation): ControlOperation {
  const normalized = normalizeOperation(operation);
  const totalPackages = roundMoney(Number(normalized.package_count || 0) * Number(normalized.price_per_package || 0));
  const guideToCharge = normalized.operation_shipments.reduce((sum, shipment) => {
    if (shipment.guide_payment_status === "pagada_por_cliente") return sum;
    return sum + Number(shipment.guide_amount || 0);
  }, 0);
  const passAmount = Number(normalized.pass_amount || 0);
  const paidArs = normalized.operation_payments.reduce((sum, payment) => payment.currency === "ARS" ? sum + Number(payment.amount || 0) : sum, 0);
  const paidUsd = normalized.operation_payments.reduce((sum, payment) => payment.currency === "USD" ? sum + Number(payment.amount || 0) : sum, 0);
  const totalAmount = roundMoney(totalPackages + guideToCharge + passAmount);
  const balance = roundMoney(Math.max(totalAmount - paidArs, 0));

  return {
    ...normalized,
    total_packages_amount: totalPackages,
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
  const clients: ControlClient[] = [
    {
      id: "demo-client-luciano",
      name: "Luciano",
      phone: "+54 9 236 555-0101",
      email: null,
      default_price_per_package: 10000,
      notes: "Cliente demo con varios locales.",
      private_code: "CLI-LUCIANO-DEMO",
      active: true,
      created_at: created,
      updated_at: created,
    },
    {
      id: "demo-client-orlando",
      name: "Orlando",
      phone: "+54 9 236 555-0202",
      email: null,
      default_price_per_package: 12000,
      notes: "Cliente demo con reintegro de guia.",
      private_code: "CLI-ORLANDO-DEMO",
      active: true,
      created_at: created,
      updated_at: created,
    },
    {
      id: "demo-client-nabil",
      name: "Nabil",
      phone: "+54 9 236 555-0303",
      email: null,
      default_price_per_package: 9000,
      notes: "Cliente demo pendiente de despacho.",
      private_code: "CLI-NABIL-DEMO",
      active: true,
      created_at: created,
      updated_at: created,
    },
  ];

  const operations: ControlOperation[] = [
    recalculateOperation({
      id: "demo-op-1",
      client_id: "demo-client-luciano",
      serial_number: 1,
      operation_date: todayIso(),
      provider_name: "Flytec",
      package_count: 3,
      price_per_package: 10000,
      total_packages_amount: 30000,
      logistics_status: "paso",
      financial_status: "pendiente",
      note: "Retirar con comprobante. Mostrar al cliente como ejemplo.",
      pass_amount: 5000,
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: true,
      public_code: "DEMO-LUCIANO",
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: created,
      updated_at: created,
      clients: { id: "demo-client-luciano", name: "Luciano", phone: "+54 9 236 555-0101", default_price_per_package: 10000, private_code: "CLI-LUCIANO-DEMO" },
      operation_shipments: [{
        id: "demo-ship-1",
        operation_id: "demo-op-1",
        company: "Crucero Express",
        guide_number: "GUI-DEMO-001",
        guide_amount: 18000,
        guide_paid_by: "jeremias",
        guide_payment_status: "pendiente_reintegro",
        guide_payment_method: "efectivo_pesos",
        guide_payment_currency: "ARS",
        guide_paid_amount: 18000,
        dispatch_date: null,
        created_at: created,
        updated_at: created,
      }],
      operation_payments: [{
        id: "demo-pay-1",
        operation_id: "demo-op-1",
        concept: "Adelanto en pesos",
        method: "transferencia_1",
        currency: "ARS",
        amount: 20000,
        paid_at: created,
        note: "Transferencia inicial demo.",
        created_by: "demo-owner",
        created_at: created,
      }],
    }),
    recalculateOperation({
      id: "demo-op-2",
      client_id: "demo-client-orlando",
      serial_number: 2,
      operation_date: todayIso(),
      provider_name: "Alpes",
      package_count: 2,
      price_per_package: 12000,
      total_packages_amount: 24000,
      logistics_status: "despachado",
      financial_status: "pendiente",
      note: "Guia abonada por cliente antes del despacho.",
      pass_amount: 0,
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: true,
      public_code: "DEMO-ORLANDO",
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: created,
      updated_at: created,
      clients: { id: "demo-client-orlando", name: "Orlando", phone: "+54 9 236 555-0202", default_price_per_package: 12000, private_code: "CLI-ORLANDO-DEMO" },
      operation_shipments: [{
        id: "demo-ship-2",
        operation_id: "demo-op-2",
        company: "Buspack Aldea",
        guide_number: "GUI-DEMO-002",
        guide_amount: 15000,
        guide_paid_by: "cliente",
        guide_payment_status: "pagada_por_cliente",
        guide_payment_method: "transferencia_2",
        guide_payment_currency: "ARS",
        guide_paid_amount: 15000,
        dispatch_date: todayIso(),
        created_at: created,
        updated_at: created,
      }],
      operation_payments: [{
        id: "demo-pay-2",
        operation_id: "demo-op-2",
        concept: "Pago total bultos",
        method: "efectivo_dolares",
        currency: "USD",
        amount: 20,
        paid_at: created,
        note: "Demo pago en dolares separado.",
        created_by: "demo-owner",
        created_at: created,
      }],
    }),
    recalculateOperation({
      id: "demo-op-3",
      client_id: "demo-client-nabil",
      serial_number: 3,
      operation_date: todayIso(),
      provider_name: "Felipe",
      package_count: 4,
      price_per_package: 9000,
      total_packages_amount: 36000,
      logistics_status: "para_retirar",
      financial_status: "pendiente",
      note: "Pedido pendiente para mostrar cambio de estado.",
      pass_amount: 4000,
      total_amount: 0,
      paid_amount_ars: 0,
      paid_amount_usd: 0,
      balance_amount: 0,
      visible_to_client: true,
      public_code: "DEMO-NABIL",
      created_by: "demo-owner",
      updated_by: "demo-owner",
      created_at: created,
      updated_at: created,
      clients: { id: "demo-client-nabil", name: "Nabil", phone: "+54 9 236 555-0303", default_price_per_package: 9000, private_code: "CLI-NABIL-DEMO" },
      operation_shipments: [],
      operation_payments: [],
    }),
  ];

  return { clients, operations };
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
  }));
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
  const [clientsResult, operationsResult] = await Promise.all([
    supabase.from("clients").select("*").eq("active", true).order("name", { ascending: true }),
    supabase.from("operations").select(operationSelect).order("operation_date", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  requireNoError(clientsResult.error, "No se pudieron cargar clientes.");
  requireNoError(operationsResult.error, "No se pudieron cargar operaciones.");

  return {
    clients: (clientsResult.data ?? []) as ControlClient[],
    operations: ((operationsResult.data ?? []) as unknown as ControlOperation[]).map(normalizeOperation),
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
      default_price_per_package: Number(input.default_price_per_package || 0),
      notes: cleanText(input.notes ?? ""),
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
      default_price_per_package: input.default_price_per_package,
      notes: cleanText(input.notes ?? ""),
    })
    .select("*")
    .single();

  requireNoError(error, "No se pudo crear el cliente.");
  await recordAudit("client_created", "client", data?.id ?? null, data as Json);
  return data as ControlClient;
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
    });
    writeDemoData({ ...data, operations: [operation, ...data.operations] });
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
    writeDemoData({ ...data, operations });
    return operations.find((item) => item.id === operationId) ?? null;
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
  await recordAudit("operation_updated", "operation", operationId, data as Json, before as Json);
  return normalizeOperation(data as unknown as ControlOperation);
}

export async function updateLogisticsStatus(operationId: string, logisticsStatus: OperationFormInput["logistics_status"]) {
  if (isDemoMode()) {
    const data = readDemoData();
    const operations = data.operations.map((operation) => operation.id === operationId ? recalculateOperation({ ...operation, logistics_status: logisticsStatus, updated_by: "demo-owner" }) : operation);
    writeDemoData({ ...data, operations });
    return operations.find((item) => item.id === operationId) ?? null;
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
      const existing = operation.operation_shipments[0];
      const shipment = {
        id: existing?.id ?? makeId("demo-ship"),
        operation_id: input.operation_id,
        company: cleanText(input.company),
        guide_number: cleanText(input.guide_number),
        guide_amount: Number(input.guide_amount || 0),
        guide_paid_by: input.paid ? input.guide_paid_by : "pendiente" as const,
        guide_payment_status: input.paid ? input.guide_payment_status : "pendiente" as const,
        guide_payment_method: input.paid ? input.method ?? null : null,
        guide_payment_currency: input.paid ? input.currency ?? null : null,
        guide_paid_amount: input.paid ? Number(input.amount || 0) : 0,
        dispatch_date: input.dispatch_date,
        created_at: existing?.created_at ?? nowIso(),
        updated_at: nowIso(),
      };
      return recalculateOperation({ ...operation, operation_shipments: [shipment] });
    });
    writeDemoData({ ...data, operations });
    return operations.find((item) => item.id === input.operation_id)?.operation_shipments[0] ?? null;
  }

  const supabase = createSupabaseBrowserClient();
  const { data: existing } = await supabase
    .from("operation_shipments")
    .select("*")
    .eq("operation_id", input.operation_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const payload = {
    operation_id: input.operation_id,
    company: cleanText(input.company),
    guide_number: cleanText(input.guide_number),
    guide_amount: input.guide_amount,
    guide_paid_by: input.paid ? input.guide_paid_by : "pendiente",
    guide_payment_status: input.paid ? input.guide_payment_status : "pendiente",
    guide_payment_method: input.paid ? input.method ?? null : null,
    guide_payment_currency: input.paid ? input.currency ?? null : null,
    guide_paid_amount: input.paid ? input.amount ?? 0 : 0,
    dispatch_date: input.dispatch_date,
  };

  const query = existing
    ? supabase.from("operation_shipments").update(payload).eq("id", existing.id).select("*").single()
    : supabase.from("operation_shipments").insert(payload).select("*").single();

  const { data, error } = await query;
  requireNoError(error, "No se pudo guardar la guia.");
  await recordAudit("shipment_saved", "operation", input.operation_id, data as Json, existing as Json);
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
      const nextShipments = input.markGuideReimbursed
        ? operation.operation_shipments.map((shipment) => shipment.guide_payment_status === "pendiente_reintegro" ? { ...shipment, guide_payment_status: "reintegrada" as const } : shipment)
        : operation.operation_shipments;
      return recalculateOperation({ ...operation, operation_shipments: nextShipments, operation_payments: [...operation.operation_payments, payment] });
    });
    writeDemoData({ ...data, operations });
    return operations.find((item) => item.id === input.operation_id)?.operation_payments.at(-1) ?? null;
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
      note: cleanText(input.note ?? ""),
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
