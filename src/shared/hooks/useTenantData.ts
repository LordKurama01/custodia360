"use client";

import { useMemo } from "react";
import { useAppState } from "@/shared/state/AppStateProvider";
import { getTenantScopedData } from "@/domain/tenancy/tenantIsolation";

export function useTenantData(tenantId?: string) {
  const { state } = useAppState();
  const activeTenantId = tenantId ?? state.activeTenantId;
  return useMemo(() => getTenantScopedData(state, activeTenantId), [state, activeTenantId]);
}
