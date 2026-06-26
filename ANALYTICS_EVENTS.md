# ANALYTICS_EVENTS — Custodia360

No enviar datos sensibles a Analytics. No enviar nombres, teléfonos, DNI/CUIT, direcciones, números de guía, saldos ni pagos.

| Evento | Dónde ocurre | Qué mide | Prioridad |
|---|---|---|---|
| click_whatsapp_landing | Landing | Intención de pedido sin código | Alta |
| click_consultar_pedido | Landing | Cliente intenta entrar con invitación | Alta |
| click_ingreso_equipo | Landing/Login | Acceso interno | Media |
| click_sin_codigo_whatsapp | Landing | Consulta sin invitación | Alta |
| click_activar_invitacion | Invitación | Activación cliente | Alta |
| click_whatsapp_portal | Portal cliente | Soporte/consulta | Alta |
| view_guide_detail | Portal cliente | Uso de detalle de guía | Media |
| contact_click | General | Contacto comercial | Alta |

Variables:
- NEXT_PUBLIC_GA_MEASUREMENT_ID
- NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
- NEXT_PUBLIC_SITE_URL
