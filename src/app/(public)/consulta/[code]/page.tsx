import { ClientPortalView, type ClientPortalData } from "@/modules/clientPortal/ClientPortalView";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { getDemoClientPortalData } from "@/modules/clientPortal/demoData";
import { isDemoMode } from "@/shared/lib/demoMode";

type PageProps = {
  params: Promise<{ code: string }>;
};

function isPortalData(value: unknown): value is ClientPortalData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ClientPortalData>;
  return !!candidate.client && Array.isArray(candidate.operations);
}

export default async function ClientConsultaPage({ params }: PageProps) {
  const { code } = await params;

  if (isDemoMode()) {
    return <ClientPortalView data={getDemoClientPortalData(code)} />;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_client_portal_data", { code: decodeURIComponent(code) });

    if (error || !isPortalData(data)) {
      return <ClientPortalView data={null} />;
    }

    return <ClientPortalView data={data} />;
  } catch {
    return <ClientPortalView data={null} />;
  }
}
