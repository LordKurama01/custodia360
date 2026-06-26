import type { AppState } from "@/domain/entities/types";

export const initialState: AppState = {
  activeTenantId: "tenant-a",
  tenants: [
    { id: "tenant-a", code: "DUE-0001", name: "Dueño A - Norte Operaciones", legalName: "Norte Operaciones S.A.", active: true, createdAt: "2026-06-01T09:00:00" },
    { id: "tenant-b", code: "DUE-0002", name: "Dueño B - Sur Logística", legalName: "Sur Logística SRL", active: true, createdAt: "2026-06-02T09:00:00" },
    { id: "tenant-c", code: "DUE-0003", name: "Dueño C - Centro Custodia", legalName: "Centro Custodia", active: true, createdAt: "2026-06-03T09:00:00" },
  ],
  users: [
    { id: "u-platform", tenantId: null, role: "platform_admin", name: "Administrador General", email: "admin@custodia360.local", active: true },
    { id: "u-owner-a", tenantId: "tenant-a", role: "owner", name: "Owner Norte", email: "owner-a@custodia360.local", active: true },
    { id: "u-owner-b", tenantId: "tenant-b", role: "owner", name: "Owner Sur", email: "owner-b@custodia360.local", active: true },
    { id: "u-driver-a", tenantId: "tenant-a", role: "chofer", name: "Juan Chofer", email: "juan@custodia360.local", phone: "+54 9 236 444 1111", active: true },
    { id: "u-driver-a2", tenantId: "tenant-a", role: "chofer", name: "Martín Ruta", email: "martin@custodia360.local", active: true },
    { id: "u-op-a", tenantId: "tenant-a", role: "operario", name: "Carla Operaciones", email: "carla@custodia360.local", active: true },
    { id: "u-op-a2", tenantId: "tenant-a", role: "operario", name: "Sebastián Depósito", email: "seba@custodia360.local", active: true },
    { id: "u-client-a", tenantId: "tenant-a", role: "cliente", name: "Transporte del Norte", email: "cliente@transnorte.local", active: true },
  ],
  clients: [
    { id: "client-a1", tenantId: "tenant-a", name: "Transporte del Norte", email: "operaciones@transnorte.local", phone: "+54 9 236 555 0101", city: "Junín", active: true },
    { id: "client-a2", tenantId: "tenant-a", name: "Comercial ABC", email: "compras@abc.local", phone: "+54 9 11 5555 8888", city: "CABA", active: true },
    { id: "client-b1", tenantId: "tenant-b", name: "Cliente exclusivo Sur", email: "sur@cliente.local", city: "Rosario", active: true },
  ],
  requests: [
    {
      id: "req-a1", tenantId: "tenant-a", clientId: "client-a1", code: "CLI-000001", clientName: "Transporte del Norte",
      originName: "Acopio San Martín", originAddress: "Av. Colón 1234, Córdoba",
      destinationCity: "Rosario", destinationAddress: "Terminal de cargas Rosario",
      productDescription: "Electrodomésticos embalados", quantity: 15, withdrawalPersonName: "Juan Pérez", withdrawalDocument: "DNI 30.123.456",
      notes: "Retirar de 8 a 12 hs. Llamar antes.", status: "pendiente_revision", priority: "media", createdAt: "2026-06-17T08:15:00", updatedAt: "2026-06-17T08:15:00", evidenceIds: ["ev-a1"]
    },
    {
      id: "req-a2", tenantId: "tenant-a", clientId: "client-a2", code: "CLI-000002", clientName: "Comercial ABC",
      originName: "Depósito Central", originAddress: "Ruta 7 km 258, Junín", destinationCity: "Buenos Aires", destinationAddress: "Depósito Barracas",
      productDescription: "Cajas de repuestos", quantity: 8, status: "aprobada", priority: "alta", createdAt: "2026-06-17T09:05:00", updatedAt: "2026-06-17T09:40:00", evidenceIds: []
    },
    {
      id: "req-b1", tenantId: "tenant-b", clientId: "client-b1", code: "CLI-000003", clientName: "Cliente exclusivo Sur",
      originName: "Proveedor Sur", originAddress: "Calle Sur 111", destinationCity: "Mendoza", destinationAddress: "Terminal Mendoza",
      productDescription: "Bultos de ferretería", quantity: 4, status: "pendiente_revision", priority: "baja", createdAt: "2026-06-17T09:30:00", updatedAt: "2026-06-17T09:30:00", evidenceIds: []
    }
  ],
  orders: [
    { id: "ord-a1", tenantId: "tenant-a", requestId: "req-a2", code: "JR-000001", clientName: "Comercial ABC", status: "tarea_asignada", createdAt: "2026-06-17T09:45:00", assignedTaskIds: ["task-a1", "task-a2"] }
  ],
  tasks: [
    { id: "task-a1", tenantId: "tenant-a", orderId: "ord-a1", code: "TAR-000001", title: "Preparar bultos", description: "Verificar cantidades, embalar y fotografiar", assignedToUserId: "u-op-a", assignedRole: "operario", status: "en_preparacion", priority: "alta", dueAt: "2026-06-17T14:00:00", evidenceRequired: true },
    { id: "task-a2", tenantId: "tenant-a", orderId: "ord-a1", code: "TAR-000002", title: "Retirar y despachar", description: "Retirar en depósito y llevar a transporte", assignedToUserId: "u-driver-a", assignedRole: "chofer", status: "tarea_asignada", priority: "media", dueAt: "2026-06-17T16:00:00", evidenceRequired: true }
  ],
  trips: [
    { id: "trip-a1", tenantId: "tenant-a", code: "VL-000001", driverId: "u-driver-a", driverName: "Juan Chofer", vehicle: "Furgón AB123CD", origin: "Junín", destination: "Buenos Aires", status: "en_transito", orderIds: ["ord-a1"], expenseIds: ["exp-a1"], evidenceIds: [] }
  ],
  packages: [
    { id: "pkg-a1", tenantId: "tenant-a", code: "BLT-000001", orderId: "ord-a1", description: "Caja repuestos 1/8", quantity: 1, status: "en_preparacion" },
    { id: "pkg-a2", tenantId: "tenant-a", code: "BLT-000002", orderId: "ord-a1", description: "Caja repuestos 2/8", quantity: 1, status: "en_preparacion" }
  ],
  guides: [
    { id: "guide-a1", tenantId: "tenant-a", code: "GUI-000001", orderId: "ord-a1", carrier: "Via Cargo", guideNumber: "VC-983742", status: "guia_cargada", evidenceId: "ev-a2" }
  ],
  evidences: [
    { id: "ev-a1", tenantId: "tenant-a", entityType: "solicitud", entityId: "req-a1", name: "foto_retiro.jpg", type: "image", uploadedByUserId: "u-client-a", uploadedAt: "2026-06-17T08:16:00" },
    { id: "ev-a2", tenantId: "tenant-a", entityType: "guia", entityId: "guide-a1", name: "guia_via_cargo.pdf", type: "pdf", uploadedByUserId: "u-driver-a", uploadedAt: "2026-06-17T11:35:00" }
  ],
  payments: [
    { id: "pay-a1", tenantId: "tenant-a", code: "COB-000001", orderId: "ord-a1", clientId: "client-a2", concept: "Servicio retiro y despacho JR-000001", amount: 250000, status: "pendiente", dueAt: "2026-06-21", provider: "mercado_pago", providerIntentId: "mp-a1", checkoutUrl: "https://www.mercadopago.com.ar/custodia360" },
    { id: "pay-a2", tenantId: "tenant-a", code: "COB-000002", clientId: "client-a1", concept: "Saldo operación anterior", amount: 180000, status: "vencido", dueAt: "2026-06-12" }
  ],
  paymentGateways: [
    { id: "pgw-a1", tenantId: "tenant-a", provider: "mercado_pago", status: "conectada", displayName: "Mercado Pago · Norte Operaciones", publicKey: "APP_USR-public-key", accessTokenLast4: "7781", webhookSecretConfigured: true, sandboxMode: true, enabledMethods: ["checkout_link", "qr", "manual_mark_as_paid"], connectedAt: "2026-06-17T10:00:00", updatedAt: "2026-06-17T10:00:00", notes: "Configuración aislada del Dueño A. Cambiar esta pasarela no afecta a otros dueños." },
    { id: "pgw-b1", tenantId: "tenant-b", provider: "manual_transfer", status: "borrador", displayName: "Transferencia manual · Sur Logística", webhookSecretConfigured: false, sandboxMode: true, enabledMethods: ["bank_transfer", "manual_mark_as_paid"], updatedAt: "2026-06-17T10:10:00", notes: "Dueño B todavía no conectó pasarela automática." }
  ],
  expenses: [
    { id: "exp-a1", tenantId: "tenant-a", code: "GTO-000001", concept: "Combustible viaje Junín - Buenos Aires", amount: 52000, category: "combustible", linkedTripId: "trip-a1" }
  ],
  profitability: [
    { id: "prof-a1", tenantId: "tenant-a", entityType: "orden", entityId: "ord-a1", income: 250000, expenses: 52000 },
    { id: "prof-a2", tenantId: "tenant-a", entityType: "periodo", entityId: "2026-06", income: 430000, expenses: 116000 }
  ],
  incidents: [
    { id: "inc-a1", tenantId: "tenant-a", code: "INC-000001", entityType: "tarea", entityId: "task-a2", title: "Demora en retiro", description: "El proveedor demoró la entrega del bulto.", status: "abierta", createdAt: "2026-06-17T10:40:00" }
  ],
  audit: [
    { id: "audit-a1", tenantId: "tenant-a", userId: "u-client-a", userName: "Transporte del Norte", entityType: "solicitud", entityId: "req-a1", action: "Creó solicitud CLI-000001", newStatus: "solicitud_recibida", createdAt: "2026-06-17T08:15:00" },
    { id: "audit-a2", tenantId: "tenant-a", userId: "u-owner-a", userName: "Owner Norte", entityType: "orden", entityId: "ord-a1", action: "Generó orden interna JR-000001", newStatus: "orden_generada", createdAt: "2026-06-17T09:45:00" }
  ]
};
