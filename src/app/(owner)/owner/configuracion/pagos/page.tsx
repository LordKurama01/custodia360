import { OwnerDesktopShell } from "@/modules/layout/owner-desktop/OwnerDesktopShell";
import { PaymentGatewaySettingsView } from "@/modules/paymentGateways/owner-desktop/PaymentGatewaySettingsView";

export default function Page() {
  return <OwnerDesktopShell title="Configuración de pagos por dueño"><PaymentGatewaySettingsView /></OwnerDesktopShell>;
}
