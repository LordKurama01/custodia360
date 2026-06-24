"use client";

import { useState } from "react";
import { useAppState } from "@/shared/state/AppStateProvider";
import { useTenantData } from "@/shared/hooks/useTenantData";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Field, Input } from "@/shared/components/Fields";
import type { PaymentProvider } from "@/domain/entities/types";
import styles from "./PaymentGatewaySettingsView.module.css";

const providers: Array<{ id: PaymentProvider; title: string; description: string }> = [
  { id: "mercado_pago", title: "Mercado Pago", description: "Link de pago, QR, checkout y webhook del dueño." },
  { id: "manual_transfer", title: "Transferencia manual", description: "Cobro manual sin integración automática inicial." },
  { id: "stripe", title: "Stripe", description: "Preparado para expansión internacional." },
  { id: "mobbex", title: "Mobbex", description: "Alternativa configurable para Argentina." },
  { id: "custom", title: "Otra forma de cobro", description: "Adapter propio sin tocar operación." },
];

export function PaymentGatewaySettingsView() {
  const { state, actions } = useAppState();
  const data = useTenantData();
  const [provider, setProvider] = useState<PaymentProvider>("mercado_pago");
  const [displayName, setDisplayName] = useState(data.tenant ? `Mercado Pago · ${data.tenant.name}` : "Mercado Pago");
  const tenantId = state.activeTenantId;

  const save = () => {
    if (!tenantId || !displayName.trim()) return;
    actions.configureTenantPaymentGateway(tenantId, provider, displayName.trim());
  };

  return <div className={styles.grid}>
    <section className={styles.stack}>
      <Card className={styles.intro}>
        <p>Forma de cobro del negocio</p>
        <h2>{data.tenant?.code} · {data.tenant?.name}</h2>
        <span>Esta configuración solo aplica al dueño activo. No afecta solicitudes, tareas, clientes ni cobros de otros negocios.</span>
      </Card>
      {data.paymentGateways.length === 0 ? <Card><p className={styles.note}>Este dueño todavía no tiene forma de cobro configurada.</p></Card> : data.paymentGateways.map(gateway => <article key={gateway.id} className={styles.gateway}>
        <div className={styles.gatewayHeader}>
          <div><strong>{gateway.displayName}</strong><br /><small>{gateway.provider} · métodos: {gateway.enabledMethods.join(", ")}</small></div>
          <span className={styles.status} data-state={gateway.status}>{gateway.status.replaceAll("_", " ")}</span>
        </div>
        <small>Modo prueba: {gateway.sandboxMode ? "activo" : "no"} · Webhook: {gateway.webhookSecretConfigured ? "preparado" : "pendiente"} · Token: {gateway.accessTokenLast4 ? `****${gateway.accessTokenLast4}` : "no visible"}</small>
        {gateway.notes ? <p className={styles.note}>{gateway.notes}</p> : null}
        <div className={styles.actions}><Button variant="secondary">Probar conexión</Button><Button variant="ghost" onClick={() => actions.disconnectTenantPaymentGateway(gateway.id)}>Desactivar</Button></div>
      </article>)}
    </section>

    <section className={styles.stack}>
      <Card>
        <h2>Configurar cobro</h2>
        <div className={styles.providerGrid}>{providers.map(p => <button key={p.id} type="button" onClick={() => { setProvider(p.id); setDisplayName(`${p.title} · ${data.tenant?.name ?? "Dueño"}`); }} className={`${styles.provider} ${provider === p.id ? styles.selected : ""}`}>
          <strong>{p.title}</strong><small>{p.description}</small>
        </button>)}</div>
        <div className={styles.form}>
          <Field label="Nombre visible"><Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Mercado Pago · Dueño A" /></Field>
          <Button onClick={save}>Guardar forma de cobro</Button>
        </div>
      </Card>
      <div className={styles.warning}>
        Las credenciales reales van cifradas en backend y asociadas a tenantId. La operación consume un contrato fijo de pagos: si mañana cambia Mercado Pago, se toca el adapter, no solicitudes, tareas, clientes, mobile ni desktop.
      </div>
    </section>
  </div>;
}
