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

type MainTab = "seguimiento" | "cuentas" | "guias" | "cuenta" | "mas";
type QuickPanel = "cliente" | "operacion" | "guia" | "pago" | "especial" | "acciones" | null;

type AccountPass = {
  id: string;
  operationId: string;
  operationCode: string;
  provider: string;
  guideNumber: string;
  company: string;
  recipient: string;
  amountUsd: number;
  paidUsd: number;
  balanceUsd: number;
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
    type: "dinero_recibido",
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

function nextActionFor(operation: ControlOperation, account?: ClientAccount | null) {
  if (!operation.operation_shipments.length) return "Cargar guía";
  if (operation.operation_shipments.some((shipment) => !shipment.guide_number)) return "Completar guía";
  if ((account?.passUsdPending ?? 0) > 0) return "Cobrar saldo";
  if ((account?.specialPending.length ?? 0) > 0) return "Aplicar a cuenta";
  if (operation.logistics_status !== "despachado") return "Cambiar estado";
  return "Enviar WhatsApp";
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
    dinero_recibido: "Dinero a cuenta",
    mercaderia_agotada: "Mercadería agotada",
    devolucion: "Devolución",
    aplicado_otra_compra: "Aplicado a otra compra",
  };
  return labels[movement.type] ?? "Movimiento especial";
}

function createPassItem(operation: ControlOperation, shipment: ControlShipment): AccountPass | null {
  const amountUsd = toNumber(shipment.pass_usd_amount);
  if (amountUsd <= 0) return null;
  const paidUsd = shipmentPassStatus(shipment) === "pagado" ? amountUsd : Math.min(toNumber(shipment.pass_paid_usd_amount), amountUsd);
  const balanceUsd = Math.max(amountUsd - paidUsd, 0);
  return {
    id: shipment.id,
    operationId: operation.id,
    operationCode: operation.public_code,
    provider: operation.provider_name,
    guideNumber: shipment.guide_number ?? "Sin guía",
    company: shipment.company ?? "Sin empresa",
    recipient: shipment.recipient_name ?? operation.clients?.name ?? "Cliente",
    amountUsd,
    paidUsd,
    balanceUsd,
    status: balanceUsd <= 0.01 ? "pagado" : paidUsd > 0 ? "parcial" : shipmentPassStatus(shipment),
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
        if (pass.status !== "pagado" && pass.status !== "anulado" && pass.balanceUsd > 0) account.pendingPasses.push(pass);
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
    passUsdPending: account.pendingPasses.reduce((sum, item) => sum + item.balanceUsd, 0),
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
    ...(account.pendingPasses.length ? account.pendingPasses.map((item) => `- ${item.guideNumber} · ${item.company} · saldo ${moneyUsd(item.balanceUsd)} · hoy ${formatMoney(item.balanceUsd * DEFAULT_DOLLAR_RATE)}`) : ["- Sin pases pendientes"]),
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
  const [actionsOperation, setActionsOperation] = useState<ControlOperation | null>(null);
  const [focusedOperationId, setFocusedOperationId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ query: "", logistics_status: "", financial_status: "" });
  const [commandOpen, setCommandOpen] = useState(false);
  const [clientDetailId, setClientDetailId] = useState<string | null>(null);
  const [clientDetailTab, setClientDetailTab] = useState<"resumen" | "guias" | "cuenta" | "historial">("resumen");
  const [contactKind, setContactKind] = useState<"clientes" | "proveedores">("clientes");
  const [providerDetailName, setProviderDetailName] = useState<string | null>(null);

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
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setActionsOperation(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const normalizeHash = (rawHash?: string) => rawHash?.replace(/^#/, "").replace(/^\//, "").trim().toLowerCase() ?? "";

    const openNewOperationFromHash = () => {
      const firstClient = data.clients[0];
      setEditingId(null);
      setOperationForm(emptyOperationForm(firstClient?.id ?? "", toNumber(firstClient?.default_price_per_package)));
      setQuickPanel("operacion");
    };

    const applyHash = (rawHash?: string) => {
      const hash = normalizeHash(rawHash ?? window.location.hash);
      if (["cuentas", "clientes", "cliente", "planillas"].includes(hash)) {
        setActiveTab("cuentas");
        return;
      }
      if (["cuenta", "cuenta-corriente", "cta-corriente", "pagos", "cobros", "saldos", "deudores", "deuda"].includes(hash)) {
        setActiveTab("cuenta");
        return;
      }
      if (["guias", "guías", "guia", "guía"].includes(hash)) {
        setActiveTab("guias");
        return;
      }
      if (["mas", "más", "config"].includes(hash)) {
        setActiveTab("mas");
        return;
      }
      if (hash === "nueva") {
        setActiveTab("seguimiento");
        openNewOperationFromHash();
        return;
      }
      setActiveTab("seguimiento");
    };

    const onHashChange = () => applyHash();
    const onBultosTab = (event: Event) => applyHash((event as CustomEvent<string>).detail);
    const onOwnerBultosLinkClick = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href*="/owner/bultos#"], a[href*="/owner/bultos/#"]');
      if (!anchor?.hash) return;
      applyHash(anchor.hash);
    };

    applyHash();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    window.addEventListener("custodia360:bultos-tab", onBultosTab as EventListener);
    document.addEventListener("click", onOwnerBultosLinkClick, true);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
      window.removeEventListener("custodia360:bultos-tab", onBultosTab as EventListener);
      document.removeEventListener("click", onOwnerBultosLinkClick, true);
    };
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
  const sideOperation = filteredOperations.find((operation) => operation.id === focusedOperationId) ?? filteredOperations[0] ?? null;

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
  const selectedPassTotalUsd = paymentPassOptions.filter((item) => selectedPassIds.includes(item.id)).reduce((sum, item) => sum + item.balanceUsd, 0);
  const selectedPassTotalArs = selectedPassTotalUsd * DEFAULT_DOLLAR_RATE;
  const queryText = filters.query.trim().toLowerCase();
  const filteredAccounts = accounts.filter((account) => {
    if (!queryText) return true;
    const haystack = [
      account.clientName,
      account.phone,
      ...account.operations.map((operation) => [operation.public_code, operation.provider_name, operation.note, ...operation.operation_shipments.map((shipment) => `${shipment.company ?? ""} ${shipment.guide_number ?? ""} ${shipment.recipient_name ?? ""}`)].join(" ")),
    ].join(" ").toLowerCase();
    return haystack.includes(queryText);
  });
  const debtorAccounts = filteredAccounts.filter((account) => account.passUsdPending > 0.01 || account.guideArsPending > 0.01 || account.specialArsPending > 0.01);
  const providerContacts = useMemo(() => {
    const map = new Map<string, { name: string; operations: ControlOperation[]; shipments: number; pendingUsd: number; lastStatus?: LogisticsStatus }>();
    data.operations.forEach((operation) => {
      const name = operation.provider_name?.trim() || "Proveedor sin nombre";
      const current = map.get(name) ?? { name, operations: [], shipments: 0, pendingUsd: 0, lastStatus: operation.logistics_status };
      current.operations.push(operation);
      current.shipments += operation.operation_shipments.length;
      current.pendingUsd += operation.operation_shipments.reduce((sum, shipment) => {
        const pass = createPassItem(operation, shipment);
        return sum + (pass && pass.status !== "pagado" && pass.status !== "anulado" ? pass.balanceUsd : 0);
      }, 0);
      current.lastStatus = operation.logistics_status;
      map.set(name, current);
    });
    const list = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    if (!queryText) return list;
    return list.filter((provider) => provider.name.toLowerCase().includes(queryText) || provider.operations.some((operation) => [operation.clients?.name, operation.public_code, operation.note].join(" ").toLowerCase().includes(queryText)));
  }, [data.operations, queryText]);
  const providerDetail = providerDetailName ? providerContacts.find((provider) => provider.name === providerDetailName) ?? null : null;
  const clientDetailAccount = accounts.find((account) => account.clientId === clientDetailId) ?? null;
  const clientDetailOperation = clientDetailAccount?.operations[0] ?? null;

  const openClientScreen = (account: ClientAccount, tab: "resumen" | "guias" | "cuenta" | "historial" = "resumen") => {
    setSelectedAccountId(account.clientId);
    setClientDetailId(account.clientId);
    setClientDetailTab(tab);
  };

  const openOperationScreen = (operation: ControlOperation, tab: "resumen" | "guias" | "cuenta" | "historial" = "resumen") => {
    const account = accounts.find((item) => item.clientId === operation.client_id);
    if (account) {
      openClientScreen(account, tab);
      return;
    }
    setDetailOperation(operation);
  };

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
    setSpecialForm({ ...emptySpecialMovementForm(operation), type: "pago_proveedor", money_source: "jeremias_adelanto" });
    setQuickPanel("especial");
  };

  const startMoneyOnAccount = (operation: ControlOperation) => {
    setSpecialOperation(operation);
    setSpecialForm({
      ...emptySpecialMovementForm(operation),
      type: "dinero_recibido",
      status: "pendiente",
      provider_name: operation.provider_name || "A cuenta",
      money_source: "cliente_envio",
      note: "Dinero recibido del cliente para aplicar a guías, pases o compras futuras.",
    });
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
    const usd = paymentPassOptions.filter((item) => ids.includes(item.id)).reduce((sum, item) => sum + item.balanceUsd, 0);
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

  const openWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/5493757653075?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  const copyWhatsAppOperation = async (operation: ControlOperation) => {
    const account = accounts.find((item) => item.clientId === operation.client_id);
    if (!account) return;
    const text = buildAccountWhatsApp(account);
    await navigator.clipboard.writeText(text);
    openWhatsApp(text);
    setMessage("Resumen copiado y WhatsApp abierto.");
  };

  const copyWhatsAppAccount = async (account: ClientAccount) => {
    const text = buildAccountWhatsApp(account);
    await navigator.clipboard.writeText(text);
    openWhatsApp(text);
    setMessage("Resumen copiado y WhatsApp abierto.");
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

  const goToTab = (tab: MainTab, hash: string = tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}#${hash}`);
      window.dispatchEvent(new CustomEvent("custodia360:bultos-tab", { detail: hash }));
    }
  };

  const tabMeta: Record<MainTab, { title: string; eyebrow: string; hint: string }> = {
    seguimiento: { title: "Mesa", eyebrow: "Pizarrón operativo", hint: "Trayecto vivo: proveedor, retiro, depósito, despacho y confirmación" },
    cuentas: { title: "Contactos", eyebrow: "Agenda operativa", hint: "Clientes y proveedores en pantallas separadas" },
    guias: { title: "Guías", eyebrow: "Activas", hint: "Guías abiertas, despachadas y a confirmar" },
    cuenta: { title: "Cobros", eyebrow: "Parte contable", hint: "Solo pendientes vivos; lo pagado queda en la ficha del cliente" },
    mas: { title: "Más", eyebrow: "Sistema", hint: "Configuración, permisos, dueños y soporte" },
  };
  const activeMeta = tabMeta[activeTab];

  return <OwnerDesktopShell title={activeMeta.title}>
    <section id="seguimiento" className={styles.topBar}>
      <div>
        <p>{activeMeta.eyebrow}</p>
        <h2>{activeMeta.title}</h2>
        <span>{activeMeta.hint}</span>
      </div>
      <div className={styles.topActions}>
        <Button variant="secondary" onClick={() => setCommandOpen(true)}>Buscar</Button>
        <Button onClick={() => setQuickPanel("acciones")}>Resolver</Button>
      </div>
    </section>

    {message ? <div className={styles.success}>{message}</div> : null}
    {error ? <div className={styles.error}>{error}</div> : null}

    <nav className={styles.appTabs} aria-label="Navegación operativa">
      <button className={activeTab === "seguimiento" ? styles.activeTab : ""} onClick={() => goToTab("seguimiento")}>Mesa</button>
      <button id="cuentas" className={activeTab === "cuentas" ? styles.activeTab : ""} onClick={() => goToTab("cuentas", "clientes")}>Contactos</button>
      <button id="cuenta" className={activeTab === "cuenta" ? styles.activeTab : ""} onClick={() => goToTab("cuenta", "cobros")}>Cobros</button>
      <button id="guias" className={activeTab === "guias" ? styles.activeTab : ""} onClick={() => goToTab("guias")}>Guías</button>
      <button className={activeTab === "mas" ? styles.activeTab : ""} onClick={() => goToTab("mas")}>Más</button>
    </nav>

    {activeTab === "seguimiento" || activeTab === "cuenta" ? <section className={styles.kpiStrip}>
      <Card className={styles.kpi}><span>Pendiente</span><strong>{canSeeMoney ? moneyUsd(kpis.passUsd) : "-"}</strong><small>{canSeeMoney ? formatMoney(kpis.passUsd * DEFAULT_DOLLAR_RATE) : ""}</small></Card>
      <Card className={styles.kpi}><span>Reintegrar</span><strong>{canSeeMoney ? formatMoney(kpis.guideArs) : "-"}</strong><small>{kpis.pendingPasses} pases</small></Card>
      <Card className={styles.kpi}><span>A cuenta</span><strong>{canSeeMoney ? formatMoney(kpis.specialArs) : "-"}</strong><small>Especiales</small></Card>
    </section> : null}

    {activeTab !== "mas" ? <Card className={styles.searchCard}>
      <Input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder={activeTab === "cuentas" ? "Buscar contacto" : activeTab === "cuenta" ? "Buscar cobro" : "Buscar cliente, proveedor o guía"} />
      {activeTab === "seguimiento" || activeTab === "guias" ? <div className={styles.filterChips}>
        <button onClick={() => setFilters({ ...filters, logistics_status: "", financial_status: "" })}>Todos</button>
        {logisticsStatusOptions.slice(0, 6).map((option) => <button key={option.value} className={filters.logistics_status === option.value ? styles.chipActive : ""} onClick={() => setFilters({ ...filters, logistics_status: option.value })}>{option.label}</button>)}
      </div> : null}
    </Card> : null}

    <button type="button" className={styles.mobileFabAction} onClick={() => setQuickPanel("acciones")} aria-label="Abrir acciones rápidas">+</button>

    {loading ? <Card className={styles.empty}>Cargando operaciones...</Card> : null}

    {activeTab === "seguimiento" && !loading ? <section className={styles.contentGrid}>
      <div className={styles.operationList}>
        <div className={styles.tableShell}>
          <div className={styles.tableHead}>
            <span>Cliente / movimiento</span>
            <span>Etapa</span>
            <span>Cuenta</span>
            <span>Guías</span>
            <span>Próxima acción</span>
            <span>Acciones</span>
          </div>
          {filteredOperations.length ? filteredOperations.map((operation) => {
            const totals = calculateOperationTotals(operation);
            const account = accounts.find((item) => item.clientId === operation.client_id);
            return <article key={operation.id} className={`${styles.tableRow} ${sideOperation?.id === operation.id ? styles.tableRowActive : ""}`} onClick={() => setFocusedOperationId(operation.id)}>
              <div className={styles.clientCell}>
                <strong>{operation.clients?.name ?? "Sin cliente"}</strong>
                <span>{operation.public_code} · {operation.provider_name}</span>
              </div>
              <div>
                <span className={`${styles.badge} ${statusClass(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>
                <small>Cliente ve {clientLogisticsLabels[operation.logistics_status]}</small>
              </div>
              <div className={styles.moneyCell}>
                <strong>{canSeeMoney ? moneyUsd(account?.passUsdPending ?? 0) : "-"}</strong>
                <small>{operation.financial_status ? financialLabels[operation.financial_status] : "Pendiente"} · op. {moneyUsd(totals.passAmount)}</small>
              </div>
              <div>
                <strong>{operation.operation_shipments.length}</strong>
                <small>{guideNumbers(operation)}</small>
              </div>
              <div className={styles.nextActionCell}>
                <strong>{nextActionFor(operation, account)}</strong>
                <small>Acción recomendada</small>
              </div>
              <div className={styles.rowActions}>
                <button type="button" onClick={(event) => { event.stopPropagation(); setFocusedOperationId(operation.id); }}>Ver</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); startPayment(operation); }} disabled={!canCollect}>Cobrar</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setActionsOperation(operation); }}>Más</button>
              </div>
            </article>;
          }) : <Card className={styles.empty}>No hay operaciones para estos filtros.</Card>}
        </div>

        <div className={styles.mobileOperationCards}>
          {filteredOperations.length ? filteredOperations.map((operation) => {
            const account = accounts.find((item) => item.clientId === operation.client_id);
            return <article key={operation.id} className={styles.operationCard} onClick={() => { setFocusedOperationId(operation.id); openOperationScreen(operation); }}>
              <div className={styles.compactRowHead}>
                <div>
                  <strong>{operation.clients?.name ?? "Sin cliente"}</strong>
                  <span>{operation.package_count} bultos · {operation.operation_shipments.length} guías</span>
                </div>
                <span className={`${styles.badge} ${statusClass(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>
              </div>
              <div className={styles.compactRowMeta}>
                <span>{operation.provider_name}</span>
                <strong>{canSeeMoney ? moneyUsd(account?.passUsdPending ?? 0) : "-"}</strong>
              </div>
              <div className={styles.compactNext}>
                <span>{nextActionFor(operation, account)}</span>
                <button type="button" onClick={(event) => { event.stopPropagation(); setActionsOperation(operation); }}>•••</button>
              </div>
            </article>;
          }) : <Card className={styles.empty}>No hay operaciones para estos filtros.</Card>}
        </div>
      </div>

      {sideOperation ? <aside className={styles.desktopDetail}>
        <div className={styles.cardHead}>
          <div><p>Ficha rápida</p><h3>{sideOperation.clients?.name ?? "Sin cliente"}</h3></div>
          <span className={`${styles.badge} ${statusClass(sideOperation.logistics_status)}`}>{logisticsLabels[sideOperation.logistics_status]}</span>
        </div>
        <div className={styles.detailGrid}>
          <div><span>Operación</span><strong>{sideOperation.public_code}</strong></div>
          <div><span>Proveedor</span><strong>{sideOperation.provider_name}</strong></div>
          <div><span>Bultos</span><strong>{sideOperation.package_count}</strong></div>
          <div><span>Guías</span><strong>{sideOperation.operation_shipments.length}</strong></div>
          <div><span>Cliente ve</span><strong>{clientLogisticsLabels[sideOperation.logistics_status]}</strong></div>
          <div><span>Link cliente</span><strong>/consulta/{sideOperation.public_code}</strong></div>
        </div>
        <div className={styles.ledger}>
          <h4>Guías y pases</h4>
          {sideOperation.operation_shipments.length ? sideOperation.operation_shipments.slice(0, 4).map((shipment) => <div key={shipment.id} className={styles.ledgerItem}>
            <div><strong>{shipment.guide_number ?? "Sin número"}</strong><span>{shipment.company ?? "Sin empresa"} · {shipment.recipient_name ?? "Destinatario"}</span></div>
            <b>{moneyUsd(toNumber(shipment.pass_usd_amount))}</b>
          </div>) : <p>Sin guías cargadas.</p>}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setDetailOperation(sideOperation)}>Abrir completa</Button>
          <Button variant="secondary" onClick={() => startPayment(sideOperation)} disabled={!canCollect}>Cobrar</Button>
          <Button variant="ghost" onClick={() => startShipment(sideOperation)} disabled={!canEdit}>Guía</Button>
          <Button variant="ghost" onClick={() => startMoneyOnAccount(sideOperation)} disabled={!canEdit}>Dinero a cuenta</Button><Button variant="ghost" onClick={() => startSpecial(sideOperation)} disabled={!canEdit}>Especial</Button>
        </div>
      </aside> : null}
    </section> : null}

    {activeTab === "cuentas" && !loading ? <section className={styles.screenList}>
      <div className={styles.contactSwitch}>
        <button type="button" className={contactKind === "clientes" ? styles.innerTabActive : ""} onClick={() => setContactKind("clientes")}>Clientes</button>
        <button type="button" className={contactKind === "proveedores" ? styles.innerTabActive : ""} onClick={() => setContactKind("proveedores")}>Proveedores</button>
      </div>
      {contactKind === "clientes" ? (filteredAccounts.length ? filteredAccounts.map((account) => {
        const totalBultos = account.operations.reduce((sum, op) => sum + op.package_count, 0);
        const debtLabel = account.passUsdPending > 0.01 ? moneyUsd(account.passUsdPending) : account.guideArsPending + account.specialArsPending > 0.01 ? formatMoney(account.guideArsPending + account.specialArsPending) : "Al día";
        const lastOperation = account.operations[0];
        return <button key={account.clientId} type="button" className={styles.screenRow} onClick={() => openClientScreen(account)}>
          <div>
            <strong>{account.clientName}</strong>
            <span>{totalBultos} bultos · {account.operations.length} movimientos · {lastOperation ? logisticsLabels[lastOperation.logistics_status] : "Sin movimientos"}</span>
          </div>
          <b>{debtLabel}</b>
          <i>›</i>
        </button>;
      }) : <Card className={styles.empty}>No hay clientes para esta búsqueda.</Card>) : null}
      {contactKind === "proveedores" ? (providerContacts.length ? providerContacts.map((provider) => <button key={provider.name} type="button" className={styles.screenRow} onClick={() => setProviderDetailName(provider.name)}>
        <div>
          <strong>{provider.name}</strong>
          <span>{provider.operations.length} movimientos · {provider.shipments} guías · {provider.lastStatus ? logisticsLabels[provider.lastStatus] : "Sin estado"}</span>
        </div>
        <b>{provider.pendingUsd > 0.01 ? moneyUsd(provider.pendingUsd) : "Activo"}</b>
        <i>›</i>
      </button>) : <Card className={styles.empty}>No hay proveedores para esta búsqueda.</Card>) : null}
    </section> : null}

    {activeTab === "cuenta" && !loading ? <section className={styles.screenList}>
      <div className={styles.screenSummary}>
        <strong>{debtorAccounts.length} cobros pendientes</strong>
        <span>Cuando se marca pagado, sale de Cobros y queda en la ficha del cliente.</span>
      </div>
      {debtorAccounts.length ? debtorAccounts.map((account) => <button key={account.clientId} type="button" className={styles.screenRow} onClick={() => openClientScreen(account, "cuenta")}>
        <div>
          <strong>{account.clientName}</strong>
          <span>{account.pendingPasses.length} pases · {account.guideReimbursements.length} guías · {account.specialPending.length} especiales abiertos</span>
        </div>
        <b>{account.passUsdPending > 0.01 ? moneyUsd(account.passUsdPending) : formatMoney(account.guideArsPending + account.specialArsPending)}</b>
        <i>›</i>
      </button>) : <Card className={styles.empty}>No hay cobros pendientes. Lo pagado queda en la ficha del cliente.</Card>}
    </section> : null}

    {activeTab === "guias" && !loading ? <section className={styles.guideGrid}>
      {filteredOperations.flatMap((operation) => operation.operation_shipments.map((shipment) => ({ operation, shipment }))).map(({ operation, shipment }) => <article key={shipment.id} className={styles.guideCard} onClick={() => openOperationScreen(operation, "guias")}>
        <div className={styles.compactRowHead}>
          <div><strong>{shipment.guide_number ?? "Sin guía"}</strong><span>{operation.clients?.name ?? "Sin cliente"} · {shipment.company ?? "Sin empresa"}</span></div>
          <span className={`${styles.badge} ${statusClass(shipment.guide_payment_status)}`}>{guidePaymentLabels[shipment.guide_payment_status]}</span>
        </div>
        <div className={styles.compactRowMeta}>
          <span>{shipment.recipient_name ?? "Destinatario pendiente"}</span>
          <strong>{moneyUsd(toNumber(shipment.pass_usd_amount))}</strong>
        </div>
        <div className={styles.compactNext}><span>Detalle</span><b>›</b></div>
      </article>)}
    </section> : null}

    {activeTab === "mas" ? <section className={styles.moreGrid}>
      <Card className={styles.flowCard}>
        <div className={styles.cardHead}><div><p>Sistema</p><h3>Configuración</h3></div></div>
        <div className={styles.quickGrid}>
          <a className={styles.utilityLink} href="/owner/configuracion">Configuración</a>
          <a className={styles.utilityLink} href="/owner/permisos">Permisos</a>
          <a className={styles.utilityLink} href="/platform">Dueños</a>
          <a className={styles.utilityLink} href="/owner/configuracion">Banner cliente</a>
          <a className={styles.utilityLink} href="/contacto-legal">Soporte legal</a>
          <button type="button" className={styles.utilityLink} onClick={() => setCommandOpen(true)}>Buscar</button>
        </div>
      </Card>
    </section> : null}

    {clientDetailAccount ? <div className={styles.panelOverlay}>
      <section className={`${styles.panel} ${styles.clientScreenPanel}`}>
        <div className={styles.panelHead}>
          <div><p>Cliente</p><h3>{clientDetailAccount.clientName}</h3></div>
          <button type="button" onClick={() => setClientDetailId(null)}>Cerrar</button>
        </div>
        <div className={styles.clientScreenTotals}>
          <div><span>Debe</span><strong>{moneyUsd(clientDetailAccount.passUsdPending)}</strong></div>
          <div><span>Guías</span><strong>{clientDetailAccount.operations.reduce((sum, op) => sum + op.operation_shipments.length, 0)}</strong></div>
          <div><span>Archivo</span><strong>{clientDetailAccount.paidPasses.length + clientDetailAccount.payments.length}</strong></div>
        </div>
        <nav className={styles.innerTabs} aria-label="Detalle del cliente">
          <button type="button" className={clientDetailTab === "resumen" ? styles.innerTabActive : ""} onClick={() => setClientDetailTab("resumen")}>Resumen</button>
          <button type="button" className={clientDetailTab === "guias" ? styles.innerTabActive : ""} onClick={() => setClientDetailTab("guias")}>Guías</button>
          <button type="button" className={clientDetailTab === "cuenta" ? styles.innerTabActive : ""} onClick={() => setClientDetailTab("cuenta")}>Cuenta</button>
          <button type="button" className={clientDetailTab === "historial" ? styles.innerTabActive : ""} onClick={() => setClientDetailTab("historial")}>Archivo</button>
        </nav>

        {clientDetailTab === "resumen" ? <div className={styles.screenList}>
          {clientDetailAccount.operations.slice(0, 8).map((operation) => <button type="button" key={operation.id} className={styles.screenRow} onClick={() => openOperationScreen(operation, "guias")}>
            <div><strong>{operation.provider_name}</strong><span>{formatDate(operation.operation_date)} · {operation.package_count} bultos · {logisticsLabels[operation.logistics_status]}</span></div>
            <b>{operation.operation_shipments.length} guías</b><i>›</i>
          </button>)}
        </div> : null}

        {clientDetailTab === "guias" ? <div className={styles.screenList}>
          {clientDetailAccount.operations.flatMap((operation) => operation.operation_shipments.map((shipment) => ({ operation, shipment }))).length ? clientDetailAccount.operations.flatMap((operation) => operation.operation_shipments.map((shipment) => ({ operation, shipment }))).map(({ operation, shipment }) => <button key={shipment.id} type="button" className={styles.screenRow} onClick={() => setDetailOperation(operation)}>
            <div><strong>{shipment.guide_number ?? "Sin guía"}</strong><span>{shipment.company ?? "Sin empresa"} · {shipment.recipient_name ?? operation.provider_name}</span></div>
            <b>{guidePaymentLabels[shipment.guide_payment_status]}</b><i>›</i>
          </button>) : <p className={styles.emptyText}>Sin guías cargadas.</p>}
        </div> : null}

        {clientDetailTab === "cuenta" ? <div className={styles.screenList}>
          <div className={styles.screenSummary}><strong>Pendientes</strong><span>Solo deuda viva. Lo pagado pasa a Historial.</span></div>
          {clientDetailAccount.pendingPasses.map((item) => <div key={item.id} className={styles.screenRowStatic}><div><strong>{item.guideNumber}</strong><span>{item.provider} · {item.company} · pagado {moneyUsd(item.paidUsd)}</span></div><b>{moneyUsd(item.balanceUsd)}</b></div>)}
          {clientDetailAccount.guideReimbursements.map((item) => <div key={item.id} className={styles.screenRowStatic}><div><strong>{item.guideNumber}</strong><span>{item.operationCode} · {item.company}</span></div><b>{formatMoney(item.amountArs)}</b></div>)}
          {clientDetailAccount.specialPending.map((item) => <div key={item.id} className={styles.screenRowStatic}><div><strong>{movementLabel(item)}</strong><span>{item.provider_name} · {item.status.replaceAll("_", " ")}</span></div><b>{item.currency === "ARS" ? formatMoney(item.amount) : moneyUsd(item.amount)}</b></div>)}
          {!clientDetailAccount.pendingPasses.length && !clientDetailAccount.guideReimbursements.length && !clientDetailAccount.specialPending.length ? <p className={styles.emptyText}>Sin pendientes activos.</p> : null}
        </div> : null}

        {clientDetailTab === "historial" ? <div className={styles.screenList}>
          <div className={styles.screenSummary}><strong>Archivo del cliente</strong><span>Pagados, reintegrados y movimientos cerrados quedan acá.</span></div>
          {clientDetailAccount.paidPasses.map((item) => <div key={item.id} className={styles.screenRowStatic}><div><strong>{item.guideNumber}</strong><span>Pagado · {item.provider} · {item.company}</span></div><b>{moneyUsd(item.amountUsd)}</b></div>)}
          {clientDetailAccount.payments.map((payment) => <div key={payment.id} className={styles.screenRowStatic}><div><strong>{formatDate(payment.paid_at)}</strong><span>{payment.concept} · {paymentMethodLabels[payment.method]}</span></div><b>{payment.currency === "ARS" ? formatMoney(payment.amount) : moneyUsd(payment.amount)}</b></div>)}
          {!clientDetailAccount.paidPasses.length && !clientDetailAccount.payments.length ? <p className={styles.emptyText}>Todavía no hay archivo cerrado.</p> : null}
        </div> : null}

        <div className={styles.stickyClientActions}>
          <Button onClick={() => clientDetailOperation && startPayment(clientDetailOperation)} disabled={!clientDetailOperation || !canCollect}>Cobrar</Button>
          <Button variant="secondary" onClick={() => clientDetailOperation && startShipment(clientDetailOperation)} disabled={!clientDetailOperation || !canEdit}>Guía</Button>
          <Button variant="ghost" onClick={() => copyWhatsAppAccount(clientDetailAccount)}>Contactar</Button>
        </div>
      </section>
    </div> : null}


    {providerDetail ? <div className={styles.panelOverlay}>
      <section className={`${styles.panel} ${styles.clientScreenPanel}`}>
        <div className={styles.panelHead}>
          <div><p>Proveedor</p><h3>{providerDetail.name}</h3></div>
          <button type="button" onClick={() => setProviderDetailName(null)}>Cerrar</button>
        </div>
        <div className={styles.clientScreenTotals}>
          <div><span>Movimientos</span><strong>{providerDetail.operations.length}</strong></div>
          <div><span>Guías</span><strong>{providerDetail.shipments}</strong></div>
          <div><span>Pendiente</span><strong>{providerDetail.pendingUsd > 0.01 ? moneyUsd(providerDetail.pendingUsd) : "Sin saldo"}</strong></div>
        </div>
        <div className={styles.screenList}>
          <div className={styles.screenSummary}><strong>Datos del proveedor</strong><span>WhatsApp, medios de pago y notas se configuran en la ficha del proveedor.</span></div>
          {providerDetail.operations.slice(0, 8).map((operation) => <button key={operation.id} type="button" className={styles.screenRow} onClick={() => openOperationScreen(operation)}>
            <div><strong>{operation.clients?.name ?? "Sin cliente"}</strong><span>{operation.public_code} · {operation.package_count} bultos · {logisticsLabels[operation.logistics_status]}</span></div>
            <b>{operation.operation_shipments.length} guías</b><i>›</i>
          </button>)}
        </div>
        <div className={styles.stickyClientActions}>
          <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(providerDetail.name)}>Copiar proveedor</Button>
          <Button variant="ghost" onClick={() => setProviderDetailName(null)}>Cerrar</Button>
        </div>
      </section>
    </div> : null}

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
      <div className={styles.panelHead}><div><p>{editingId ? "Editar" : "Movimiento"}</p><h3>{editingId ? "Editar movimiento" : "Nuevo movimiento del cliente"}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.panelSteps}><span>1 Cliente</span><span>2 Movimiento</span><span>3 Etapa</span><span>4 Cuenta</span><span>5 Guardar</span></div>
      <div className={styles.formGrid}>
        <Field label="Cliente"><Select value={operationForm.client_id} onChange={(event) => onOperationClientChange(event.target.value)} disabled={!canEdit || saving}><option value="">Seleccionar</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</Select></Field>
        <Field label="Proveedor / local / descripción"><Input value={operationForm.provider_name} onChange={(event) => setOperationForm({ ...operationForm, provider_name: event.target.value })} placeholder="Ej: Génesis / ropa / perfumes" disabled={!canEdit || saving} /></Field>
        <Field label="Fecha"><Input type="date" value={operationForm.operation_date} onChange={(event) => setOperationForm({ ...operationForm, operation_date: event.target.value })} disabled={!canEdit || saving} /></Field>
        <Field label="Cantidad / bultos"><Input type="number" min="1" value={operationForm.package_count} onChange={(event) => setOperationForm({ ...operationForm, package_count: Number(event.target.value || 1) })} disabled={!canEdit || saving} /></Field>
        <Field label="Pase USD referencia"><Input type="number" min="0" value={operationForm.pass_amount} onChange={(event) => setOperationForm({ ...operationForm, pass_amount: Number(event.target.value || 0) })} disabled={!canEdit || saving} /></Field>
        <Field label="Estado"><Select value={operationForm.logistics_status} onChange={(event) => setOperationForm({ ...operationForm, logistics_status: event.target.value as LogisticsStatus })} disabled={!canEdit || saving}>{logisticsStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
      </div>
      <Field label="Observaciones"><Textarea value={operationForm.note} onChange={(event) => setOperationForm({ ...operationForm, note: event.target.value })} disabled={!canEdit || saving} /></Field>
      <div className={styles.formFooter}><span>Esto crea una línea en la planilla digital del cliente. Total estimado hoy: <strong>{formatMoney(draftTotal)}</strong></span><Button onClick={submitOperation} disabled={!canEdit || saving}>{editingId ? "Guardar" : "Crear movimiento"}</Button></div>
    </section></div> : null}

    {quickPanel === "guia" && shipmentOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Guía / despacho</p><h3>{shipmentOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.panelSteps}><span>1 Empresa</span><span>2 Número</span><span>3 Destino</span><span>4 Pase</span><span>5 Guardar</span></div>
      <div className={styles.formGrid}>
        <Field label="Empresa"><Select value={shipmentForm.company} onChange={(event) => setShipmentForm({ ...shipmentForm, company: event.target.value })}><option value="">Seleccionar</option>{transportCompanyOptions.map((company) => <option key={company} value={company}>{company}</option>)}</Select></Field>
        <Field label="Número guía"><Input value={shipmentForm.guide_number} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_number: event.target.value })} /></Field>
        <Field label="Destinatario"><Input value={shipmentForm.recipient_name ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, recipient_name: event.target.value })} /></Field>
        <Field label="Valor real guía"><Input type="number" min="0" value={shipmentForm.guide_amount} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_amount: Number(event.target.value || 0), amount: Number(event.target.value || 0) })} /></Field>
      </div>
      <details className={styles.advancedFields}>
        <summary>Campos avanzados</summary>
        <div className={styles.formGrid}>
          <Field label="DNI / CUIT"><Input value={shipmentForm.recipient_identity_number ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, recipient_identity_number: event.target.value })} /></Field>
          <Field label="Pase USD"><Input type="number" min="0" value={shipmentForm.pass_usd_amount ?? 0} onChange={(event) => setShipmentForm({ ...shipmentForm, pass_usd_amount: Number(event.target.value || 0) })} /></Field>
          <Field label="Fecha pase"><Input type="date" value={shipmentForm.pass_date ?? today()} onChange={(event) => setShipmentForm({ ...shipmentForm, pass_date: event.target.value || null })} /></Field>
          <Field label="Condición guía"><Select value={shipmentForm.paid ? "si" : "no"} onChange={(event) => setShipmentForm({ ...shipmentForm, paid: event.target.value === "si", guide_paid_by: event.target.value === "si" ? shipmentForm.guide_paid_by : "pendiente", guide_payment_status: event.target.value === "si" ? shipmentForm.guide_payment_status : "pendiente" })}><option value="no">Pendiente / destino</option><option value="si">Ya fue pagada</option></Select></Field>
          {shipmentForm.paid ? <Field label="Quién pagó"><Select value={shipmentForm.guide_paid_by} onChange={(event) => onShipmentPaidByChange(event.target.value as GuidePaidBy)}><option value="pendiente">Seleccionar</option><option value="jeremias">Jeremías</option><option value="cliente">Cliente / destino</option></Select></Field> : null}
        </div>
        <Field label="Destino / instrucción"><Textarea value={shipmentForm.destination_detail ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, destination_detail: event.target.value })} /></Field>
      </details>
      <div className={styles.formFooter}><span>Modo rápido: empresa, número, destinatario y valor. Lo demás queda en campos avanzados.</span><Button onClick={submitShipment} disabled={saving}>Guardar guía</Button></div>
    </section></div> : null}

    {quickPanel === "pago" && paymentOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Cobrar cuenta</p><h3>{paymentOperation.clients?.name ?? paymentOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.panelSteps}><span>1 Cliente</span><span>2 Seleccionar pases</span><span>3 Monto</span><span>4 Medio</span><span>5 Registrar</span></div>
      <div className={styles.ledger}>
        <h4>Seleccionar pases pagados</h4>
        {paymentPassOptions.length ? paymentPassOptions.map((item) => <label key={item.id} className={styles.checkRow}>
          <input type="checkbox" checked={selectedPassIds.includes(item.id)} onChange={(event) => {
            const ids = event.target.checked ? [...selectedPassIds, item.id] : selectedPassIds.filter((id) => id !== item.id);
            setSelectedPassIds(ids);
            syncPaymentAmount(ids);
          }} />
          <span>{item.guideNumber} · {item.company} · pagado {moneyUsd(item.paidUsd)}</span>
          <strong>Saldo {moneyUsd(item.balanceUsd)}</strong>
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
      <details className={styles.advancedFields}>
        <summary>Opciones avanzadas</summary>
        <Field label="Nota"><Textarea value={paymentForm.note ?? ""} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} /></Field>
        {paymentOperation.operation_shipments.some((shipment) => shipment.guide_payment_status === "pendiente_reintegro") ? <label className={styles.checkRow}><input type="checkbox" checked={!!paymentForm.markGuideReimbursed} onChange={(event) => setPaymentForm({ ...paymentForm, markGuideReimbursed: event.target.checked })} /><span>Marcar guías a reintegrar como reintegradas</span></label> : null}
      </details>
      <div className={styles.formFooter}><span>Seleccioná deuda, monto y medio. El historial queda guardado.</span><Button onClick={submitPayment} disabled={saving}>Registrar pago</Button></div>
    </section></div> : null}

    {quickPanel === "especial" && specialOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>{specialForm.type === "dinero_recibido" ? "Dinero a cuenta" : "Movimiento especial"}</p><h3>{specialOperation.clients?.name ?? specialOperation.public_code}</h3></div><button onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.panelSteps}><span>1 Tipo</span><span>2 Origen</span><span>3 Monto</span><span>4 Aplicación</span><span>5 Guardar</span></div>
      <div className={styles.formGrid}>
        <Field label="Tipo"><Select value={specialForm.type} onChange={(event) => setSpecialForm({ ...specialForm, type: event.target.value as SpecialMovementInput["type"] })}><option value="adelanto_jeremias">Adelanto Jeremías</option><option value="pago_proveedor">Pago a proveedor</option><option value="dinero_recibido">Dinero a cuenta del cliente</option><option value="mercaderia_agotada">Mercadería agotada</option><option value="devolucion">Devolución</option><option value="aplicado_otra_compra">Aplicado a otra compra</option></Select></Field>
        <Field label={specialForm.type === "dinero_recibido" ? "Referencia" : "Proveedor / tienda"}><Input value={specialForm.provider_name} onChange={(event) => setSpecialForm({ ...specialForm, provider_name: event.target.value })} placeholder={specialForm.type === "dinero_recibido" ? "A cuenta / guía / compra futura" : "Atacado UZA"} /></Field>
        <Field label="Quién puso la plata"><Select value={specialForm.money_source} onChange={(event) => setSpecialForm({ ...specialForm, money_source: event.target.value as SpecialMovementInput["money_source"] })}><option value="jeremias_adelanto">Jeremías adelantó</option><option value="cliente_envio">Cliente entregó dinero a cuenta</option></Select></Field>
        <Field label="Estado"><Select value={specialForm.status} onChange={(event) => setSpecialForm({ ...specialForm, status: event.target.value as SpecialMovementInput["status"] })}><option value="pendiente">Pendiente</option><option value="pagado_proveedor">Pagado al proveedor</option><option value="mercaderia_confirmada">Mercadería confirmada</option><option value="mercaderia_agotada">Mercadería agotada</option><option value="a_devolver">A devolver</option><option value="aplicado_otra_compra">Aplicado a otra compra</option><option value="reintegrado">Reintegrado</option><option value="cerrado">Cerrado</option></Select></Field>
        <Field label="Moneda"><Select value={specialForm.currency} onChange={(event) => setSpecialForm({ ...specialForm, currency: event.target.value as Currency })}><option value="ARS">ARS</option><option value="USD">USD</option></Select></Field>
        <Field label="Monto"><Input type="number" min="0" value={specialForm.amount} onChange={(event) => setSpecialForm({ ...specialForm, amount: Number(event.target.value || 0) })} /></Field>
      </div>
      <Field label="Observación"><Textarea value={specialForm.note ?? ""} onChange={(event) => setSpecialForm({ ...specialForm, note: event.target.value })} placeholder={specialForm.type === "dinero_recibido" ? "Ej: Estela deja USD 200 a cuenta para aplicar después" : "Ej: proveedor no acepta USDT; Jeremías lleva/transfiere el dinero"} /></Field>
      <div className={styles.formFooter}><span>{specialForm.type === "dinero_recibido" ? "Queda visible como dinero a cuenta dentro de la cuenta corriente del cliente." : "Queda como ítem excepcional dentro de la cuenta corriente."}</span><Button onClick={submitSpecialMovement} disabled={saving}>{specialForm.type === "dinero_recibido" ? "Guardar dinero a cuenta" : "Guardar movimiento"}</Button></div>
    </section></div> : null}


    {quickPanel === "acciones" ? <div className={styles.panelOverlay}><section className={`${styles.panel} ${styles.bottomSheet}`}>
      <div className={styles.panelHead}><div><p>Acciones rápidas</p><h3>Resolver ahora</h3></div><button type="button" onClick={() => setQuickPanel(null)}>Cerrar</button></div>
      <div className={styles.quickActionList}>
        <Button onClick={() => openQuickPanel("operacion")}>Nuevo movimiento</Button>
        <Button variant="secondary" onClick={() => { if (sideOperation) startShipment(sideOperation); }} disabled={!sideOperation || !canEdit}>Nueva guía del seleccionado</Button>
        <Button variant="secondary" onClick={() => { if (sideOperation) startPayment(sideOperation); }} disabled={!sideOperation || !canCollect}>Cobrar seleccionado</Button>
        <Button variant="ghost" onClick={() => { if (sideOperation) startMoneyOnAccount(sideOperation); }} disabled={!sideOperation || !canEdit}>Dinero a cuenta</Button>
        <Button variant="ghost" onClick={() => { setQuickPanel(null); setCommandOpen(true); }}>Buscar cliente o guía</Button>
        <Button variant="ghost" onClick={() => { setQuickPanel(null); goToTab("cuenta", "cobros"); }}>Abrir cobros</Button>
      </div>
    </section></div> : null}


    {actionsOperation ? <div className={styles.panelOverlay}><section className={`${styles.panel} ${styles.bottomSheet}`}>
      <div className={styles.panelHead}><div><p>Acciones rápidas</p><h3>{actionsOperation.clients?.name ?? actionsOperation.public_code}</h3></div><button type="button" onClick={() => setActionsOperation(null)}>Cerrar</button></div>
      <div className={styles.quickActionList}>
        <Button variant="secondary" onClick={() => { setDetailOperation(actionsOperation); setActionsOperation(null); }}>Ver ficha y guías</Button>
        <Button variant="secondary" onClick={() => { startShipment(actionsOperation); setActionsOperation(null); }} disabled={!canEdit}>Nueva guía</Button>
        <Button variant="ghost" onClick={() => { openOperationScreen(actionsOperation, "cuenta"); setActionsOperation(null); }}>Ficha cliente</Button>
        <Button variant="ghost" onClick={() => { copyClientLink(actionsOperation); setActionsOperation(null); }}>Copiar link cliente</Button>
        <Button variant="ghost" onClick={() => { startMoneyOnAccount(actionsOperation); setActionsOperation(null); }}>Dinero a cuenta</Button>
        <Button variant="ghost" onClick={() => { startSpecial(actionsOperation); setActionsOperation(null); }}>Movimiento especial</Button>
      </div>
    </section></div> : null}

    {detailOperation ? <div className={styles.panelOverlay}><section className={styles.panel}>
      <div className={styles.panelHead}><div><p>Ficha cliente</p><h3>{detailOperation.clients?.name ?? detailOperation.public_code}</h3></div><button type="button" onClick={() => setDetailOperation(null)}>Cerrar</button></div>
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
            <div><span>Empresa</span><strong>{shipment.company ?? "Sin cargar"}</strong></div>
            <div><span>Número de guía</span><strong>{shipment.guide_number ?? "Sin número"}</strong></div>
            <div><span>Remito / comprobante</span><strong>{shipment.id.slice(0, 12).toUpperCase()}</strong></div>
            <div><span>Fecha despacho</span><strong>{formatDate(shipment.dispatch_date ?? undefined)}</strong></div>
            <div><span>Destinatario</span><strong>{shipment.recipient_name ?? "Sin cargar"}</strong></div>
            <div><span>DNI / CUIT</span><strong>{shipment.recipient_identity_number ?? "Sin cargar"}</strong></div>
            <div><span>Destino / domicilio</span><strong>{shipment.destination_detail ?? "Sin cargar"}</strong></div>
            <div><span>Valor declarado / real</span><strong>{formatMoney(toNumber(shipment.guide_amount))}</strong></div>
            <div><span>Total cliente</span><strong>{guideChargeLabel(shipment.company, toNumber(shipment.guide_amount))}</strong></div>
            <div><span>Condición guía</span><strong>{guidePaymentLabels[shipment.guide_payment_status]}</strong></div>
            <div><span>Pase USD</span><strong>{moneyUsd(toNumber(shipment.pass_usd_amount))}</strong></div>
            <div><span>Estado pase</span><strong>{shipmentPassStatus(shipment)}</strong></div>
            <div><span>Pagado del pase</span><strong>{moneyUsd(toNumber(shipment.pass_paid_usd_amount))}</strong></div>
            <div><span>Saldo del pase</span><strong>{moneyUsd(Math.max(toNumber(shipment.pass_usd_amount) - toNumber(shipment.pass_paid_usd_amount), 0))}</strong></div>
          </div>
        </details>) : <p>Sin guías cargadas.</p>}
      </div>
      <div className={styles.actions}><Button variant="secondary" onClick={() => startPayment(detailOperation)}>Cobrar</Button><Button variant="ghost" onClick={() => startMoneyOnAccount(detailOperation)}>Dinero a cuenta</Button><Button variant="ghost" onClick={() => startShipment(detailOperation)}>Agregar guía</Button><Button variant="ghost" onClick={() => startSpecial(detailOperation)}>Especial</Button><Button variant="ghost" onClick={() => copyClientLink(detailOperation)}>Copiar link</Button></div>
    </section></div> : null}

    {commandOpen ? <div className={styles.panelOverlay}><section className={`${styles.panel} ${styles.commandPanel}`}>
      <div className={styles.panelHead}><div><p>Comando rápido</p><h3>Buscar o ejecutar acción</h3></div><button type="button" onClick={() => setCommandOpen(false)}>Cerrar</button></div>
      <Input autoFocus value={filters.query} onChange={(event) => { setFilters({ ...filters, query: event.target.value }); goToTab("seguimiento"); }} placeholder="Cliente, guía, proveedor, destinatario..." />
      <div className={styles.quickActionList}>
        <Button onClick={() => { openQuickPanel("operacion"); setCommandOpen(false); }}>Nuevo movimiento guiado</Button>
        <Button variant="secondary" onClick={() => { goToTab("cuentas", "clientes"); setCommandOpen(false); }}>Abrir clientes</Button>
        <Button variant="secondary" onClick={() => { goToTab("cuenta", "cobros"); setCommandOpen(false); }}>Abrir cobros</Button>
        <Button variant="ghost" onClick={() => { if (sideOperation) startPayment(sideOperation); setCommandOpen(false); }} disabled={!sideOperation || !canCollect}>Cobrar cliente seleccionado</Button>
        <Button variant="ghost" onClick={() => { if (sideOperation) startMoneyOnAccount(sideOperation); setCommandOpen(false); }} disabled={!sideOperation || !canEdit}>Dinero a cuenta</Button>
      </div>
    </section></div> : null}

  </OwnerDesktopShell>;
}
