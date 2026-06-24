export function generateStaticParams() {
  return [
    { id: "CLI-000001" },
    { id: "CLI-000002" }
  ];
}
import { SolicitudDetailOwnerView } from "@/modules/solicitudes/owner-desktop/SolicitudDetailOwnerView";
export default function Page() { return <SolicitudDetailOwnerView />; }

