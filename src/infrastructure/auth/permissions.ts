import type { InternalRole } from "@/infrastructure/supabase/types";

export const roleLabels: Record<InternalRole, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operador",
  collector: "Cobranzas",
  viewer: "Solo lectura",
};

export function canManageUsers(role?: InternalRole | null) {
  return role === "owner" || role === "admin";
}

export function canEditOperations(role?: InternalRole | null) {
  return role === "owner" || role === "admin" || role === "operator";
}

export function canCreatePayments(role?: InternalRole | null) {
  return role === "owner" || role === "admin" || role === "collector";
}

export function canViewFinancials(role?: InternalRole | null) {
  return role === "owner" || role === "admin" || role === "collector" || role === "viewer";
}

export function canViewOnly(role?: InternalRole | null) {
  return role === "viewer";
}
