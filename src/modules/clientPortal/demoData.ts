import type { ClientPortalData } from "./ClientPortalView";

export function getDemoClientPortalData(code: string): ClientPortalData | null {
  const normalized = decodeURIComponent(code).trim().toLowerCase();
  if (!normalized || normalized === "demo" || normalized === "demo-luciano") {
    return {
      client: {
        id: "demo-client-luciano",
        name: "Luciano Demo",
        phone: "+54 9 236 555-0101",
        notes: "Vista cliente demo. Solo lectura.",
      },
      operations: [
        {
          id: "demo-op-1",
          public_code: "DEMO-LUCIANO",
          operation_date: new Date().toISOString().slice(0, 10),
          provider_name: "Flytec",
          package_count: 3,
          logistics_status: "paso",
          financial_status: "pago_parcial",
          note: "Tu pedido ya fue retirado y se encuentra en paso. La guia queda pendiente de reintegro.",
          pass_amount: 5000,
          total_amount: 53000,
          paid_amount_ars: 20000,
          paid_amount_usd: 0,
          balance_amount: 33000,
          shipments: [
            {
              company: "Crucero Express",
              guide_number: "GUI-DEMO-001",
              guide_amount: 18000,
              guide_paid_by: "jeremias",
              guide_payment_status: "pendiente_reintegro",
              dispatch_date: null,
            },
          ],
          payments: [
            {
              concept: "Adelanto en pesos",
              method: "transferencia_1",
              currency: "ARS",
              amount: 20000,
              paid_at: new Date().toISOString(),
              note: "Transferencia inicial.",
            },
          ],
        },
        {
          id: "demo-op-2",
          public_code: "DEMO-ORLANDO",
          operation_date: new Date().toISOString().slice(0, 10),
          provider_name: "Alpes",
          package_count: 2,
          logistics_status: "despachado",
          financial_status: "pago_total",
          note: "Pedido despachado. Guia abonada por el cliente.",
          pass_amount: 0,
          total_amount: 24000,
          paid_amount_ars: 24000,
          paid_amount_usd: 0,
          balance_amount: 0,
          shipments: [
            {
              company: "Buspack Aldea",
              guide_number: "GUI-DEMO-002",
              guide_amount: 15000,
              guide_paid_by: "cliente",
              guide_payment_status: "pagada_por_cliente",
              dispatch_date: new Date().toISOString().slice(0, 10),
            },
          ],
          payments: [
            {
              concept: "Pago total bultos",
              method: "transferencia_2",
              currency: "ARS",
              amount: 24000,
              paid_at: new Date().toISOString(),
              note: null,
            },
          ],
        },
      ],
    };
  }

  return null;
}
