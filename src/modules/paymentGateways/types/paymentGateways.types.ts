export type { PaymentProvider, PaymentGatewayStatus, TenantPaymentGateway } from "@/domain/entities/types";

export type PaymentGatewaySetupStep =
  | "elegir_proveedor"
  | "cargar_credenciales"
  | "validar_webhook"
  | "probar_cobro"
  | "activar";
