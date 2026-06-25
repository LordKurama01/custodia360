import type { ControlOperation, OperationTotals } from "../types";
import { DEFAULT_DOLLAR_RATE, calculateGuideCharge } from "../types";

export function toNumber(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function getOperationPassUsd(operation: Pick<ControlOperation, "pass_amount" | "operation_shipments">) {
  const guidePassTotal = roundMoney(
    operation.operation_shipments.reduce((sum, shipment) => sum + toNumber(shipment.pass_usd_amount), 0),
  );
  return guidePassTotal > 0 ? guidePassTotal : roundMoney(toNumber(operation.pass_amount));
}

export function calculateOperationTotals(operation: Pick<ControlOperation, "package_count" | "price_per_package" | "pass_amount" | "operation_shipments" | "operation_payments">): OperationTotals {
  const totalPackages = roundMoney(toNumber(operation.package_count) * toNumber(operation.price_per_package));
  const passAmount = getOperationPassUsd(operation);
  const passAmountArs = roundMoney(passAmount * DEFAULT_DOLLAR_RATE);
  const guideToCharge = roundMoney(
    operation.operation_shipments.reduce((sum, shipment) => {
      if (shipment.guide_payment_status === "pagada_por_cliente") return sum;
      return sum + calculateGuideCharge(shipment.company, toNumber(shipment.guide_amount));
    }, 0),
  );
  const paidArs = roundMoney(
    operation.operation_payments.reduce((sum, payment) => payment.currency === "ARS" ? sum + toNumber(payment.amount) : sum, 0),
  );
  const paidUsd = roundMoney(
    operation.operation_payments.reduce((sum, payment) => payment.currency === "USD" ? sum + toNumber(payment.amount) : sum, 0),
  );
  const totalAmount = roundMoney(totalPackages + passAmountArs + guideToCharge);
  const balanceArs = roundMoney(Math.max(totalAmount - paidArs, 0));
  const financialStatus = paidArs <= 0 && paidUsd <= 0
    ? "pendiente"
    : paidArs >= totalAmount
      ? "pago_total"
      : "pago_parcial";

  return {
    totalPackages,
    guideToCharge,
    passAmount,
    passAmountArs,
    totalAmount,
    paidArs,
    paidUsd,
    balanceArs,
    financialStatus,
  };
}

export function calculateOperationDraftTotal(input: { package_count: number; price_per_package: number; pass_amount: number }) {
  return roundMoney(toNumber(input.package_count) * toNumber(input.price_per_package) + toNumber(input.pass_amount) * DEFAULT_DOLLAR_RATE);
}
