import type { PaymentProvider } from "@/domain/entities/types";

export type PaymentIntentInput = {
  tenantId: string;
  orderId?: string;
  amount: number;
  description: string;
  payerEmail?: string;
};

export type PaymentIntentResult = {
  provider: PaymentProvider;
  externalId: string;
  checkoutUrl?: string;
  status: "created" | "pending" | "approved" | "rejected";
};

export interface PaymentProviderPort {
  readonly provider: PaymentProvider;
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  getPaymentStatus(externalId: string): Promise<PaymentIntentResult["status"]>;
}
