import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppStateProvider } from "@/shared/state/AppStateProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custodia360",
  description: "Sistema privado de gestión operativa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body><AppStateProvider>{children}</AppStateProvider></body></html>;
}
