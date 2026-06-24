"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppState, Client, ClientRequest, EvidenceFile, Incident, InternalOrder, OperationalStatus, PaymentProvider, Task, Tenant, TenantPaymentGateway, User } from "@/domain/entities/types";
import { initialState } from "@/shared/mock/initialState";
import { nextCode } from "@/shared/lib/codeGenerators";

type CreateRequestInput = Pick<ClientRequest, "clientId" | "clientName" | "originName" | "originAddress" | "destinationCity" | "destinationAddress" | "productDescription" | "quantity" | "notes">;
type CreateClientInput = Pick<Client, "name" | "email" | "phone" | "city">;

type AppActions = {
  setActiveTenant: (tenantId: string) => void;
  createTenant: (name: string) => void;
  createTenantUser: (tenantId: string, role: "owner" | "cliente" | "chofer" | "operario", name: string, email: string) => void;
  createClient: (tenantId: string, data: CreateClientInput) => string;
  createClientRequest: (tenantId: string, data: CreateRequestInput) => string;
  approveRequest: (requestId: string, ownerId?: string) => void;
  convertRequestToOrder: (requestId: string, ownerId?: string) => string | null;
  assignTask: (tenantId: string, orderId: string, assignedToUserId: string, title: string, assignedRole: "chofer" | "operario") => string;
  updateTaskStatus: (taskId: string, status: OperationalStatus, userId?: string) => void;
  attachEvidence: (tenantId: string, entityType: EvidenceFile["entityType"], entityId: string, name: string, uploadedByUserId: string) => void;
  reportIncident: (tenantId: string, entityType: Incident["entityType"], entityId: string, title: string, description: string) => void;
  configureTenantPaymentGateway: (tenantId: string, provider: PaymentProvider, displayName: string) => void;
  disconnectTenantPaymentGateway: (gatewayId: string) => void;
};

type AppContextValue = { state: AppState; actions: AppActions };
const AppStateContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = "custodia360.v1.1.black.state";

function safeNow(): string { return new Date().toISOString(); }

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setActiveTenant = useCallback((tenantId: string) => {
    setState(prev => ({ ...prev, activeTenantId: tenantId }));
  }, []);

  const createTenant = useCallback((name: string) => {
    setState(prev => {
      const tenant: Tenant = {
        id: `tenant-${Date.now()}`,
        code: nextCode("DUE", prev.tenants.length),
        name,
        active: true,
        createdAt: safeNow(),
      };
      return {
        ...prev,
        tenants: [tenant, ...prev.tenants],
        audit: [{ id: `audit-${Date.now()}`, tenantId: tenant.id, userId: "u-platform", userName: "Administrador General", entityType: "tenant", entityId: tenant.id, action: `Creó dueño ${tenant.name}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const createTenantUser = useCallback((tenantId: string, role: "owner" | "cliente" | "chofer" | "operario", name: string, email: string) => {
    setState(prev => {
      const user: User = { id: `u-${Date.now()}`, tenantId, role, name, email, active: true };
      return {
        ...prev,
        users: [user, ...prev.users],
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: "u-platform", userName: "Administrador General", entityType: role === "cliente" ? "cliente" : "tenant", entityId: user.id, action: `Creó usuario ${role}: ${name}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const createClient = useCallback((tenantId: string, data: CreateClientInput) => {
    const id = `client-${Date.now()}`;
    setState(prev => {
      const client: Client = { id, tenantId, name: data.name, email: data.email, phone: data.phone, city: data.city, active: true };
      return {
        ...prev,
        clients: [client, ...prev.clients],
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: "u-owner-a", userName: "Owner", entityType: "cliente", entityId: id, action: `Creó cliente ${client.name}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
    return id;
  }, []);

  const createClientRequest = useCallback((tenantId: string, data: CreateRequestInput) => {
    const id = `req-${Date.now()}`;
    setState(prev => {
      const count = prev.requests.filter(r => r.tenantId === tenantId).length;
      const request: ClientRequest = {
        id,
        tenantId,
        code: nextCode("CLI", count),
        status: "solicitud_recibida",
        priority: "media",
        createdAt: safeNow(),
        updatedAt: safeNow(),
        evidenceIds: [],
        ...data,
      };
      return {
        ...prev,
        requests: [request, ...prev.requests],
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: "u-client-a", userName: data.clientName, entityType: "solicitud", entityId: id, action: `Creó solicitud ${request.code}`, newStatus: "solicitud_recibida", createdAt: safeNow() }, ...prev.audit]
      };
    });
    return id;
  }, []);

  const approveRequest = useCallback((requestId: string, ownerId = "u-owner-a") => {
    setState(prev => {
      const req = prev.requests.find(r => r.id === requestId);
      if (!req) return prev;
      const owner = prev.users.find(u => u.id === ownerId);
      return {
        ...prev,
        requests: prev.requests.map(r => r.id === requestId ? { ...r, status: "aprobada", updatedAt: safeNow() } : r),
        audit: [{ id: `audit-${Date.now()}`, tenantId: req.tenantId, userId: ownerId, userName: owner?.name ?? "Owner", entityType: "solicitud", entityId: requestId, action: `Aprobó solicitud ${req.code}`, previousStatus: req.status, newStatus: "aprobada", createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const convertRequestToOrder = useCallback((requestId: string, ownerId = "u-owner-a") => {
    let newOrderId: string | null = null;
    setState(prev => {
      const req = prev.requests.find(r => r.id === requestId);
      if (!req) return prev;
      const existing = prev.orders.find(o => o.requestId === requestId);
      if (existing) { newOrderId = existing.id; return prev; }
      const count = prev.orders.filter(o => o.tenantId === req.tenantId).length;
      const order: InternalOrder = { id: `ord-${Date.now()}`, tenantId: req.tenantId, requestId: req.id, code: nextCode("JR", count), clientName: req.clientName, status: "orden_generada", createdAt: safeNow(), assignedTaskIds: [] };
      newOrderId = order.id;
      const owner = prev.users.find(u => u.id === ownerId);
      return {
        ...prev,
        requests: prev.requests.map(r => r.id === requestId ? { ...r, status: "orden_generada", updatedAt: safeNow() } : r),
        orders: [order, ...prev.orders],
        audit: [{ id: `audit-${Date.now()}`, tenantId: req.tenantId, userId: ownerId, userName: owner?.name ?? "Owner", entityType: "orden", entityId: order.id, action: `Generó orden interna ${order.code} desde ${req.code}`, newStatus: "orden_generada", createdAt: safeNow() }, ...prev.audit]
      };
    });
    return newOrderId;
  }, []);

  const assignTask = useCallback((tenantId: string, orderId: string, assignedToUserId: string, title: string, assignedRole: "chofer" | "operario") => {
    const id = `task-${Date.now()}`;
    setState(prev => {
      const count = prev.tasks.filter(t => t.tenantId === tenantId).length;
      const user = prev.users.find(u => u.id === assignedToUserId);
      const task: Task = { id, tenantId, orderId, code: nextCode("TAR", count), title, assignedToUserId, assignedRole, status: "tarea_asignada", priority: "media", evidenceRequired: true, dueAt: safeNow() };
      return {
        ...prev,
        tasks: [task, ...prev.tasks],
        orders: prev.orders.map(o => o.id === orderId ? { ...o, status: "tarea_asignada", assignedTaskIds: [task.id, ...o.assignedTaskIds] } : o),
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: "u-owner-a", userName: "Owner", entityType: "tarea", entityId: id, action: `Asignó tarea ${task.code} a ${user?.name ?? "usuario"}`, newStatus: "tarea_asignada", createdAt: safeNow() }, ...prev.audit]
      };
    });
    return id;
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: OperationalStatus, userId?: string) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      const user = prev.users.find(u => u.id === userId) ?? prev.users.find(u => u.id === task.assignedToUserId);
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t),
        audit: [{ id: `audit-${Date.now()}`, tenantId: task.tenantId, userId: user?.id ?? "system", userName: user?.name ?? "Sistema", entityType: "tarea", entityId: taskId, action: `Actualizó tarea ${task.code}`, previousStatus: task.status, newStatus: status, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const attachEvidence = useCallback((tenantId: string, entityType: EvidenceFile["entityType"], entityId: string, name: string, uploadedByUserId: string) => {
    setState(prev => {
      const ev: EvidenceFile = { id: `ev-${Date.now()}`, tenantId, entityType, entityId, name, type: name.endsWith(".pdf") ? "pdf" : "image", uploadedByUserId, uploadedAt: safeNow() };
      return {
        ...prev,
        evidences: [ev, ...prev.evidences],
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: uploadedByUserId, userName: prev.users.find(u => u.id === uploadedByUserId)?.name ?? "Usuario", entityType: "evidencia", entityId: ev.id, action: `Cargó evidencia ${ev.name}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const reportIncident = useCallback((tenantId: string, entityType: Incident["entityType"], entityId: string, title: string, description: string) => {
    setState(prev => {
      const inc: Incident = { id: `inc-${Date.now()}`, tenantId, code: nextCode("INC", prev.incidents.filter(i => i.tenantId === tenantId).length), entityType, entityId, title, description, status: "abierta", createdAt: safeNow() };
      return { ...prev, incidents: [inc, ...prev.incidents] };
    });
  }, []);



  const configureTenantPaymentGateway = useCallback((tenantId: string, provider: PaymentProvider, displayName: string) => {
    setState(prev => {
      const existing = (prev.paymentGateways ?? []).find(g => g.tenantId === tenantId && g.provider === provider);
      const gateway: TenantPaymentGateway = {
        id: existing?.id ?? `pgw-${Date.now()}`,
        tenantId,
        provider,
        status: provider === "manual_transfer" ? "borrador" : "requiere_revision",
        displayName,
        publicKey: existing?.publicKey,
        accessTokenLast4: existing?.accessTokenLast4,
        webhookSecretConfigured: existing?.webhookSecretConfigured ?? false,
        sandboxMode: true,
        enabledMethods: provider === "manual_transfer" ? ["bank_transfer", "manual_mark_as_paid"] : ["checkout_link", "qr", "manual_mark_as_paid"],
        connectedAt: existing?.connectedAt,
        updatedAt: safeNow(),
        notes: "Configuración por dueño. La pasarela queda aislada en infraestructura/adapters/payments.",
      };
      const gateways = existing
        ? (prev.paymentGateways ?? []).map(g => g.id === existing.id ? gateway : g)
        : [gateway, ...(prev.paymentGateways ?? [])];
      return {
        ...prev,
        paymentGateways: gateways,
        audit: [{ id: `audit-${Date.now()}`, tenantId, userId: "u-owner-a", userName: "Owner", entityType: "pago", entityId: gateway.id, action: `Configuró pasarela ${gateway.displayName}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);

  const disconnectTenantPaymentGateway = useCallback((gatewayId: string) => {
    setState(prev => {
      const gateway = (prev.paymentGateways ?? []).find(g => g.id === gatewayId);
      if (!gateway) return prev;
      return {
        ...prev,
        paymentGateways: (prev.paymentGateways ?? []).map(g => g.id === gatewayId ? { ...g, status: "desactivada", updatedAt: safeNow(), notes: "Pasarela desactivada por el Owner." } : g),
        audit: [{ id: `audit-${Date.now()}`, tenantId: gateway.tenantId, userId: "u-owner-a", userName: "Owner", entityType: "pago", entityId: gateway.id, action: `Desactivó pasarela ${gateway.displayName}`, createdAt: safeNow() }, ...prev.audit]
      };
    });
  }, []);


  const actions = useMemo<AppActions>(() => ({ setActiveTenant, createTenant, createTenantUser, createClient, createClientRequest, approveRequest, convertRequestToOrder, assignTask, updateTaskStatus, attachEvidence, reportIncident, configureTenantPaymentGateway, disconnectTenantPaymentGateway }), [setActiveTenant, createTenant, createTenantUser, createClient, createClientRequest, approveRequest, convertRequestToOrder, assignTask, updateTaskStatus, attachEvidence, reportIncident, configureTenantPaymentGateway, disconnectTenantPaymentGateway]);

  return <AppStateContext.Provider value={{ state, actions }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
