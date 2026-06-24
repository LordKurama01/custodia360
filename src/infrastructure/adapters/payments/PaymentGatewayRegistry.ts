import type { PaymentProvider } from "@/domain/entities/types";
import type { PaymentProviderPort } from "./PaymentProviderPort";
import { MercadoPagoAdapter } from "./MercadoPagoAdapter";
import { ManualTransferAdapter } from "./ManualTransferAdapter";

export function resolvePaymentProvider(provider: PaymentProvider, tenantId: string): PaymentProviderPort {
  switch (provider) {
    case "mercado_pago":
      return new MercadoPagoAdapter(tenantId);
    case "manual_transfer":
      return new ManualTransferAdapter(tenantId);
    case "stripe":
    case "mobbex":
    case "custom":
      throw new Error(`Provider ${provider} preparado por contrato, pendiente de adapter real.`);
    default:
      throw new Error("Pasarela no soportada");
  }
}
