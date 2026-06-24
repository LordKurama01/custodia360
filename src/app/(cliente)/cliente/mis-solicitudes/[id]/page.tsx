export function generateStaticParams() {
  return [
    { id: "CLI-000001" },
    { id: "CLI-000002" }
  ];
}
import { SolicitudClienteDetalleView } from "@/modules/solicitudes/cliente-mobile/SolicitudClienteDetalleView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SolicitudClienteDetalleView id={id} />; }

