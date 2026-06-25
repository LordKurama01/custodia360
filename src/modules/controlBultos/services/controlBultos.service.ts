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
  SpecialMovementInput,
} from "../types";
import { DEFAULT_DOLLAR_RATE, calculateGuideCharge, isViaCargo } from "../types";

const operationSelect = `
  *,
  clients(id, name, phone, default_price_per_package, private_code),
  operation_shipments(*),
  operation_payments(*)
`;

const demoStorageKey = "custodia360:control-bultos-demo:v6";

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
      private_code: "CLI-ESTELA-DEMO",
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
      private_code: "CLI-MATIAS-DEMO",
      active: true,
      created_at: created,
      updated_at: created,
    },
  ];

  const estelaClient = { id: "demo-client-estela", name: "Estela", phone: "+54 9 236 555-0101", default_price_per_package: 0, private_code: "CLI-ESTELA-DEMO" };
  const matiasClient = { id: "demo-client-matias", name: "Matías", phone: "+54 9 236 555-0202", default_price_per_package: 0, private_code: "CLI-MATIAS-DEMO" };

  const operations: ControlOperation[] = [
    recalculateOperation({
      id: "demo-op-estela-telefonos",
      client_id: "demo-client-estela",
      serial_number: 1,
      operation_date: today,
      provider_name: "Génesis / compra 5 teléfonos",
      package_count: 5,
      price_per_package: 0,
      total_packages_amount: 0,
      logistics_status: "despachado",
      financial_status: "pendiente",
      note: "Operación con cinco destinos. Estela paga; cada guía identifica un pedido/envío para un destinatario diferente.",
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
      provider_name: "Compras varias / pases pendientes",
      package_count: 3,
      price_per_package: 0,
      total_packages_amount: 0,
      logistics_status: "deposito_a",
      financial_status: "pendiente",
      note: "Pases variables: USD 80 + USD 150 + USD 200. El equivalente en pesos se actualiza con el dólar del día.",
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
      special_movements: [],
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
    writeDemoData({ ...data, operations });
    return operations.find((item) => item.id === input.operation_id)?.operation_shipments.at(-1) ?? null;
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
      const nextShipments = operation.operation_shipments.map((shipment) => {
        const withGuideStatus = input.markGuideReimbursed && shipment.guide_payment_status === "pendiente_reintegro"
          ? { ...shipment, guide_payment_status: "reintegrada" as const }
          : shipment;
        if (selectedPassIds.includes(shipment.id)) {
          return {
            ...withGuideStatus,
            pass_payment_status: "pagado" as const,
            pass_paid_at: nowIso(),
            pass_payment_id: payment.id,
          };
        }
        return withGuideStatus;
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
    writeDemoData({ ...data, operations });
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
