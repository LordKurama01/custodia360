export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export type AnalyticsEventName =
  | "click_whatsapp_landing"
  | "click_consultar_pedido"
  | "click_ingreso_equipo"
  | "click_sin_codigo_whatsapp"
  | "click_activar_invitacion"
  | "click_whatsapp_portal"
  | "view_guide_detail"
  | "contact_click";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: EventParams) => void;
  }
}

export function trackEvent(name: AnalyticsEventName, params: EventParams = {}) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", name, params);
}
