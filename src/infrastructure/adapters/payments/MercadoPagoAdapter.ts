import type { PaymentIntentInput, PaymentIntentResult, PaymentProviderPort } from "./PaymentProviderPort";

export class MercadoPagoAdapter implements PaymentProviderPort {
  readonly provider = "mercado_pago" as const;

  constructor(private readonly tenantId: string) {}

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    // Adapter aislado por tenant/dueño.
    // Cuando se conecte Mercado Pago real, se modifica este adapter y la capa segura de credenciales.
    // No debe tocar solicitudes, tareas, clientes, mobile ni desktop.
    return {
      provider: this.provider,
      externalId: `mp-${this.tenantId}-${input.orderId ?? "general"}-${Date.now()}`,
      checkoutUrl: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=demo-${this.tenantId}`,
      status: "created",
    };
  }

  async getPaymentStatus(): Promise<PaymentIntentResult["status"]> {
    return "pending";
  }
}
