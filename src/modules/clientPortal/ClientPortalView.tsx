import { financialLabels, guidePaymentLabels, logisticsLabels, paymentMethodLabels } from "@/modules/controlBultos/types";
import { formatDate, formatMoney } from "@/shared/lib/format";
import type { Currency, FinancialStatus, GuidePaidBy, GuidePaymentStatus, LogisticsStatus, PaymentMethod } from "@/infrastructure/supabase/types";
import styles from "./ClientPortalView.module.css";

type PortalShipment = {
  company: string | null;
  guide_number: string | null;
  guide_amount: number;
  guide_paid_by: GuidePaidBy;
  guide_payment_status: GuidePaymentStatus;
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

export function ClientPortalView({ data }: { data: ClientPortalData | null }) {
  if (!data) {
    return <main className={styles.page}>
      <section className={styles.notFound}>
        <span>Custodia360</span>
        <h1>Consulta no encontrada</h1>
        <p>El codigo no existe, expiro o la operacion no esta visible para cliente.</p>
      </section>
    </main>;
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div>
        <span>Custodia360</span>
        <h1>{data.client.name}</h1>
        <p>Consulta privada de bultos, guias, pagos y saldo. Solo lectura.</p>
      </div>
      <strong>{data.operations.length} operaciones</strong>
    </header>

    <section className={styles.summary}>
      <div><span>Total bultos</span><strong>{data.operations.reduce((sum, item) => sum + item.package_count, 0)}</strong></div>
      <div><span>Saldo pendiente</span><strong>{formatMoney(data.operations.reduce((sum, item) => sum + Number(item.balance_amount ?? 0), 0))}</strong></div>
      <div><span>Despachados</span><strong>{data.operations.filter((item) => item.logistics_status === "despachado").length}</strong></div>
    </section>

    <section className={styles.list}>
      {data.operations.map((operation) => {
        const shipment = operation.shipments[0];
        return <article key={operation.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <strong>{operation.public_code}</strong>
              <span>{formatDate(operation.operation_date)} - {operation.provider_name}</span>
            </div>
            <span className={`${styles.badge} ${statusTone(operation.logistics_status)}`}>{logisticsLabels[operation.logistics_status]}</span>
          </div>

          <div className={styles.grid}>
            <div><span>Cantidad</span><strong>{operation.package_count} bultos</strong></div>
            <div><span>Empresa de envio</span><strong>{shipment?.company ?? "Sin informar"}</strong></div>
            <div><span>Numero de guia</span><strong>{shipment?.guide_number ?? "Sin informar"}</strong></div>
            <div><span>Fecha despacho</span><strong>{formatDate(shipment?.dispatch_date ?? undefined)}</strong></div>
            <div><span>Valor de guia</span><strong>{shipment?.guide_amount ? formatMoney(Number(shipment.guide_amount)) : "Sin cargo informado"}</strong></div>
            <div><span>Estado guia</span><strong>{guidePaymentLabels[shipment?.guide_payment_status ?? "pendiente"]}</strong></div>
          </div>

          <div className={styles.money}>
            <div><span>Total</span><strong>{formatMoney(Number(operation.total_amount ?? 0))}</strong></div>
            <div><span>Pagado ARS</span><strong>{formatMoney(Number(operation.paid_amount_ars ?? 0))}</strong></div>
            <div><span>Pagado USD</span><strong>{moneyUsd(Number(operation.paid_amount_usd ?? 0))}</strong></div>
            <div><span>Saldo</span><strong>{formatMoney(Number(operation.balance_amount ?? 0))}</strong></div>
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
          <span className={`${styles.badge} ${statusTone(operation.financial_status)}`}>{financialLabels[operation.financial_status]}</span>
        </article>;
      })}
    </section>
  </main>;
}
