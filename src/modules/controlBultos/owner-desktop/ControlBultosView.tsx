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
import { DataTable } from "@/shared/components/Table";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { calculateOperationDraftTotal, calculateOperationTotals, toNumber } from "../lib/calculations";
import {
  createOperation,
  createPayment,
  createQuickClient,
  getControlBultosData,
  saveShipment,
  updateLogisticsStatus,
  updateOperation,
} from "../services/controlBultos.service";
import type { ClientQuickInput, ControlBultosData, ControlOperation, OperationFormInput, PaymentInput, ShipmentInput } from "../types";
import {
  financialLabels,
  financialStatusOptions,
  guidePaymentLabels,
  logisticsLabels,
  logisticsStatusOptions,
  paymentMethodLabels,
  paymentMethodOptions,
} from "../types";
import styles from "./ControlBultosView.module.css";

const today = () => new Date().toISOString().slice(0, 10);

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
  };
}

function emptyPaymentForm(operationId = ""): PaymentInput {
  return {
    operation_id: operationId,
    concept: "Adelanto / pago de operacion",
    method: "efectivo_pesos",
    currency: "ARS",
    amount: 0,
    note: "",
    markGuideReimbursed: false,
  };
}

function moneyUsd(value: number) {
  return `USD ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}`;
}

function statusClass(status: LogisticsStatus | GuidePaymentStatus | string) {
  if (status === "despachado" || status === "pago_total" || status === "reintegrada" || status === "pagada_por_cliente") return styles.ok;
  if (status === "pendiente_reintegro" || status === "pendiente" || status === "para_retirar") return styles.warn;
  if (status === "retirado" || status === "paso" || status === "deposito_1" || status === "pago_parcial") return styles.info;
  return styles.neutral;
}

export function ControlBultosView() {
  const [data, setData] = useState<ControlBultosData>({ clients: [], operations: [] });
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<ClientQuickInput>(emptyClientForm);
  const [operationForm, setOperationForm] = useState<OperationFormInput>(emptyOperationForm());
  const [shipmentOperation, setShipmentOperation] = useState<ControlOperation | null>(null);
  const [shipmentForm, setShipmentForm] = useState<ShipmentInput>(emptyShipmentForm());
  const [paymentOperation, setPaymentOperation] = useState<ControlOperation | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentInput>(emptyPaymentForm());
  const [detailOperation, setDetailOperation] = useState<ControlOperation | null>(null);
  const [filters, setFilters] = useState({
    query: "",
    logistics_status: "",
    financial_status: "",
    date: "",
    shipping_company: "",
  });

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
      if (!operationForm.client_id && firstClient) {
        setOperationForm(emptyOperationForm(firstClient.id, toNumber(firstClient.default_price_per_package)));
      }
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

  const filteredOperations = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return data.operations.filter((operation) => {
      const shipment = operation.operation_shipments[0];
      const haystack = [
        operation.public_code,
        operation.clients?.name,
        operation.clients?.phone,
        operation.provider_name,
        shipment?.company,
        shipment?.guide_number,
        operation.note,
      ].join(" ").toLowerCase();

      return (!query || haystack.includes(query))
        && (!filters.logistics_status || operation.logistics_status === filters.logistics_status)
        && (!filters.financial_status || operation.financial_status === filters.financial_status)
        && (!filters.date || operation.operation_date === filters.date)
        && (!filters.shipping_company || (shipment?.company ?? "").toLowerCase().includes(filters.shipping_company.toLowerCase()));
    });
  }, [data.operations, filters]);

  const kpis = useMemo(() => {
    return data.operations.reduce((acc, operation) => {
      const totals = calculateOperationTotals(operation);
      acc.totalPackages += operation.package_count;
      acc.balance += totals.balanceArs;
      if (operation.logistics_status === "para_retirar") acc.pendingPickup += 1;
      if (operation.logistics_status === "despachado") acc.dispatched += 1;
      acc.guideReimbursements += operation.operation_shipments
        .filter((shipment) => shipment.guide_payment_status === "pendiente_reintegro")
        .reduce((sum, shipment) => sum + toNumber(shipment.guide_amount), 0);
      return acc;
    }, { totalPackages: 0, pendingPickup: 0, dispatched: 0, balance: 0, guideReimbursements: 0 });
  }, [data.operations]);

  const draftTotal = calculateOperationDraftTotal(operationForm);

  const selectedClient = data.clients.find((client) => client.id === operationForm.client_id);

  const submitClient = async () => {
    if (!clientForm.name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const client = await createQuickClient(clientForm);
      setMessage(`Cliente creado: ${client.name}`);
      setClientForm(emptyClientForm);
      await load();
      setOperationForm(emptyOperationForm(client.id, toNumber(client.default_price_per_package)));
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
        setMessage("Operacion actualizada.");
      } else {
        await createOperation(operationForm);
        setMessage("Operacion creada.");
      }
      setEditingId(null);
      setOperationForm(emptyOperationForm(operationForm.client_id, selectedClient?.default_price_per_package ?? 0));
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la operacion.");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startShipment = (operation: ControlOperation) => {
    const shipment = operation.operation_shipments[0];
    setShipmentOperation(operation);
    setShipmentForm(shipment ? {
      operation_id: operation.id,
      company: shipment.company ?? "",
      guide_number: shipment.guide_number ?? "",
      guide_amount: toNumber(shipment.guide_amount),
      dispatch_date: shipment.dispatch_date,
      paid: shipment.guide_payment_status !== "pendiente",
      guide_paid_by: shipment.guide_paid_by,
      guide_payment_status: shipment.guide_payment_status,
      method: shipment.guide_payment_method ?? "efectivo_pesos",
      currency: shipment.guide_payment_currency ?? "ARS",
      amount: toNumber(shipment.guide_paid_amount),
    } : emptyShipmentForm(operation.id));
  };

  const startPayment = (operation: ControlOperation) => {
    setPaymentOperation(operation);
    setPaymentForm(emptyPaymentForm(operation.id));
  };

  const submitShipment = async () => {
    if (!shipmentOperation) return;
    if (!canEdit) return setError("Tu rol no permite cargar guias.");

    setSaving(true);
    setError("");

    try {
      await saveShipment(shipmentForm);
      setMessage("Guia guardada.");
      setShipmentOperation(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la guia.");
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async () => {
    if (!paymentOperation) return;
    if (!canCollect) return setError("Tu rol no permite cargar pagos.");

    setSaving(true);
    setError("");

    try {
      await createPayment(paymentForm);
      setMessage("Pago cargado.");
      setPaymentOperation(null);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo cargar el pago.");
    } finally {
      setSaving(false);
    }
  };

  const copyClientLink = async (operation: ControlOperation) => {
    const code = operation.public_code;
    const url = `${window.location.origin}/consulta/${code}`;
    await navigator.clipboard.writeText(url);
    setMessage("Link de consulta copiado.");
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
    setOperationForm((current) => ({
      ...current,
      client_id: clientId,
      price_per_package: toNumber(client?.default_price_per_package),
    }));
  };

  const onShipmentPaidByChange = (paidBy: GuidePaidBy) => {
    const status: GuidePaymentStatus = paidBy === "jeremias"
      ? "pendiente_reintegro"
      : paidBy === "cliente"
        ? "pagada_por_cliente"
        : "pendiente";
    setShipmentForm((current) => ({
      ...current,
      paid: paidBy !== "pendiente",
      guide_paid_by: paidBy,
      guide_payment_status: status,
      amount: current.amount || current.guide_amount,
    }));
  };

  const onPaymentMethodChange = (method: PaymentMethod, target: "payment" | "shipment") => {
    const currency = paymentMethodOptions.find((item) => item.value === method)?.currency ?? "ARS";
    if (target === "payment") setPaymentForm((current) => ({ ...current, method, currency }));
    if (target === "shipment") setShipmentForm((current) => ({ ...current, method, currency }));
  };

  return <OwnerDesktopShell title="Control de Bultos">
    <section className={styles.hero}>
      <div>
        <p>Fase 1 operativa</p>
        <h2>Control de Bultos</h2>
        <span>{demoMode ? "Demo local sin Supabase: clientes, bultos, guias, pagos, saldos y consulta por link privado." : "Operaciones reales con Supabase: clientes, bultos, guias, pagos, saldos y consulta por link privado."}</span>
      </div>
      <div className={styles.roleBox}>
        <span>{demoMode ? "Demo" : "Usuario"}</span>
        <strong>{profile?.full_name ?? profile?.email ?? "Validando sesion"}</strong>
        <small>{demoMode ? "Los cambios quedan guardados en este navegador" : profile?.role ? `Rol: ${profile.role}` : "Perfil requerido para operar"}</small>
      </div>
    </section>

    {message ? <div className={styles.success}>{message}</div> : null}
    {error ? <div className={styles.error}>{error}</div> : null}

    <section className={styles.kpis}>
      <Card className={styles.kpi}><span>Total bultos</span><strong>{kpis.totalPackages}</strong></Card>
      <Card className={styles.kpi}><span>Para retirar</span><strong>{kpis.pendingPickup}</strong></Card>
      <Card className={styles.kpi}><span>Despachados</span><strong>{kpis.dispatched}</strong></Card>
      <Card className={styles.kpi}><span>Saldo pendiente</span><strong>{canSeeMoney ? formatMoney(kpis.balance) : "-"}</strong></Card>
      <Card className={styles.kpi}><span>Guias a reintegrar</span><strong>{canSeeMoney ? formatMoney(kpis.guideReimbursements) : "-"}</strong></Card>
    </section>

    <section className={styles.setupGrid}>
      <Card className={styles.formCard}>
        <div className={styles.cardHead}>
          <div>
            <p>Alta rapida</p>
            <h3>Cliente</h3>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Field label="Nombre">
            <Input value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} placeholder="Cliente / marca" disabled={!canEdit || saving} />
          </Field>
          <Field label="Telefono">
            <Input value={clientForm.phone} onChange={(event) => setClientForm({ ...clientForm, phone: event.target.value })} placeholder="+54..." disabled={!canEdit || saving} />
          </Field>
          <Field label="Valor habitual por bulto">
            <Input type="number" min="0" value={clientForm.default_price_per_package} onChange={(event) => setClientForm({ ...clientForm, default_price_per_package: Number(event.target.value || 0) })} disabled={!canEdit || saving} />
          </Field>
          <Field label="Notas">
            <Input value={clientForm.notes ?? ""} onChange={(event) => setClientForm({ ...clientForm, notes: event.target.value })} placeholder="Condiciones, direccion, aviso..." disabled={!canEdit || saving} />
          </Field>
        </div>
        <Button onClick={submitClient} disabled={!canEdit || saving}>Crear cliente</Button>
      </Card>

      <Card className={styles.formCard}>
        <div className={styles.cardHead}>
          <div>
            <p>{editingId ? "Edicion" : "Nueva operacion"}</p>
            <h3>{editingId ? "Editar bultos" : "Crear operacion"}</h3>
          </div>
          {editingId ? <Button variant="ghost" onClick={() => { setEditingId(null); setOperationForm(emptyOperationForm(operationForm.client_id, selectedClient?.default_price_per_package ?? 0)); }}>Cancelar</Button> : null}
        </div>
        <div className={styles.formGrid}>
          <Field label="Cliente">
            <Select value={operationForm.client_id} onChange={(event) => onOperationClientChange(event.target.value)} disabled={!canEdit || saving}>
              <option value="">Seleccionar cliente</option>
              {data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </Select>
          </Field>
          <Field label="Local / proveedor">
            <Input value={operationForm.provider_name} onChange={(event) => setOperationForm({ ...operationForm, provider_name: event.target.value })} placeholder="Local, proveedor o deposito" disabled={!canEdit || saving} />
          </Field>
          <Field label="Fecha">
            <Input type="date" value={operationForm.operation_date} onChange={(event) => setOperationForm({ ...operationForm, operation_date: event.target.value })} disabled={!canEdit || saving} />
          </Field>
          <Field label="Cantidad de bultos">
            <Input type="number" min="1" value={operationForm.package_count} onChange={(event) => setOperationForm({ ...operationForm, package_count: Number(event.target.value || 1) })} disabled={!canEdit || saving} />
          </Field>
          <Field label="Valor por bulto">
            <Input type="number" min="0" value={operationForm.price_per_package} onChange={(event) => setOperationForm({ ...operationForm, price_per_package: Number(event.target.value || 0) })} disabled={!canEdit || saving} />
          </Field>
          <Field label="Valor del pase">
            <Input type="number" min="0" value={operationForm.pass_amount} onChange={(event) => setOperationForm({ ...operationForm, pass_amount: Number(event.target.value || 0) })} disabled={!canEdit || saving} />
          </Field>
          <Field label="Estado logistico">
            <Select value={operationForm.logistics_status} onChange={(event) => setOperationForm({ ...operationForm, logistics_status: event.target.value as LogisticsStatus })} disabled={!canEdit || saving}>
              {logisticsStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </Field>
          <Field label="Visible cliente">
            <Select value={operationForm.visible_to_client ? "si" : "no"} onChange={(event) => setOperationForm({ ...operationForm, visible_to_client: event.target.value === "si" })} disabled={!canEdit || saving}>
              <option value="si">Si</option>
              <option value="no">No</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones internas / visibles si corresponde">
          <Textarea value={operationForm.note} onChange={(event) => setOperationForm({ ...operationForm, note: event.target.value })} disabled={!canEdit || saving} />
        </Field>
        <div className={styles.formFooter}>
          <span>Total bultos + pase estimado: <strong>{formatMoney(draftTotal)}</strong></span>
          <Button onClick={submitOperation} disabled={!canEdit || saving}>{editingId ? "Guardar cambios" : "Crear operacion"}</Button>
        </div>
      </Card>
    </section>

    <Card className={styles.filters}>
      <Field label="Buscar">
        <Input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Cliente, telefono, guia, proveedor..." />
      </Field>
      <Field label="Estado logistico">
        <Select value={filters.logistics_status} onChange={(event) => setFilters({ ...filters, logistics_status: event.target.value })}>
          <option value="">Todos</option>
          {logisticsStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </Field>
      <Field label="Estado financiero">
        <Select value={filters.financial_status} onChange={(event) => setFilters({ ...filters, financial_status: event.target.value })}>
          <option value="">Todos</option>
          {financialStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </Field>
      <Field label="Fecha">
        <Input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
      </Field>
      <Field label="Empresa envio">
        <Input value={filters.shipping_company} onChange={(event) => setFilters({ ...filters, shipping_company: event.target.value })} placeholder="Via Cargo, OCA..." />
      </Field>
    </Card>

    {loading ? <Card className={styles.empty}>Cargando operaciones...</Card> : null}

    {!loading && filteredOperations.length === 0 ? <Card className={styles.empty}>No hay operaciones para los filtros seleccionados.</Card> : null}

    {!loading && filteredOperations.length > 0 ? <>
      <div className={styles.desktopTable}>
        <Card pad={false}>
          <DataTable>
            <thead>
              <tr>
                <th>Operacion</th>
                <th>Cliente</th>
                <th>Bultos</th>
                <th>Logistica</th>
                <th>Guia</th>
                <th>Finanzas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map((operation) => {
                const shipment = operation.operation_shipments[0];
                const totals = calculateOperationTotals(operation);
                return <tr key={operation.id}>
                  <td><strong>{operation.public_code}</strong><br /><small>{formatDate(operation.operation_date)} - {operation.provider_name}</small></td>
                  <td>{operation.clients?.name ?? "Sin cliente"}<br /><small>{operation.clients?.phone ?? "Sin telefono"}</small></td>
                  <td><strong>{operation.package_count}</strong><br /><small>{formatMoney(totals.totalPackages)}</small></td>
                  <td>
                    {canEdit ? <Select value={operation.logistics_status} onChange={(event) => changeStatus(operation.id, event.target.value as LogisticsStatus)} disabled={saving}>
                      {logisticsStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </Select> : <span className={`${styles.badge} ${statusClass(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>}
                  </td>
                  <td>
                    <strong>{shipment?.company ?? "Sin empresa"}</strong><br />
                    <small>{shipment?.guide_number ?? "Sin guia"}</small><br />
                    <span className={`${styles.badge} ${statusClass(shipment?.guide_payment_status ?? "pendiente")}`}>{guidePaymentLabels[shipment?.guide_payment_status ?? "pendiente"]}</span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusClass(operation.financial_status)}`}>{financialLabels[operation.financial_status]}</span><br />
                    <small>Total {formatMoney(totals.totalAmount)}</small><br />
                    <small>Saldo {formatMoney(totals.balanceArs)} {totals.paidUsd ? ` / ${moneyUsd(totals.paidUsd)} pagado` : ""}</small>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="secondary" onClick={() => setDetailOperation(operation)}>Ficha</Button>
                      <Button variant="ghost" onClick={() => startEdit(operation)} disabled={!canEdit}>Editar</Button>
                      <Button variant="ghost" onClick={() => startShipment(operation)} disabled={!canEdit}>Guia</Button>
                      <Button variant="ghost" onClick={() => startPayment(operation)} disabled={!canCollect}>Pago</Button>
                      <Button variant="ghost" onClick={() => copyClientLink(operation)}>Link</Button>
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
          </DataTable>
        </Card>
      </div>

      <div className={styles.mobileList}>
        {filteredOperations.map((operation) => {
          const shipment = operation.operation_shipments[0];
          const totals = calculateOperationTotals(operation);
          return <article key={operation.id} className={styles.operationCard}>
            <div className={styles.operationCardHead}>
              <div>
                <strong>{operation.public_code}</strong>
                <span>{operation.clients?.name ?? "Sin cliente"}</span>
              </div>
              <span className={`${styles.badge} ${statusClass(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>
            </div>
            <div className={styles.mobileFacts}>
              <span>{operation.package_count} bultos</span>
              <span>{operation.provider_name}</span>
              <span>{shipment?.company ?? "Sin envio"}</span>
              <span>{shipment?.guide_number ?? "Sin guia"}</span>
            </div>
            <div className={styles.mobileMoney}>
              <span>Total {formatMoney(totals.totalAmount)}</span>
              <strong>Saldo {formatMoney(totals.balanceArs)}</strong>
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => setDetailOperation(operation)}>Ficha</Button>
              <Button variant="ghost" onClick={() => startShipment(operation)} disabled={!canEdit}>Guia</Button>
              <Button variant="ghost" onClick={() => startPayment(operation)} disabled={!canCollect}>Pago</Button>
              <Button variant="ghost" onClick={() => copyClientLink(operation)}>Link</Button>
            </div>
          </article>;
        })}
      </div>
    </> : null}

    {shipmentOperation ? <div className={styles.panelOverlay}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div><p>Cargar guia</p><h3>{shipmentOperation.public_code}</h3></div>
          <button type="button" onClick={() => setShipmentOperation(null)}>Cerrar</button>
        </div>
        <div className={styles.formGrid}>
          <Field label="Empresa de envio">
            <Input value={shipmentForm.company} onChange={(event) => setShipmentForm({ ...shipmentForm, company: event.target.value })} />
          </Field>
          <Field label="Numero de guia">
            <Input value={shipmentForm.guide_number} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_number: event.target.value })} />
          </Field>
          <Field label="Valor de guia">
            <Input type="number" min="0" value={shipmentForm.guide_amount} onChange={(event) => setShipmentForm({ ...shipmentForm, guide_amount: Number(event.target.value || 0), amount: Number(event.target.value || 0) })} />
          </Field>
          <Field label="Fecha despacho">
            <Input type="date" value={shipmentForm.dispatch_date ?? ""} onChange={(event) => setShipmentForm({ ...shipmentForm, dispatch_date: event.target.value || null })} />
          </Field>
          <Field label="La guia ya fue pagada">
            <Select value={shipmentForm.paid ? "si" : "no"} onChange={(event) => setShipmentForm({ ...shipmentForm, paid: event.target.value === "si", guide_paid_by: event.target.value === "si" ? shipmentForm.guide_paid_by : "pendiente", guide_payment_status: event.target.value === "si" ? shipmentForm.guide_payment_status : "pendiente" })}>
              <option value="no">No</option>
              <option value="si">Si</option>
            </Select>
          </Field>
          {shipmentForm.paid ? <Field label="Quien pago">
            <Select value={shipmentForm.guide_paid_by} onChange={(event) => onShipmentPaidByChange(event.target.value as GuidePaidBy)}>
              <option value="pendiente">Seleccionar</option>
              <option value="jeremias">Jeremias</option>
              <option value="cliente">Cliente</option>
            </Select>
          </Field> : null}
          {shipmentForm.paid ? <Field label="Metodo">
            <Select value={shipmentForm.method} onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod, "shipment")}>
              {paymentMethodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </Field> : null}
          {shipmentForm.paid ? <Field label="Monto pagado">
            <Input type="number" min="0" value={shipmentForm.amount ?? 0} onChange={(event) => setShipmentForm({ ...shipmentForm, amount: Number(event.target.value || 0) })} />
          </Field> : null}
        </div>
        <div className={styles.formFooter}>
          <span>{shipmentForm.guide_paid_by === "jeremias" ? "Quedara pendiente de reintegro del cliente." : shipmentForm.guide_paid_by === "cliente" ? "Quedara registrada como pagada por cliente." : "La guia queda pendiente."}</span>
          <Button onClick={submitShipment} disabled={saving}>Guardar guia</Button>
        </div>
      </section>
    </div> : null}

    {paymentOperation ? <div className={styles.panelOverlay}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div><p>Cargar pago</p><h3>{paymentOperation.public_code}</h3></div>
          <button type="button" onClick={() => setPaymentOperation(null)}>Cerrar</button>
        </div>
        <div className={styles.formGrid}>
          <Field label="Concepto">
            <Input value={paymentForm.concept} onChange={(event) => setPaymentForm({ ...paymentForm, concept: event.target.value })} />
          </Field>
          <Field label="Metodo">
            <Select value={paymentForm.method} onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod, "payment")}>
              {paymentMethodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </Field>
          <Field label="Moneda">
            <Select value={paymentForm.currency} onChange={(event) => setPaymentForm({ ...paymentForm, currency: event.target.value as Currency })}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </Field>
          <Field label="Monto">
            <Input type="number" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value || 0) })} />
          </Field>
        </div>
        <Field label="Nota">
          <Textarea value={paymentForm.note ?? ""} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} />
        </Field>
        {paymentOperation.operation_shipments.some((shipment) => shipment.guide_payment_status === "pendiente_reintegro") ? <label className={styles.checkbox}>
          <input type="checkbox" checked={!!paymentForm.markGuideReimbursed} onChange={(event) => setPaymentForm({ ...paymentForm, markGuideReimbursed: event.target.checked })} />
          Marcar guia como reintegrada
        </label> : null}
        <div className={styles.formFooter}>
          <span>Los pagos en USD se muestran separados. No se convierten sin cotizacion configurada.</span>
          <Button onClick={submitPayment} disabled={saving}>Cargar pago</Button>
        </div>
      </section>
    </div> : null}

    {detailOperation ? <div className={styles.panelOverlay}>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div><p>Ficha operativa</p><h3>{detailOperation.public_code}</h3></div>
          <button type="button" onClick={() => setDetailOperation(null)}>Cerrar</button>
        </div>
        <div className={styles.detailGrid}>
          <div><span>Cliente</span><strong>{detailOperation.clients?.name ?? "-"}</strong></div>
          <div><span>Proveedor</span><strong>{detailOperation.provider_name}</strong></div>
          <div><span>Bultos</span><strong>{detailOperation.package_count}</strong></div>
          <div><span>Estado</span><strong>{logisticsLabels[detailOperation.logistics_status]}</strong></div>
          <div><span>Finanzas</span><strong>{financialLabels[detailOperation.financial_status]}</strong></div>
          <div><span>Link cliente</span><strong>/consulta/{detailOperation.public_code}</strong></div>
        </div>
        <div className={styles.timeline}>
          <h4>Pagos cargados</h4>
          {detailOperation.operation_payments.length ? detailOperation.operation_payments.map((payment) => <div key={payment.id}>
            <strong>{payment.concept}</strong>
            <span>{paymentMethodLabels[payment.method]} - {payment.currency === "ARS" ? formatMoney(payment.amount) : moneyUsd(payment.amount)}</span>
          </div>) : <p>Sin pagos cargados.</p>}
        </div>
        <div className={styles.timeline}>
          <h4>Observaciones</h4>
          <p>{detailOperation.note ?? "Sin observaciones."}</p>
        </div>
      </section>
    </div> : null}
  </OwnerDesktopShell>;
}
