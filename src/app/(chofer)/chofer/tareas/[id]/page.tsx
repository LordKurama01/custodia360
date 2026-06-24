export function generateStaticParams() {
  return [
    { id: "TAR-000001" },
    { id: "TAR-000002" }
  ];
}
import { ChoferTaskDetailView } from "@/modules/tareas/chofer-mobile/ChoferViews";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ChoferTaskDetailView id={id} />; }

