import type { Metadata } from "next";
import { ControlBultosView } from "@/modules/controlBultos/owner-desktop/ControlBultosView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <ControlBultosView />;
}
