"use client";

import { useEffect, useMemo, useState } from "react";
import { canCreatePayments, canEditOperations, canViewFinancials } from "@/infrastructure/auth/permissions";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import { demoProfile, isDemoMode } from "@/shared/lib/demoMode";
import type { Currency, GuidePaidBy, GuidePaymentStatus, LogisticsStatus, PaymentMethod, ProfileRow } from "@/infrastructure/supabase/types";
import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Field, Input, Select, Textarea } from "@/shared/components/Fields";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { calculateOperationDraftTotal, calculateOperationTotals, toNumber } from "../lib/calculations";
import {
  createOperation,
  createPayment,
  createQuickClient,
  createSpecialMovement,
  getControlBultosData,
  saveShipment,
  updateLogisticsStatus,
  updateOperation,
} from "../services/controlBultos.service";
import type {
  ClientQuickInput,
  ControlBultosData,
  ControlOperation,
  ControlShipment,
  OperationFormInput,
  PaymentInput,
  ShipmentInput,
  SpecialMovement,
  SpecialMovementInput,
} from "../types";
import {
  DEFAULT_DOLLAR_RATE,
  calculateGuideCharge,
  clientLogisticsLabels,
  financialLabels,
  financialStatusOptions,
  guidePaymentLabels,
  logisticsLabels,
  logisticsStatusOptions,
  paymentMethodLabels,
  paymentMethodOptions,
  transportCompanyOptions,
} from "../types";
import styles from "./ControlBultosView.module.css";

const today = () => new Date().toISOString().slice(0, 10);
const accountOpenStatuses = new Set(["pendiente", "pagado_proveedor", "a_devolver", "mercaderia_agotada"]);

type MainTab = "seguimiento" | "cuentas" | "guias" | "mas";
type QuickPanel = "cliente" | "operacion" | "guia" | "pago" | "especial" | null;

type AccountPass = {
  id: string;
  operationId: string;
  operationCode: string;
  provider: string;
  guideNumber: string;
  company: string;
  recipient: string;
  amountUsd: number;
  status: "pendiente" | "pagado" | "parcial" | "anulado";
  date?: string | null;
};

type ClientAccount = {
  clientId: string;
  clientName: string;
  phone: string | null;
  operations: ControlOperation[];
  pendingPasses: AccountPass[];
  paidPasses: AccountPass[];
  guideReimbursements: Array<{ id: string; operationCode: string; guideNumber: string; company: string; amountArs: number }>;
  specialPending: SpecialMovement[];
  payments: ControlOperation["operation_payments"];
  passUsdPending: number;
  guideArsPending: number;
  specialArsPending: number;
};

const emptyClientForm: ClientQuickInput = {
  name: "",
  phone: "",
  email: "",
  default_price_per_package: 0,
  notes: "",
};

function emptyOperationForm(clientId = "", price = 0): OperationFormInput {
  return {
    client_id: clientId,
    operation_date: today(),
    provider_name: "",
    package_count: 1,
    price_per_package: price,
    logistics_status: "para_retirar",
    note: "",
    pass_amount: 0,
    visible_to_client: true,
  };
}

function emptyShipmentForm(operationId = ""): ShipmentInput {
  return {
    operation_id: operationId,
    company: "",
    guide_number: "",
    guide_amount: 0,
    dispatch_date: null,
    paid: false,
    guide_paid_by: "pendiente",
    guide_payment_status: "pendiente",
    method: "efectivo_pesos",
    currency: "ARS",
    amount: 0,
    pass_usd_amount: 0,
    pass_date: today(),
    pass_note: "",
  };
}

function emptyPaymentForm(operationId = ""): PaymentInput {
  return {
    operation_id: operationId,
    concept: "Pago de cuenta corriente",
    method: "efectivo_pesos",
    currency: "ARS",
    amount: 0,
    note: "",
    markGuideReimbursed: false,
    selectedPassIds: [],
    dollarRate: DEFAULT_DOLLAR_RATE,
  };
}

function emptySpecialMovementForm(operation?: ControlOperation | null): SpecialMovementInput {
  return {
    operation_id: operation?.id ?? "",
    client_id: operation?.client_id ?? "",
    type: "adelanto_jeremias",
    status: "pendiente",
    provider_name: "",
    amount: 0,
    currency: "ARS",
    money_source: "jeremias_adelanto",
    note: "",
  };
}

function moneyUsd(value: number) {
  return `USD ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}`;
}

function statusClass(status: LogisticsStatus | GuidePaymentStatus | string) {
  if (["despachado", "pago_total", "reintegrada", "pagada_por_cliente", "pagado", "cerrado", "reintegrado"].includes(status)) return styles.ok;
  if (["pendiente_reintegro", "pendiente", "para_retirar", "pagada_por_jeremias"].includes(status)) return styles.warn;
  if (["retirado", "cd", "deposito_a", "deposito_b", "pago_parcial", "parcial", "pagado_proveedor"].includes(status)) return styles.info;
  return styles.neutral;
}

function guideNumbers(operation: ControlOperation) {
  if (!operation.operation_shipments.length) return "Sin guías";
  const list = operation.operation_shipments.map((shipment) => shipment.guide_number || "Sin número");
  return list.length > 2 ? `${list.slice(0, 2).join(", ")} +${list.length - 2}` : list.join(", ");
}

function guideChargeLabel(company: string | null | undefined, amount: number) {
  const charge = calculateGuideCharge(company, amount);
  if ((company ?? "").toLowerCase().includes("vía cargo") || (company ?? "").toLowerCase().includes("via cargo")) {
    return `${formatMoney(charge)} incl. 2%`;
  }
  return formatMoney(charge);
}

function shipmentPassStatus(shipment: ControlShipment): AccountPass["status"] {
  if (shipment.pass_payment_status === "pagado") return "pagado";
  if (shipment.pass_payment_status === "parcial") return "parcial";
  if (shipment.pass_payment_status === "anulado") return "anulado";
  return "pendiente";
}

function movementLabel(movement: SpecialMovement) {
  const labels: Record<SpecialMovement["type"], string> = {
    pago_proveedor: "Pago a proveedor",
    adelanto_jeremias: "Adelanto Jeremías",
    dinero_recibido: "Dinero recibido",
    mercaderia_agotada: "Mercadería agotada",
    devolucion: "Devolución",
    aplicado_otra_compra: "Aplicado a otra compra",
  };
  return labels[movement.type] ?? "Movimiento especial";
}

function createPassItem(operation: ControlOperation, shipment: ControlShipment): AccountPass | null {
  const amountUsd = toNumber(shipment.pass_usd_amount);
  if (amountUsd <= 0) return null;
  return {
    id: shipment.id,
    operationId: operation.id,
    operationCode: operation.public_code,
    provider: operation.provider_name,
    guideNumber: shipment.guide_number ?? "Sin guía",
    company: shipment.company ?? "Sin empresa",
    recipient: shipment.recipient_name ?? operation.clients?.name ?? "Cliente",
    amountUsd,
    status: shipmentPassStatus(shipment),
    date: shipment.pass_date,
  };
}

function buildClientAccounts(operations: ControlOperation[]): ClientAccount[] {
  const map = new Map<string, ClientAccount>();

  operations.forEach((operation) => {
    const clientId = operation.client_id;
    const account = map.get(clientId) ?? {
      clientId,
      clientName: operation.clients?.name ?? "Sin cliente",
      phone: operation.clients?.phone ?? null,
      operations: [],
      pendingPasses: [],
      paidPasses: [],
      guideReimbursements: [],
      specialPending: [],
      payments: [],
      passUsdPending: 0,
      guideArsPending: 0,
      specialArsPending: 0,
    };

    account.operations.push(operation);
    account.payments.push(...operation.operation_payments);

    operation.operation_shipments.forEach((shipment) => {
      const pass = createPassItem(operation, shipment);
      if (pass) {
        if (pass.status === "pagado") account.paidPasses.push(pass);
        if (pass.status !== "pagado" && pass.status !== "anulado") account.pendingPasses.push(pass);
      }

      if (["pagada_por_jeremias", "pendiente_reintegro"].includes(shipment.guide_payment_status)) {
        const amountArs = calculateGuideCharge(shipment.company, toNumber(shipment.guide_amount));
        account.guideReimbursements.push({
          id: shipment.id,
          operationCode: operation.public_code,
          guideNumber: shipment.guide_number ?? "Sin guía",
          company: shipment.company ?? "Sin empresa",
          amountArs,
        });
      }
    });

    (operation.special_movements ?? []).forEach((movement) => {
      if (accountOpenStatuses.has(movement.status)) account.specialPending.push(movement);
    });

    map.set(clientId, account);
  });

  return Array.from(map.values()).map((account) => ({
    ...account,
    passUsdPending: account.pendingPasses.reduce((sum, item) => sum + item.amountUsd, 0),
    guideArsPending: account.guideReimbursements.reduce((sum, item) => sum + item.amountArs, 0),
    specialArsPending: account.specialPending.reduce((sum, item) => item.currency === "ARS" ? sum + item.amount : sum, 0),
    payments: account.payments.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()),
  })).sort((a, b) => (b.passUsdPending + b.guideArsPending / DEFAULT_DOLLAR_RATE + b.specialArsPending / DEFAULT_DOLLAR_RATE) - (a.passUsdPending + a.guideArsPending / DEFAULT_DOLLAR_RATE + a.specialArsPending / DEFAULT_DOLLAR_RATE));
}

function buildAccountWhatsApp(account: ClientAccount) {
  const lines = [
    `Hola ${account.clientName}, te paso tu resumen actualizado.`,
    "",
    `Dólar tomado hoy: $${DEFAULT_DOLLAR_RATE}`,
    "",
    "Pases pendientes:",
    ...(account.pendingPasses.length ? account.pendingPasses.map((item) => `- ${item.guideNumber} · ${item.company} · ${moneyUsd(item.amountUsd)} · hoy ${formatMoney(item.amountUsd * DEFAULT_DOLLAR_RATE)}`) : ["- Sin pases pendientes"]),
    "",
    `Total pases pendientes: ${moneyUsd(account.passUsdPending)}`,
    `Equivalente hoy: ${formatMoney(account.passUsdPending * DEFAULT_DOLLAR_RATE)}`,
  ];

  if (account.guideReimbursements.length) {
    lines.push("", "Guías a reintegrar:", ...account.guideReimbursements.map((item) => `- ${item.guideNumber} · ${item.company} · ${formatMoney(item.amountArs)}`), `Total guías: ${formatMoney(account.guideArsPending)}`);
  }

  if (account.specialPending.length) {
    lines.push("", "Movimientos especiales:", ...account.specialPending.map((item) => `- ${movementLabel(item)} · ${item.provider_name} · ${item.currency === "ARS" ? formatMoney(item.amount) : moneyUsd(item.amount)} · estado ${item.status.replaceAll("_", " ")}`));
  }

  lines.push("", `Total adicional ARS: ${formatMoney(account.guideArsPending + account.specialArsPending)}`, "Aclaración: el equivalente en pesos puede variar según el dólar al momento del pago.");
  return lines.join("\n");
}

export function ControlBultosView() {
  const [data, setData] = useState<ControlBultosData>({ clients: [], operations: [] });
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<MainTab>("seguimiento");
  const [quickPanel, setQuickPanel] = useState<QuickPanel>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedPassIds, setSelectedPassIds] = useState<string[]>([]);
  const [clientForm, setClientForm] = useState<ClientQuickInput>(emptyClientForm);
  const [operationForm, setOperationForm] = useState<OperationFormInput>(emptyOperationForm());
  const [shipmentOperation, setShipmentOperation] = useState<ControlOperation | null>(null);
  const [shipmentForm, setShipmentForm] = useState<ShipmentInput>(emptyShipmentForm());
  const [paymentOperation, setPaymentOperation] = useState<ControlOperation | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentInput>(emptyPaymentForm());
  const [specialOperation, setSpecialOperation] = useState<ControlOperation | null>(null);
  const [specialForm, setSpecialForm] = useState<SpecialMovementInput>(emptySpecialMovementForm());
  const [detailOperation, setDetailOperation] = useState<ControlOperation | null>(null);
  const [filters, setFilters] = useState({ query: "", logistics_status: "", financial_status: "" });

  const demoMode = isDemoMode();
  const canEdit = canEditOperations(profile?.role);
  const canCollect = canCreatePayments(profile?.role);
  const canSeeMoney = canViewFinancials(profile?.role);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (isDemoMode()) {
        setProfile(demoProfile);
      } else {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
          setProfile(profileData as ProfileRow | null);
        }
      }
      const loaded = await getControlBultosData();
      setData(loaded);
      const firstClient = loaded.clients[0];
      if (!operationForm.client_id && firstClient) setOperationForm(emptyOperationForm(firstClient.id, toNumber(firstClient.default_price_per_package)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Control de Bultos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "cuentas") setActiveTab("cuentas");
      if (hash === "guias") setActiveTab("guias");
      if (hash === "mas") setActiveTab("mas");
      if (hash === "seguimiento" || !hash) setActiveTab("seguimiento");
      if (hash === "nueva") openQuickPanel("operacion");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.clients.length]);

  const filteredOperations = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return data.operations.filter((operation) => {
      const shipmentText = operation.operation_shipments.map((shipment) => [shipment.company, shipment.guide_number, shipment.recipient_name, shipment.recipient_identity_number].join(" ")).join(" ");
      const specialText = (operation.special_movements ?? []).map((movement) => [movement.provider_name, movement.note].join(" ")).join(" ");
      const haystack = [operation.public_code, operation.clients?.name, operation.clients?.phone, operation.provider_name, shipmentText, specialText, operation.note].join(" ").toLowerCase();
      return (!query || haystack.includes(query))
        && (!filters.logistics_status || operation.logistics_status === filters.logistics_status)
        && (!filters.financial_status || operation.financial_status === filters.financial_status);
    });
  }, [data.operations, filters]);

  const accounts = useMemo(() => buildClientAccounts(data.operations), [data.operations]);
  const selectedAccount = accounts.find((account) => account.clientId === selectedAccountId) ?? accounts[0] ?? null;

  const kpis = useMemo(() => {
    return accounts.reduce((acc, account) => {
      acc.passUsd += account.passUsdPending;
      acc.guideArs += account.guideArsPending;
      acc.specialArs += account.specialArsPending;
      acc.pendingPasses += account.pendingPasses.length;
      return acc;
    }, { passUsd: 0, guideArs: 0, specialArs: 0, pendingPasses: 0 });
  }, [accounts]);

  const selectedClient = data.clients.find((client) => client.id === operationForm.client_id);
  const draftTotal = calculateOperationDraftTotal(operationForm);
  const paymentPassOptions = paymentOperation ? paymentOperation.operation_shipments.map((shipment) => createPassItem(paymentOperation, shipment)).filter((item): item is AccountPass => !!item && item.status !== "pagado" && item.status !== "anulado") : [];
  const selectedPassTotalUsd = paymentPassOptions.filter((item) => selectedPassIds.includes(item.id)).reduce((sum, item) => sum + item.amountUsd, 0);
  const selectedPassTotalArs = selectedPassTotalUsd * DEFAULT_DOLLAR_RATE;

  const openQuickPanel = (panel: QuickPanel) => {
    setQuickPanel(panel);
    if (panel === "cliente") setClientForm(emptyClientForm);
    if (panel === "operacion") {
      const firstClient = data.clients[0];
      setEditingId(null);
      setOperationForm(emptyOperationForm(firstClient?.id ?? "", toNumber(firstClient?.default_price_per_package)));
    }
  };

  const submitClient = async () => {
    if (!clientForm.name.trim()) return setError("El nombre del cliente es obligatorio.");
    setSaving(true);
    setError("");
    try {
      const client = await createQuickClient(clientForm);
      setMessage(`Cliente creado: ${client.name}`);
      setQuickPanel(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear el cliente.");
    } finally {
      setSaving(false);
    }
  };

  const submitOperation = async () => {
    if (!canEdit) return setError("Tu rol no permite crear o editar operaciones.");
    if (!operationForm.client_id) return setError("Selecciona un cliente.");
    if (!operationForm.provider_name.trim()) return setError("El local/proveedor es obligatorio.");
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateOperation(editingId, operationForm);
        setMessage("Operación actualizada.");
      } else {
        await createOperation(operationForm);
        setMessage("Operación creada.");
      }
      setEditingId(null);
      setQuickPanel(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la operación.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (operation: ControlOperation) => {
    setEditingId(operation.id);
    setOperationForm({
      client_id: operation.client_id,
      operation_date: operation.operation_date,
      provider_name: operation.provider_name,
      package_count: operation.package_count,
      price_per_package: toNumber(operation.price_per_package),
      logistics_status: operation.logistics_status,
      note: operation.note ?? "",
      pass_amount: toNumber(operation.pass_amount),
      visible_to_client: operation.visible_to_client,
    });
    setQuickPanel("operacion");
  };

  const startShipment = (operation: ControlOperation) => {
    setShipmentOperation(operation);
    setShipmentForm(emptyShipmentForm(operation.id));
    setQuickPanel("guia");
  };

  const startPayment = (operation: ControlOperation) => {
    setPaymentOperation(operation);
    const form = emptyPaymentForm(operation.id);
    setPaymentForm(form);
    setSelectedPassIds([]);
    setQuickPanel("pago");
  };

  const startSpecial = (operation: ControlOperation) => {
    setSpecialOperation(operation);
    setSpecialForm(emptySpecialMovementForm(operation));
    setQuickPanel("especial");
  };

  const submitShipment = async () => {
    if (!shipmentOperation) return;
    if (!canEdit) return setError("Tu rol no permite cargar guías.");
    setSaving(true);
    setError("");
    try {
      await saveShipment(shipmentForm);
      setMessage("Guía guardada.");
      setShipmentOperation(null);
      setQuickPanel(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la guía.");
    } finally {
      setSaving(false);
    }
  };

  const syncPaymentAmount = (ids: string[], currency = paymentForm.currency) => {
    const usd = paymentPassOptions.filter((item) => ids.includes(item.id)).reduce((sum, item) => sum + item.amountUsd, 0);
    const amount = currency === "USD" ? usd : usd * DEFAULT_DOLLAR_RATE;
    setPaymentForm((current) => ({ ...current, selectedPassIds: ids, currency, amount: amount || current.amount }));
  };

  const submitPayment = async () => {
    if (!paymentOperation) return;
    if (!canCollect) return setError("Tu rol no permite cargar pagos.");
    const amount = paymentForm.amount || (paymentForm.currency === "USD" ? selectedPassTotalUsd : selectedPassTotalArs);
    if (!amount || amount <= 0) return setError("El monto debe ser mayor a cero.");
    setSaving(true);
    setError("");
    try {
      await createPayment({
        ...paymentForm,
        amount,
        selectedPassIds,
        dollarRate: DEFAULT_DOLLAR_RATE,
        note: [paymentForm.note, selectedPassIds.length ? `Pases cancelados: ${selectedPassIds.join(", ")}` : ""].filter(Boolean).join(" | "),
      });
      setMessage(selectedPassIds.length ? `Pago cargado. Pases cancelados: ${selectedPassIds.length}.` : "Pago cargado.");
      setPaymentOperation(null);
      setQuickPanel(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cargar el pago.");
    } finally {
      setSaving(false);
    }
  };

  const submitSpecialMovement = async () => {
    if (!specialOperation) return;
    if (!canEdit) return setError("Tu rol no permite cargar movimientos especiales.");
    setSaving(true);
    setError("");
    try {
      await createSpecialMovement(specialForm);
      setMessage("Movimiento especial cargado.");
      setSpecialOperation(null);
      setQuickPanel(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cargar el movimiento especial.");
    } finally {
      setSaving(false);
    }
  };

  const copyClientLink = async (operation: ControlOperation) => {
    await navigator.clipboard.writeText(`${window.location.origin}/consulta/${operation.public_code}`);
    setMessage("Link de consulta copiado.");
  };

  const copyWhatsAppOperation = async (operation: ControlOperation) => {
    const account = accounts.find((item) => item.clientId === operation.client_id);
    if (!account) return;
    await navigator.clipboard.writeText(buildAccountWhatsApp(account));
    setMessage("Resumen de cuenta corriente copiado.");
  };

  const copyWhatsAppAccount = async (account: ClientAccount) => {
    await navigator.clipboard.writeText(buildAccountWhatsApp(account));
    setMessage("Resumen de cuenta corriente copiado.");
  };

  const changeStatus = async (operationId: string, value: LogisticsStatus) => {
    if (!canEdit) return setError("Tu rol no permite cambiar estados.");
    setSaving(true);
    setError("");
    try {
      await updateLogisticsStatus(operationId, value);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cambiar el estado.");
    } finally {
      setSaving(false);
    }
  };

  const onOperationClientChange = (clientId: string) => {
    const client = data.clients.find((item) => item.id === clientId);
    setOperationForm((current) => ({ ...current, client_id: clientId, price_per_package: toNumber(client?.default_price_per_package) }));
  };

  const onShipmentPaidByChange = (paidBy: GuidePaidBy) => {
    const status: GuidePaymentStatus = paidBy === "jeremias" ? "pendiente_reintegro" : paidBy === "cliente" ? "pagada_por_cliente" : "pendiente";
    setShipmentForm((current) => ({ ...current, paid: paidBy !== "pendiente", guide_paid_by: paidBy, guide_payment_status: status, amount: current.amount || current.guide_amount }));
  };

  const onPaymentMethodChange = (method: PaymentMethod, target: "payment" | "shipment") => {
    const currency = paymentMethodOptions.find((item) => item.value === method)?.currency ?? "ARS";
    if (target === "payment") {
      setPaymentForm((current) => ({ ...current, method, currency }));
      syncPaymentAmount(selectedPassIds, currency);
    }
    if (target === "shipment") setShipmentForm((current) => ({ ...current, method, currency }));
  };

  return <OwnerDesktopShell title="Seguimiento">
    <section id="seguimiento" className={styles.topBar}>
      <div>
        <p>Control de bultos + cuenta corriente</p>
        <h2>Operación del día</h2>
        <span>{demoMode ? "Demo local" : "Operación real"} · Dólar hoy ${DEFAULT_DOLLAR_RATE} · {profile?.full_name ?? profile?.email ?? "Owner"}</span>
      </div>
      <Button onClick={() => openQuickPanel("operacion")}>+ Nueva</Button>
    </section>

    {message ? <div className={styles.success}>{message}</div> : null}
    {error ? <div className={styles.error}>{error}</div> : null}

    <nav className={styles.appTabs} aria-label="Navegación operativa">
      <button className={activeTab === "seguimiento" ? styles.activeTab : ""} onClick={() => setActiveTab("seguimiento")}>Seguimiento</button>
      <button id="cuentas" className={activeTab === "cuentas" ? styles.activeTab : ""} onClick={() => setActiveTab("cuentas")}>Cuentas</button>
      <button className={styles.fabTab} onClick={() => openQuickPanel("operacion")}>+</button>
      <button id="guias" className={activeTab === "guias" ? styles.activeTab : ""} onClick={() => setActiveTab("guias")}>Guías</button>
      <button className={activeTab === "mas" ? styles.activeTab : ""} onClick={() => setActiveTab("mas")}>Más</button>
    </nav>

    <section className={styles.kpiStrip}>
      <Card className={styles.kpi}><span>Pases pendientes</span><strong>{canSeeMoney ? moneyUsd(kpis.passUsd) : "-"}</strong><small>{canSeeMoney ? formatMoney(kpis.passUsd * DEFAULT_DOLLAR_RATE) : ""}</small></Card>
      <Card className={styles.kpi}><span>Guías reintegro</span><strong>{canSeeMoney ? formatMoney(kpis.guideArs) : "-"}</strong><small>{kpis.pendingPasses} pases abiertos</small></Card>
      <Card className={styles.kpi}><span>Mov. especiales</span><strong>{canSeeMoney ? formatMoney(kpis.specialArs) : "-"}</strong><small>Proveedor / adelantos</small></Card>
    </section>

    <Card className={styles.searchCard}>
      <Input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Buscar cliente, guía, bulto o proveedor" />
      <div className={styles.filterChips}>
        <button onClick={() => setFilters({ ...filters, logistics_status: "", financial_status: "" })}>Todos</button>
        {logisticsStatusOptions.slice(0, 6).map((option) => <button key={option.value} className={filters.logistics_status === option.value ? styles.chipActive : ""} onClick={() => setFilters({ ...filters, logistics_status: option.value })}>{option.label}</button>)}
      </div>
    </Card>

    {loading ? <Card className={styles.empty}>Cargando operaciones...</Card> : null}

    {activeTab === "seguimiento" && !loading ? <section className={styles.contentGrid}>
      <div className={styles.operationList}>
        {filteredOperations.length ? filteredOperations.map((operation) => {
          const totals = calculateOperationTotals(operation);
          const account = accounts.find((item) => item.clientId === operation.client_id);
          return <article key={operation.id} className={styles.operationCard}>
            <div className={styles.operationCardHead}>
              <div>
                <strong>{operation.public_code}</strong>
                <span>{operation.clients?.name ?? "Sin cliente"} · {operation.provider_name}</span>
              </div>
              <span className={`${styles.badge} ${statusClass(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>
            </div>
            <div className={styles.cardFacts}>
              <span>{operation.package_count} bultos</span>
              <span>{operation.operation_shipments.length} guías</span>
              <span>Cliente ve: {clientLogisticsLabels[operation.logistics_status]}</span>
              <span>Cuenta: {financialLabels[operation.financial_status]}</span>
            </div>
            <div className={styles.moneyLine}>
              <div><span>Pases operación</span><strong>{moneyUsd(totals.passAmount)}</strong></div>
              <div><span>Pendiente cliente</span><strong>{canSeeMoney ? moneyUsd(account?.passUsdPending ?? 0) : "-"}</strong></div>
              <div><span>Guías</span><strong>{guideNumbers(operation)}</strong></div>
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setDetailOperation(operation)}>Ficha</Button>
              <Button variant="secondary" onClick={() => startPayment(operation)} disabled={!canCollect}>Cobrar</Button>
              <Button variant="ghost" onClick={() => startShipment(operation)} disabled={!canEdit}>Guía</Button>
              <Button variant="ghost" onClick={() => copyWhatsAppOperation(operation)}>WhatsApp</Button>
            </div>
          </article>;
        }) : <Card className={styles.empty}>No hay operaciones para estos filtros.</Card>}
      </div>
    </section> : null}

    {activeTab === "cuentas" && !loading ? <section className={styles.accountsGrid}>
      <div className={styles.accountList}>
        {accounts.map((account) => <button key={account.clientId} className={`${styles.accountRow} ${selectedAccount?.clientId === account.clientId ? styles.accountActive : ""}`} onClick={() => setSelectedAccountId(account.clientId)}>
          <span>{account.clientName}</span>
          <strong>{moneyUsd(account.passUsdPending)}</strong>
          <small>{account.pendingPasses.length} pases · {formatMoney(account.guideArsPending + account.specialArsPending)} ARS</small>
        </button>)}
      </div>
      {selectedAccount ? <Card className={styles.accountDetail}>
        <div className={styles.cardHead}>
          <div><p>Cuenta corriente</p><h3>{selectedAccount.clientName}</h3></div>
          <Button variant="secondary" onClick={() => copyWhatsAppAccount(selectedAccount)}>WhatsApp</Button>
        </div>
        <div className={styles.accountTotals}>
          <div><span>Pases pendientes</span><strong>{moneyUsd(selectedAccount.passUsdPending)}</strong><small>{formatMoney(selectedAccount.passUsdPending * DEFAULT_DOLLAR_RATE)}</small></div>
          <div><span>Guías a reintegrar</span><strong>{formatMoney(selectedAccount.guideArsPending)}</strong><small>{selectedAccount.guideReimbursements.length} guías</small></div>
          <div><span>Movimientos especiales</span><strong>{formatMoney(selectedAccount.specialArsPending)}</strong><small>{selectedAccount.specialPending.length} abiertos</small></div>
        </div>
        <div className={styles.ledger}>
          <h4>Pases abiertos</h4>
          {selectedAccount.pendingPasses.length ? selectedAccount.pendingPasses.map((item) => <div key={item.id} className={styles.ledgerItem}>
            <div><strong>{item.guideNumber}</strong><span>{item.provider} · {item.company}</span></div>
            <b>{moneyUsd(item.amountUsd)}</b>
          </div>) : <p>Sin pases pendientes.</p>}
        </div>
        {selectedAccount.guideReimbursements.length ? <div className={styles.ledger}>
          <h4>Guías a reintegrar</h4>
          {selectedAccount.guideReimbursements.map((item) => <div key={item.id} className={styles.ledgerItem}><div><strong>{item.guideNumber}</strong><span>{item.operationCode} · {item.company}</span></div><b>{formatMoney(item.amountArs)}</b></div>)}
        </div> : null}
        {selectedAccount.specialPending.length ? <div className={styles.ledger}>
          <h4>Movimientos especiales</h4>
          {selectedAccount.specialPending.map((item) => <div key={item.id} className={styles.ledgerItem}><div><strong>{movementLabel(item)}</strong><span>{item.provider_name} · {item.status.replaceAll("_", " ")}</span></div><b>{item.currency === "ARS" ? formatMoney(item.amount) : moneyUsd(item.amount)}</b></div>)}
        </div> : null}
        <div className={styles.ledger}>
          <h4>Historial de pagos</h4>
          {selectedAccount.payments.length ? selectedAccount.payments.slice(0, 6).map((payment) => <div key={payment.id} className={styles.ledgerItem}><div><strong>{formatDate(payment.paid_at)}</strong><span>{payment.concept} · {paymentMethodLabels[payment.method]}</span></div><b>{payment.currency === "ARS" ? formatMoney(payment.amount) : moneyUsd(payment.amount)}</b></div>) : <p>Sin pagos registrados.</p>}
        </div>
      </Card> : null}
    </section> : null}

    {activeTab === "guias" && !loading ? <section className={styles.guideGrid}>
      {filteredOperations.flatMap((operation) => operation.operation_shipments.map((shipment) => ({ operation, shipment }))).map(({ operation, shipment }) => <Card key={shipment.id} className={styles.guideCard}>
        <div className={styles.operationCardHead}>
          <div><strong>{shipment.guide_number ?? "Sin guía"}</strong><span>{operation.clients?.name ?? "Sin cliente"} · {shipment.company ?? "Sin empresa"}</span></div>
          <span className={`${styles.badge} ${statusClass(shipment.guide_payment_status)}`}>{guidePaymentLabels[shipment.guide_payment_status]}</span>
        </div>
        <div className={styles.cardFacts}>
          <span>Destinatario: {shipment.recipient_name ?? "Sin cargar"}</span>
          <span>Valor real: {formatMoney(toNumber(shipment.guide_amount))}</span>
          <span>Total cliente: {guideChargeLabel(shipment.company, toNumber(shipment.guide_amount))}</span>
          <span>Pase: {moneyUsd(toNumber(shipment.pass_usd_amount))}</span>
        </div>
        <Button variant="secondary" onClick={() => setDetailOperation(operation)}>Abrir detalle</Button>
      </Card>)}
    </section> : null}

    {activeTab === "mas" ? <section className={styles.moreGrid}>
      <Card className={styles.flowCard}>
        <div className={styles.cardHead}><div><p>Estados visibles</p><h3>Cliente no ve la cocina interna</h3></div></div>
        <div className={styles.statusMap}>{logisticsStatusOptions.map((option) => <span key={option.value}>{option.label} → {option.clientLabel}</span>)}</div>
      </Card>
      <Card className={styles.flowCard}>
        <div className={styles.cardHead}><div><p>Acciones rápidas</p><h3>Carga controlada</h3></div></div>
        <div className={styles.quickGrid}>
          <Button onClick={() => openQuickPanel("cliente")}>Crear cliente</Button>
          <Button onClick={() => openQuickPanel("operacion")}>Nueva operación</Button>
          <Button variant="secondary" onClick={() => filteredOperations[0] && startSpecial(filteredOperations[0])}>Movimiento especial</Button>
        </div>
        <small>The Prestige Group · firma discreta</small>
      </Card>
    </section> : null}

    {quickPanel === "cliente" ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Cliente</p><h3>Alta rápida</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.formGrid}>
        <Field label="Nombre"><Input value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} disabled={!canEdit || saving} /></Field>
        <Field label="WhatsApp"><Input value={clientForm.phone} onChange={(event) => setClientForm({ ...clientForm, phone: event.target.value })} disabled={!canEdit || saving} /></Field>
        <Field label="Valor habitual por bulto"><Input type="number" min="0" value={clientForm.default_price_per_package} onChange={(event) => setClientForm({ ...clientForm, default_price_per_package: Number(event.target.value || 0) })} disabled={!canEdit || saving} /></Field>
      </div>
      <Field label="Observaciones"><Textarea value={clientForm.notes ?? ""} onChange={(event) => setClientForm({ ...clientForm, notes: event.target.value })} disabled={!canEdit || saving} /></Field>
      <Button onClick={submitClient} disabled={!canEdit || saving}>Crear cliente</Button>
    </section></div> : null}

    {quickPanel === "operacion" ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>{editingId ? "Editar" : "Nueva"}</p><h3>{editingId ? "Editar operación" : "Nueva operación"}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.formGrid}>
        <Field label="Cliente"><Select value={operationForm.client_id} onChange={(event) => onOperationClientChange(event.target.value)} disabled={!canEdit || saving}><option value="">Seleccionar</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></Field>
        <Field label="Proveedor / local"><Input value={operationForm.provider_name} onChange={(event) => setOperationForm({ ...operationForm, provider_name: event.target.value })} disabled={!canEdit || saving} /></Field>
        <Field label="Fecha"><Input type="date" value={operationForm.operation_date} onChange={(event) => setOperationForm({ ...operationForm, operation_date: event.target.value })} disabled={!canEdit || saving} /></Field>
        <Field label="Bultos"><Input type="number" min="1" value={operationForm.package_count} onChange={(event) => setOperationForm({ ...operationForm, package_count: Number(event.target.value || 1) })} disabled={!canEdit || saving} /></Field>
        <Field label="Pase USD referencia"><Input type="number" min="0" value={operationForm.pass_amount} onChange={(event) => setOperationForm({ ...operationForm, pass_amount: Number(event.target.value || 0) })} disabled={!canEdit || saving} /></Field>
        <Field label="Estado"><Select value={operationForm.logistics_status} onChange={(event) => setOperationForm({ ...operationForm, logistics_status: event.target.value as LogisticsStatus })} disabled={!canEdit || saving}>{logisticsStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
      </div>
      <Field label="Observaciones"><Textarea value={operationForm.note} onChange={(event) => setOperationForm({ ...operationForm, note: event.target.value })} disabled={!canEdit || saving} /></Field>
      <div className={styles.formFooter}><span>Total estimado hoy: <strong>{formatMoney(draftTotal)}</strong></span><Button onClick={submitOperation} disabled={!canEdit || saving}>{editingId ? "Guardar" : "Crear"}</Button></div>
    </section></div> : null}

    {quickPanel === "guia" && shipmentOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Cargar guía</p><h3>{shipmentOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.formGrid}>
        <Field label="Empresa"><Select value={shipmentForm.company} onChange={(event) => setShipmentForm({ ...shipmentForm, company: event.target.value })}><option value="">Seleccionar</option>{transportCompanyOptions.map((company) => <option key={company} value={company}>{company}</option>)}</Select></Field>
        <Field label="Número guía"><Input value={shipmentForm.guide_number} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_number: event.target.value })} /></Field>
        <Field label="Destinatario"><Input value={shipmentForm.recipient_name ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, recipient_name: event.target.value })} /></Field>
        <Field label="DNI / CUIT"><Input value={shipmentForm.recipient_identity_number ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, recipient_identity_number: event.target.value })} /></Field>
        <Field label="Valor real guía"><Input type="number" min="0" value={shipmentForm.guide_amount} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_amount: Number(event.target.value || 0), amount: Number(event.target.value || 0) })} /></Field>
        <Field label="Pase USD"><Input type="number" min="0" value={shipmentForm.pass_usd_amount ?? 0} onChange={(event) => setShipmentForm({ ...shipmentForm, pass_usd_amount: Number(event.target.value || 0) })} /></Field>
        <Field label="Fecha pase"><Input type="date" value={shipmentForm.pass_date ?? today()} onChange={(event) => setShipmentForm({ ...shipmentForm, pass_date: event.target.value || null })} /></Field>
        <Field label="Condición guía"><Select value={shipmentForm.paid ? "si" : "no"} onChange={(event) => setShipmentForm({ ...shipmentForm, paid: event.target.value === "si", guide_paid_by: event.target.value === "si" ? shipmentForm.guide_paid_by : "pendiente", guide_payment_status: event.target.value === "si" ? shipmentForm.guide_payment_status : "pendiente" })}><option value="no">Pendiente / destino</option><option value="si">Ya fue pagada</option></Select></Field>
        {shipmentForm.paid ? <Field label="Quién pagó"><Select value={shipmentForm.guide_paid_by} onChange={(event) => onShipmentPaidByChange(event.target.value as GuidePaidBy)}><option value="pendiente">Seleccionar</option><option value="jeremias">Jeremías</option><option value="cliente">Cliente / destino</option></Select></Field> : null}
      </div>
      <Field label="Destino / instrucción"><Textarea value={shipmentForm.destination_detail ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, destination_detail: event.target.value })} /></Field>
      <div className={styles.formFooter}><span>Vía Cargo suma 2% automático. El pase queda en cuenta corriente.</span><Button onClick={submitShipment} disabled={saving}>Guardar guía</Button></div>
    </section></div> : null}

    {quickPanel === "pago" && paymentOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Cobrar</p><h3>{paymentOperation.clients?.name ?? paymentOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.ledger}>
        <h4>Seleccionar pases pagados</h4>
        {paymentPassOptions.length ? paymentPassOptions.map((item) => <label key={item.id} className={styles.checkRow}>
          <input type="checkbox" checked={selectedPassIds.includes(item.id)} onChange={(event) => {
            const ids = event.target.checked ? [...selectedPassIds, item.id] : selectedPassIds.filter((id) => id !== item.id);
            setSelectedPassIds(ids);
            syncPaymentAmount(ids);
          }} />
          <span>{item.guideNumber} · {item.company}</span>
          <strong>{moneyUsd(item.amountUsd)}</strong>
        </label>) : <p>Esta operación no tiene pases pendientes.</p>}
      </div>
      <div className={styles.accountTotals}>
        <div><span>Seleccionado</span><strong>{moneyUsd(selectedPassTotalUsd)}</strong><small>{formatMoney(selectedPassTotalArs)}</small></div>
      </div>
      <div className={styles.formGrid}>
        <Field label="Método"><Select value={paymentForm.method} onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod, "payment")}>{paymentMethodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
        <Field label="Moneda"><Select value={paymentForm.currency} onChange={(event) => syncPaymentAmount(selectedPassIds, event.target.value as Currency)}><option value="ARS">ARS</option><option value="USD">USD</option></Select></Field>
        <Field label="Monto"><Input type="number" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value || 0) })} /></Field>
      </div>
      <Field label="Nota"><Textarea value={paymentForm.note ?? ""} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} /></Field>
      {paymentOperation.operation_shipments.some((shipment) => shipment.guide_payment_status === "pendiente_reintegro") ? <label className={styles.checkRow}><input type="checkbox" checked={!!paymentForm.markGuideReimbursed} onChange={(event) => setPaymentForm({ ...paymentForm, markGuideReimbursed: event.target.checked })} /><span>Marcar guías a reintegrar como reintegradas</span></label> : null}
      <div className={styles.formFooter}><span>El pago queda en historial y, si seleccionaste pases, esos pases se cierran.</span><Button onClick={submitPayment} disabled={saving}>Registrar pago</Button></div>
    </section></div> : null}

    {quickPanel === "especial" && specialOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Movimiento especial</p><h3>{specialOperation.clients?.name ?? specialOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.formGrid}>
        <Field label="Tipo"><Select value={specialForm.type} onChange={(event) => setSpecialForm({ ...specialForm, type: event.target.value as SpecialMovementInput["type"] })}><option value="adelanto_jeremias">Adelanto Jeremías</option><option value="pago_proveedor">Pago a proveedor</option><option value="dinero_recibido">Dinero recibido del cliente</option><option value="mercaderia_agotada">Mercadería agotada</option><option value="devolucion">Devolución</option><option value="aplicado_otra_compra">Aplicado a otra compra</option></Select></Field>
        <Field label="Proveedor / tienda"><Input value={specialForm.provider_name} onChange={(event) => setSpecialForm({ ...specialForm, provider_name: event.target.value })} placeholder="Atacado UZA" /></Field>
        <Field label="Quién puso la plata"><Select value={specialForm.money_source} onChange={(event) => setSpecialForm({ ...specialForm, money_source: event.target.value as SpecialMovementInput["money_source"] })}><option value="jeremias_adelanto">Jeremías adelantó</option><option value="cliente_envio">Cliente envió primero</option></Select></Field>
        <Field label="Estado"><Select value={specialForm.status} onChange={(event) => setSpecialForm({ ...specialForm, status: event.target.value as SpecialMovementInput["status"] })}><option value="pendiente">Pendiente</option><option value="pagado_proveedor">Pagado al proveedor</option><option value="mercaderia_confirmada">Mercadería confirmada</option><option value="mercaderia_agotada">Mercadería agotada</option><option value="a_devolver">A devolver</option><option value="aplicado_otra_compra">Aplicado a otra compra</option><option value="reintegrado">Reintegrado</option><option value="cerrado">Cerrado</option></Select></Field>
        <Field label="Moneda"><Select value={specialForm.currency} onChange={(event) => setSpecialForm({ ...specialForm, currency: event.target.value as Currency })}><option value="ARS">ARS</option><option value="USD">USD</option></Select></Field>
        <Field label="Monto"><Input type="number" min="0" value={specialForm.amount} onChange={(event) => setSpecialForm({ ...specialForm, amount: Number(event.target.value || 0) })} /></Field>
      </div>
      <Field label="Observación"><Textarea value={specialForm.note ?? ""} onChange={(event) => setSpecialForm({ ...specialForm, note: event.target.value })} placeholder="Ej: proveedor no acepta USDT; Jeremías lleva/transfiere el dinero" /></Field>
      <div className={styles.formFooter}><span>Queda como ítem excepcional dentro de la cuenta corriente.</span><Button onClick={submitSpecialMovement} disabled={saving}>Guardar movimiento</Button></div>
    </section></div> : null}

    {detailOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Ficha</p><h3>{detailOperation.public_code}</h3></div><button type="button" onClick={() => setDetailOperation(null)}>Cerrar</button></div>
      <div className={styles.detailGrid}>
        <div><span>Cliente</span><strong>{detailOperation.clients?.name ?? "-"}</strong></div>
        <div><span>Proveedor</span><strong>{detailOperation.provider_name}</strong></div>
        <div><span>Estado interno</span><strong>{logisticsLabels[detailOperation.logistics_status]}</strong></div>
        <div><span>Cliente ve</span><strong>{clientLogisticsLabels[detailOperation.logistics_status]}</strong></div>
        <div><span>Link cliente</span><strong>/consulta/{detailOperation.public_code}</strong></div>
      </div>
      <div className={styles.ledger}>
        <h4>Guías y pases</h4>
        {detailOperation.operation_shipments.length ? detailOperation.operation_shipments.map((shipment) => <details key={shipment.id} className={styles.guideDetail}>
          <summary>{shipment.guide_number ?? "Sin número"} — {shipment.company ?? "Sin empresa"}</summary>
          <div className={styles.detailGrid}>
            <div><span>Destinatario</span><strong>{shipment.recipient_name ?? "Sin cargar"}</strong></div>
            <div><span>Valor real</span><strong>{formatMoney(toNumber(shipment.guide_amount))}</strong></div>
            <div><span>Total cliente</span><strong>{guideChargeLabel(shipment.company, toNumber(shipment.guide_amount))}</strong></div>
            <div><span>Pase USD</span><strong>{moneyUsd(toNumber(shipment.pass_usd_amount))}</strong></div>
            <div><span>Estado guía</span><strong>{guidePaymentLabels[shipment.guide_payment_status]}</strong></div>
            <div><span>Estado pase</span><strong>{shipmentPassStatus(shipment)}</strong></div>
          </div>
        </details>) : <p>Sin guías cargadas.</p>}
      </div>
      <div className={styles.actions}><Button variant="secondary" onClick={() => startPayment(detailOperation)}>Cobrar</Button><Button variant="ghost" onClick={() => startShipment(detailOperation)}>Agregar guía</Button><Button variant="ghost" onClick={() => startSpecial(detailOperation)}>Movimiento especial</Button><Button variant="ghost" onClick={() => copyClientLink(detailOperation)}>Copiar link</Button></div>
    </section></div> : null}
  </OwnerDesktopShell>;
}
