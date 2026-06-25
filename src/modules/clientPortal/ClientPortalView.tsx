import {
  DEFAULT_DOLLAR_RATE,
  calculateGuideCharge,
  clientLogisticsLabels,
  guidePaymentLabels,
  paymentMethodLabels,
} from "@/modules/controlBultos/types";
import { formatDate, formatMoney } from "@/shared/lib/format";
import type { Currency, FinancialStatus, GuidePaidBy, GuidePaymentStatus, LogisticsStatus, PaymentMethod } from "@/infrastructure/supabase/types";
import { BrandLockup } from "@/shared/components/BrandLockup";
import styles from "./ClientPortalView.module.css";

type PortalShipment = {
  company: string | null;
  guide_number: string | null;
  guide_amount: number;
  guide_paid_by: GuidePaidBy;
  guide_payment_status: GuidePaymentStatus;
  guide_payment_method?: PaymentMethod | null;
  guide_payment_currency?: Currency | null;
  guide_paid_amount?: number | null;
  recipient_name?: string | null;
  recipient_identity_number?: string | null;
  destination_detail?: string | null;
  guide_cost_amount?: number | null;
  guide_surcharge_percent?: number | null;
  guide_charge_amount?: number | null;
  pass_usd_amount?: number | null;
  pass_paid_usd_amount?: number | null;
  pass_date?: string | null;
  pass_note?: string | null;
  dispatch_date: string | null;
};

type PortalPayment = {
  concept: string;
  method: PaymentMethod;
  currency: Currency;
  amount: number;
  paid_at: string;
  note: string | null;
};

type PortalOperation = {
  id: string;
  public_code: string;
  operation_date: string;
  provider_name: string;
  package_count: number;
  logistics_status: LogisticsStatus;
  financial_status: FinancialStatus;
  note: string | null;
  pass_amount: number;
  total_amount: number;
  paid_amount_ars: number;
  paid_amount_usd: number;
  balance_amount: number;
  shipments: PortalShipment[];
  payments: PortalPayment[];
};

export type ClientPortalData = {
  client: {
    id: string;
    name: string;
    phone: string | null;
    notes: string | null;
  };
  operations: PortalOperation[];
};

function moneyUsd(value: number) {
  return `USD ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}`;
}

function statusTone(status: string) {
  if (status === "despachado" || status === "pago_total" || status === "pagada_por_cliente" || status === "reintegrada") return styles.ok;
  if (status === "pendiente" || status === "para_retirar" || status === "pendiente_reintegro") return styles.warn;
  return styles.info;
}

function shipmentPassTotal(shipment: PortalShipment) {
  return Number(shipment.pass_usd_amount || 0);
}

function shipmentPassPaid(shipment: PortalShipment) {
  return Math.min(Number(shipment.pass_paid_usd_amount || 0), shipmentPassTotal(shipment));
}

function shipmentPassBalance(shipment: PortalShipment) {
  return Math.max(shipmentPassTotal(shipment) - shipmentPassPaid(shipment), 0);
}

function operationPassUsd(operation: PortalOperation) {
  const guidePassTotal = operation.shipments.reduce((sum, shipment) => sum + shipmentPassTotal(shipment), 0);
  return guidePassTotal > 0 ? guidePassTotal : Number(operation.pass_amount || 0);
}

function operationPendingUsd(operation: PortalOperation) {
  const guideBalance = operation.shipments.reduce((sum, shipment) => sum + shipmentPassBalance(shipment), 0);
  return guideBalance > 0 ? guideBalance : operation.financial_status === "pago_total" ? 0 : operationPassUsd(operation);
}

function pendingPassUsd(operations: PortalOperation[]) {
  return operations.reduce((sum, operation) => sum + operationPendingUsd(operation), 0);
}

function paidPassUsd(operations: PortalOperation[]) {
  return operations.reduce((sum, operation) => sum + operation.shipments.reduce((subtotal, shipment) => subtotal + shipmentPassPaid(shipment), 0), 0);
}

function guideChargeLabel(shipment: PortalShipment) {
  const charge = shipment.guide_charge_amount ?? calculateGuideCharge(shipment.company, Number(shipment.guide_amount || 0));
  const hasSurcharge = Number(shipment.guide_surcharge_percent || 0) > 0;
  return hasSurcharge ? `${formatMoney(charge)} incl. ${shipment.guide_surcharge_percent}%` : formatMoney(charge);
}

function guidePaymentDetail(shipment: PortalShipment) {
  const value = guideChargeLabel(shipment);
  if (shipment.guide_payment_status === "pagada_por_cliente") return `Paga en destino / cliente: ${value}`;
  if (shipment.guide_payment_status === "pagada_por_jeremias") return `Pagada por Jeremías, a reintegrar: ${value}`;
  if (shipment.guide_payment_status === "pendiente_reintegro") return `Pendiente de reintegro: ${value}`;
  if (shipment.guide_payment_status === "reintegrada") return `Reintegrada: ${value}`;
  if (Number(shipment.guide_amount || 0) > 0) return `Pendiente: ${value}`;
  return "Pendiente de valor";
}

function whatsappHref(clientName: string) {
  const text = encodeURIComponent(`Hola, soy ${clientName}. Quiero consultar por mi pedido en Custodia360.`);
  return `https://wa.me/5493757653075?text=${text}`;
}

export function ClientPortalView({ data }: { data: ClientPortalData | null }) {
  if (!data) {
    return <main className={styles.page}>
      <section className={styles.notFound}>
        <span>Custodia360</span>
        <h1>Consulta no encontrada</h1>
        <p>El código no existe, expiró o la operación no está visible para cliente.</p>
        <a className={styles.primaryAction} href="https://wa.me/5493757653075" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>
      </section>
    </main>;
  }

  const pendingUsd = pendingPassUsd(data.operations);
  const paidUsd = paidPassUsd(data.operations);
  const allShipments = data.operations.flatMap((operation) => operation.shipments);
  const lastOperation = data.operations[0];
  const visibleStatus = lastOperation ? clientLogisticsLabels[lastOperation.logistics_status] : "En preparación";
  const lastUpdate = lastOperation?.operation_date ?? new Date().toISOString();

  return <main id="inicio" className={styles.page}>
    <header className={styles.headerCompact}>
      <div className={styles.portalBrand}><BrandLockup subtitle="Consulta privada" /></div>
      <a className={styles.helpLink} href={whatsappHref(data.client.name)} target="_blank" rel="noreferrer">WhatsApp</a>
    </header>

    <section className={styles.heroStatus}>
      <span className={`${styles.badge} ${statusTone(lastOperation?.logistics_status ?? "para_retirar")}`}>{visibleStatus}</span>
      <h1>Hola, {data.client.name}</h1>
      <p>{lastOperation?.logistics_status === "despachado" ? `Tu pedido está despachado. Tenés ${allShipments.length} guías disponibles.` : "Tu pedido está en seguimiento privado."}</p>
      <div className={styles.heroMoney}>
        <div><span>Pendiente actual</span><strong>{moneyUsd(pendingUsd)}</strong><small>{formatMoney(pendingUsd * DEFAULT_DOLLAR_RATE)} hoy</small></div>
        <div><span>Guías</span><strong>{allShipments.length}</strong><small>Dólar ${DEFAULT_DOLLAR_RATE}</small></div>
      </div>
      <div className={styles.heroActions}>
        <a className={styles.primaryAction} href="#guias">Ver guías</a>
        <a className={styles.secondaryAction} href={whatsappHref(data.client.name)} target="_blank" rel="noreferrer">Consultar</a>
      </div>
      <small className={styles.updated}>Última actualización: {formatDate(lastUpdate)}</small>
    </section>

    <section id="pedidos" className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <div><span>Pedido activo</span><h2>{lastOperation?.public_code ?? "Sin código"}</h2></div>
        <strong>{data.operations.length} operación</strong>
      </div>
      {data.operations.map((operation) => <article key={operation.id} className={styles.orderRow}>
        <div>
          <strong>{operation.provider_name}</strong>
          <span>{formatDate(operation.operation_date)} · {operation.package_count} bultos · {operation.shipments.length} guías</span>
        </div>
        <span className={`${styles.badge} ${statusTone(operation.logistics_status)}`}>{clientLogisticsLabels[operation.logistics_status]}</span>
      </article>)}
    </section>

    <section id="guias" className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <div><span>Guías disponibles</span><h2>Tocá cada guía para ver detalle</h2></div>
        <strong>{allShipments.length}</strong>
      </div>
      <div className={styles.guideList}>
        {allShipments.length ? data.operations.flatMap((operation) => operation.shipments.map((shipment, index) => <details key={`${operation.id}-${shipment.guide_number ?? index}`} className={styles.guideDetail}>
          <summary>
            <div>
              <strong>{shipment.guide_number ?? `Guía ${index + 1}`}</strong>
              <span>{shipment.company ?? "Empresa pendiente"} · {shipment.recipient_name ?? "Destinatario pendiente"}</span>
            </div>
            <b>Ver</b>
          </summary>
          <div className={styles.detailGrid}>
            <div><span>Destinatario</span><strong>{shipment.recipient_name ?? "Sin cargar"}</strong></div>
            <div><span>DNI / CUIT</span><strong>{shipment.recipient_identity_number ?? "Sin cargar"}</strong></div>
            <div><span>Empresa</span><strong>{shipment.company ?? "Sin cargar"}</strong></div>
            <div><span>Fecha despacho</span><strong>{formatDate(shipment.dispatch_date ?? undefined)}</strong></div>
            <div><span>Destino</span><strong>{shipment.destination_detail ?? "Sin cargar"}</strong></div>
            <div><span>Condición guía</span><strong>{guidePaymentLabels[shipment.guide_payment_status]}</strong></div>
            <div><span>Resumen guía</span><strong>{guidePaymentDetail(shipment)}</strong></div>
            <div><span>Pase</span><strong>{moneyUsd(shipmentPassTotal(shipment))}</strong></div>
            <div><span>Pagado</span><strong>{moneyUsd(shipmentPassPaid(shipment))}</strong></div>
            <div><span>Saldo</span><strong>{moneyUsd(shipmentPassBalance(shipment))}</strong></div>
          </div>
          <div className={styles.guideActions}>
            <a href={whatsappHref(data.client.name)} target="_blank" rel="noreferrer">Consultar guía</a>
          </div>
        </details>)) : <p className={styles.empty}>Todavía no hay guías cargadas.</p>}
      </div>
    </section>

    <section id="pagos" className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <div><span>Cuenta actual</span><h2>Saldo y pagos visibles</h2></div>
      </div>
      <div className={styles.accountSummary}>
        <div><span>Pendiente</span><strong>{moneyUsd(pendingUsd)}</strong><small>{formatMoney(pendingUsd * DEFAULT_DOLLAR_RATE)} hoy</small></div>
        <div><span>Pagado</span><strong>{moneyUsd(paidUsd)}</strong><small>Registrado en pases</small></div>
      </div>
      <details className={styles.accordion}>
        <summary>Ver pagos registrados</summary>
        {data.operations.some((operation) => operation.payments.length) ? data.operations.flatMap((operation) => operation.payments.map((payment, index) => <div key={`${operation.id}-${index}`} className={styles.paymentRow}>
          <strong>{payment.concept}</strong>
          <span>{paymentMethodLabels[payment.method]} · {payment.currency === "ARS" ? formatMoney(payment.amount) : moneyUsd(payment.amount)}</span>
        </div>)) : <p className={styles.empty}>Sin pagos visibles registrados.</p>}
      </details>
      <p className={styles.disclaimer}>El equivalente en pesos puede variar según el dólar del día.</p>
    </section>

    <section id="ayuda" className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <div><span>Ayuda</span><h2>Consulta directa</h2></div>
      </div>
      <p className={styles.empty}>Si no tenés código, no encontrás una guía o necesitás confirmar algo, escribí directo por WhatsApp.</p>
      <a className={styles.primaryAction} href={whatsappHref(data.client.name)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a>
    </section>

    <nav className={styles.clientBottomNav} aria-label="Navegación cliente">
      <a href="#inicio"><span>●</span><strong>Inicio</strong></a>
      <a href="#pedidos"><span>▦</span><strong>Pedidos</strong></a>
      <a href="#guias"><span>⌁</span><strong>Guías</strong></a>
      <a href="#pagos"><span>$</span><strong>Pagos</strong></a>
      <a href="#ayuda"><span>?</span><strong>Ayuda</strong></a>
    </nav>
  </main>;
}
