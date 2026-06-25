import {
  DEFAULT_DOLLAR_RATE,
  calculateGuideCharge,
  clientLogisticsLabels,
  financialLabels,
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

function operationPassUsd(operation: PortalOperation) {
  const guidePassTotal = operation.shipments.reduce((sum, shipment) => sum + Number(shipment.pass_usd_amount || 0), 0);
  return guidePassTotal > 0 ? guidePassTotal : Number(operation.pass_amount || 0);
}

function passArs(operation: PortalOperation) {
  return operationPassUsd(operation) * DEFAULT_DOLLAR_RATE;
}

function pendingPassUsd(operations: PortalOperation[]) {
  return operations
    .filter((operation) => operation.financial_status !== "pago_total")
    .reduce((sum, operation) => sum + operationPassUsd(operation), 0);
}

function guideChargeLabel(shipment: PortalShipment) {
  const charge = shipment.guide_charge_amount ?? calculateGuideCharge(shipment.company, Number(shipment.guide_amount || 0));
  const hasSurcharge = Number(shipment.guide_surcharge_percent || 0) > 0;
  return hasSurcharge ? `${formatMoney(charge)} (incluye ${shipment.guide_surcharge_percent}%)` : formatMoney(charge);
}

function guidePaymentDetail(shipment: PortalShipment) {
  const value = guideChargeLabel(shipment);
  if (shipment.guide_payment_status === "pagada_por_cliente") return `Guía pagada por el cliente/en destino: ${value}`;
  if (shipment.guide_payment_status === "pagada_por_jeremias") return `Guía pagada por Jeremías, a reintegrar: ${value}`;
  if (shipment.guide_payment_status === "pendiente_reintegro") return `Guía pendiente de reintegro: ${value}`;
  if (shipment.guide_payment_status === "reintegrada") return `Guía reintegrada: ${value}`;
  if (Number(shipment.guide_amount || 0) > 0) return `Guía no pagada / pendiente: ${value}`;
  return "Guía pendiente de valor";
}

export function ClientPortalView({ data }: { data: ClientPortalData | null }) {
  if (!data) {
    return <main className={styles.page}>
      <section className={styles.notFound}>
        <span>Custodia360</span>
        <h1>Consulta no encontrada</h1>
        <p>El código no existe, expiró o la operación no está visible para cliente.</p>
      </section>
    </main>;
  }

  const pendingUsd = pendingPassUsd(data.operations);
  const allShipments = data.operations.flatMap((operation) => operation.shipments);
  const destinationPaidGuides = allShipments.filter((shipment) => shipment.guide_payment_status === "pagada_por_cliente").length;

  return <main id="inicio" className={styles.page}>
    <header className={styles.header}>
      <div>
        <div className={styles.portalBrand}><BrandLockup subtitle="Consulta privada" /></div>
        <h1>{data.client.name}</h1>
        <p>Consulta privada: estado de pedidos, guías cargadas, pases pendientes y contacto directo.</p>
      </div>
      <strong>Cliente {data.client.id.slice(0, 8).toUpperCase()}</strong>
    </header>

    <section id="resumen" className={styles.summary}>
      <div><span>Pedidos</span><strong>{data.operations.length}</strong></div>
      <div><span>Pases pendientes</span><strong>{moneyUsd(pendingUsd)}</strong></div>
      <div><span>Equivalente hoy</span><strong>{formatMoney(pendingUsd * DEFAULT_DOLLAR_RATE)}</strong></div>
      <div><span>Guías</span><strong>{allShipments.length}</strong></div>
      <div><span>Guías destino</span><strong>{destinationPaidGuides}</strong></div>
      <div><span>Dólar del día</span><strong>${DEFAULT_DOLLAR_RATE}</strong></div>
    </section>

    <section id="pedidos" className={styles.list}>
      {data.operations.map((operation) => {
        const visibleStatus = clientLogisticsLabels[operation.logistics_status];
        return <article key={operation.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <strong>{operation.public_code}</strong>
              <span>{formatDate(operation.operation_date)} - {operation.provider_name}</span>
            </div>
            <span className={`${styles.badge} ${statusTone(operation.logistics_status)}`}>{visibleStatus}</span>
          </div>

          <div className={styles.grid}>
            <div><span>Cantidad</span><strong>{operation.package_count} bultos</strong></div>
            <div><span>Pases USD</span><strong>{moneyUsd(operationPassUsd(operation))}</strong></div>
            <div><span>Equivalente hoy</span><strong>{formatMoney(passArs(operation))}</strong></div>
            <div><span>Estado financiero</span><strong>{financialLabels[operation.financial_status]}</strong></div>
          </div>

          <div id="guias" className={styles.payments}>
            <h2>{operation.logistics_status === "despachado" ? "Guías cargadas" : "Guías / pedidos"}</h2>
            {operation.shipments.length ? operation.shipments.map((shipment, index) => <details key={`${operation.id}-${shipment.guide_number ?? index}`} className={styles.guideDetail}>
              <summary>
                <strong>{shipment.guide_number ?? `Guía ${index + 1}`}</strong>
                <span>{shipment.company ?? "Empresa pendiente"} · {shipment.recipient_name ?? "Destinatario pendiente"}</span>
              </summary>
              <div className={styles.grid}>
                <div><span>Destinatario</span><strong>{shipment.recipient_name ?? "Sin cargar"}</strong></div>
                <div><span>DNI / identidad</span><strong>{shipment.recipient_identity_number ?? "Sin cargar"}</strong></div>
                <div><span>Empresa</span><strong>{shipment.company ?? "Sin cargar"}</strong></div>
                <div><span>Fecha despacho</span><strong>{formatDate(shipment.dispatch_date ?? undefined)}</strong></div>
                <div><span>Valor real guía</span><strong>{formatMoney(Number(shipment.guide_amount || 0))}</strong></div>
                <div><span>Total guía cliente</span><strong>{guideChargeLabel(shipment)}</strong></div>
                <div><span>Pase USD</span><strong>{moneyUsd(Number(shipment.pass_usd_amount || 0))}</strong></div>
                <div><span>Pase hoy</span><strong>{formatMoney(Number(shipment.pass_usd_amount || 0) * DEFAULT_DOLLAR_RATE)}</strong></div>
                <div><span>Fecha pase</span><strong>{formatDate(shipment.pass_date ?? undefined)}</strong></div>
                <div><span>Estado guía</span><strong>{guidePaymentLabels[shipment.guide_payment_status]}</strong></div>
                <div><span>Resumen guía</span><strong>{guidePaymentDetail(shipment)}</strong></div>
              </div>
              <p>{shipment.destination_detail ?? "Sin observación de destino."}</p>
              {shipment.pass_note ? <p>{shipment.pass_note}</p> : null}
            </details>) : <p>Sin guías cargadas todavía.</p>}
          </div>

          <div id="pagos" className={styles.money}>
            <div><span>Pagado ARS</span><strong>{formatMoney(Number(operation.paid_amount_ars ?? 0))}</strong></div>
            <div><span>Pagado USD</span><strong>{moneyUsd(Number(operation.paid_amount_usd ?? 0))}</strong></div>
            <div><span>Saldo estimado hoy</span><strong>{formatMoney(Number(operation.balance_amount ?? passArs(operation)))}</strong></div>
          </div>

          <div className={styles.payments}>
            <h2>Pagos visibles</h2>
            {operation.payments.length ? operation.payments.map((payment, index) => <div key={`${operation.id}-${index}`}>
              <strong>{payment.concept}</strong>
              <span>{paymentMethodLabels[payment.method]} - {payment.currency === "ARS" ? formatMoney(payment.amount) : moneyUsd(payment.amount)}</span>
            </div>) : <p>Sin pagos registrados.</p>}
          </div>

          <div className={styles.note}>
            <span>Observaciones</span>
            <p>{operation.note ?? "Sin observaciones visibles."}</p>
          </div>
        </article>;
      })}
    </section>
    <nav className={styles.clientBottomNav} aria-label="Navegación cliente">
      <a href="#inicio"><span>●</span><strong>Inicio</strong></a>
      <a href="#pedidos"><span>▦</span><strong>Pedidos</strong></a>
      <a href="#guias" className={styles.clientFab}><span>+</span><strong>Guías</strong></a>
      <a href="#pagos"><span>$</span><strong>Pagos</strong></a>
      <a href="https://wa.me/5493757653075" target="_blank" rel="noreferrer"><span>?</span><strong>Ayuda</strong></a>
      <small>The Prestige Group</small>
    </nav>
  </main>;
}
