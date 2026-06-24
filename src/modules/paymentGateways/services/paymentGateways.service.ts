import type { PaymentProvider, TenantPaymentGateway } from "@/domain/entities/types";

// Servicio preparado para reemplazar AppState/localStorage por API/DB.
// Regla: cada configuración pertenece a un tenantId. No existe pasarela global obligatoria.
export async function getPaymentGatewaysByTenant(_tenantId: string): Promise<TenantPaymentGateway[]> {
  throw new Error("getPaymentGatewaysByTenant debe conectarse al repositorio real. La UI usa AppStateProvider en Versión 1 inicial.");
}

export async function configurePaymentGatewayForTenant(_tenantId: string, _provider: PaymentProvider): Promise<TenantPaymentGateway> {
  throw new Error("configurePaymentGatewayForTenant debe guardar credenciales cifradas en backend. Nunca guardar access tokens reales en frontend.");
}

export async function disablePaymentGateway(_gatewayId: string): Promise<void> {
  throw new Error("disablePaymentGateway debe ejecutarse en backend con auditoría por tenant.");
}
