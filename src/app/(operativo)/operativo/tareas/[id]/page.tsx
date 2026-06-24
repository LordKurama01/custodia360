export function generateStaticParams() {
  return [
    { id: "TAR-000001" },
    { id: "TAR-000002" }
  ];
}
import { OperarioTaskDetailView } from "@/modules/tareas/operario-mobile/OperarioViews";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OperarioTaskDetailView id={id} />; }

