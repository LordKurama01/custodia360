import type { AppState } from "@/domain/entities/types";

export function getTenantScopedData(state: AppState, tenantId: string) {
  return {
    tenant: state.tenants.find(t => t.id === tenantId),
    users: state.users.filter(u => u.tenantId === tenantId),
    clients: state.clients.filter(c => c.tenantId === tenantId),
    requests: state.requests.filter(r => r.tenantId === tenantId),
    orders: state.orders.filter(o => o.tenantId === tenantId),
    tasks: state.tasks.filter(t => t.tenantId === tenantId),
    trips: state.trips.filter(t => t.tenantId === tenantId),
    packages: state.packages.filter(p => p.tenantId === tenantId),
    guides: state.guides.filter(g => g.tenantId === tenantId),
    evidences: state.evidences.filter(e => e.tenantId === tenantId),
    payments: state.payments.filter(p => p.tenantId === tenantId),
    paymentGateways: (state.paymentGateways ?? []).filter(g => g.tenantId === tenantId),
    expenses: state.expenses.filter(e => e.tenantId === tenantId),
    profitability: state.profitability.filter(p => p.tenantId === tenantId),
    incidents: state.incidents.filter(i => i.tenantId === tenantId),
    audit: state.audit.filter(a => a.tenantId === tenantId),
  };
}

export function assertSameTenant(entityTenantId: string, activeTenantId: string, entityName = "entidad") {
  if (entityTenantId !== activeTenantId) {
    throw new Error(`Custodia360 tenant isolation: ${entityName} pertenece a ${entityTenantId}, no al espacio activo ${activeTenantId}.`);
  }
}

export function isTenantScoped(entity: { tenantId: string }, tenantId: string) {
  return entity.tenantId === tenantId;
}
