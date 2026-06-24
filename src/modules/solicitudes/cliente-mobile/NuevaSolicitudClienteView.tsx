"use client";
import { useState } from "react";
import Link from "next/link";
import { MobileShell, clienteNav } from "@/modules/layout/mobile/MobileShell";
import { MobileHero, MobileSection } from "@/modules/mobileShared/MobilePieces";
import { useAppState } from "@/shared/state/AppStateProvider";
import { Button } from "@/shared/components/Button";
import { Field, Input, Textarea } from "@/shared/components/Fields";
import styles from "@/modules/mobileShared/mobileComponents.module.css";

type Step = 1 | 2 | 3 | 4;

export function NuevaSolicitudClienteView() {
  const { state, actions } = useAppState();
  const tenantId = state.activeTenantId;
  const [created, setCreated] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({ originName: "", originAddress: "", productDescription: "", quantity: "1", destinationCity: "", destinationAddress: "", notes: "" });
  const submit = () => {
    const id = actions.createClientRequest(tenantId, { clientId: "client-a1", clientName: "Transporte del Norte", originName: form.originName || "Lugar de retiro", originAddress: form.originAddress || "Dirección pendiente", destinationCity: form.destinationCity || "Destino", destinationAddress: form.destinationAddress || "Dirección destino", productDescription: form.productDescription || "Bulto sin descripción", quantity: Number(form.quantity || 1), notes: form.notes });
    setCreated(id);
  };
  const next = () => setStep(prev => Math.min(4, prev + 1) as Step);
  const back = () => setStep(prev => Math.max(1, prev - 1) as Step);

  return <MobileShell roleLabel="Cliente" nav={clienteNav}>
    <MobileHero title="Nueva solicitud" subtitle="Carga guiada en pasos cortos. El Owner recibe datos ordenados y trazables." />
    <MobileSection>{created ? <div className={styles.detail}>
      <h2>Solicitud creada</h2><p>Ingresó al panel del Owner para revisión. El estado se actualiza en Mis solicitudes.</p>
      <Link href="/cliente/mis-solicitudes"><Button style={{width:"100%"}}>Ver mis solicitudes</Button></Link>
    </div> : <div className={styles.form}>
      <div className="mobile-card"><strong>Paso {step} de 4</strong><p>{step === 1 ? "Datos de retiro" : step === 2 ? "Producto / bulto" : step === 3 ? "Destino" : "Observaciones y confirmación"}</p></div>
      {step === 1 ? <>
        <Field label="Lugar de retiro"><Input value={form.originName} onChange={e=>setForm({...form, originName:e.target.value})} placeholder="Negocio / proveedor" /></Field>
        <Field label="Dirección de retiro"><Input value={form.originAddress} onChange={e=>setForm({...form, originAddress:e.target.value})} placeholder="Calle, número, ciudad" /></Field>
      </> : null}
      {step === 2 ? <>
        <Field label="Producto / bulto"><Input value={form.productDescription} onChange={e=>setForm({...form, productDescription:e.target.value})} placeholder="Descripción corta" /></Field>
        <Field label="Cantidad"><Input type="number" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})}/></Field>
      </> : null}
      {step === 3 ? <>
        <Field label="Ciudad destino"><Input value={form.destinationCity} onChange={e=>setForm({...form, destinationCity:e.target.value})} placeholder="Rosario / Buenos Aires" /></Field>
        <Field label="Dirección destino"><Input value={form.destinationAddress} onChange={e=>setForm({...form, destinationAddress:e.target.value})} placeholder="Terminal, depósito o domicilio" /></Field>
      </> : null}
      {step === 4 ? <>
        <Field label="Observaciones"><Textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Horario, contacto, datos de retiro..." /></Field>
        <div className="mobile-card"><strong>Confirmación</strong><p>{form.originName || "Retiro"} → {form.destinationCity || "Destino"}. {form.productDescription || "Producto"} · {form.quantity || 1} unidad/es.</p></div>
      </> : null}
      <div className={styles.actions}>{step > 1 ? <Button variant="ghost" onClick={back}>Atrás</Button> : null}{step < 4 ? <Button onClick={next}>Continuar</Button> : <Button onClick={submit}>Enviar solicitud</Button>}</div>
    </div>}</MobileSection>
  </MobileShell>;
}
