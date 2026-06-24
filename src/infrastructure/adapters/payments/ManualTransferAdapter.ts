import type { PaymentIntentInput, PaymentIntentResult, PaymentProviderPort } from "./PaymentProviderPort";

export class ManualTransferAdapter implements PaymentProviderPort {
  readonly provider = "manual_transfer" as const;

  constructor(private readonly tenantId: string) {}

  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: this.provider,
      externalId: `manual-${this.tenantId}-${input.orderId ?? "general"}-${Date.now()}`,
      status: "pending",
    };
  }

  async getPaymentStatus(): Promise<PaymentIntentResult["status"]> {
    return "pending";
  }
}
