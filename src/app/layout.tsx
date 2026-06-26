import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppStateProvider } from "@/shared/state/AppStateProvider";
import { CookieBanner } from "@/shared/components/CookieBanner";
import { PrestigeFooter } from "@/shared/components/PrestigeFooter";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodia360.onrender.com";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Custodia360",
    template: "%s | Custodia360",
  },
  description: "Control privado de bultos, guías, pases USD, cuenta corriente y seguimiento operativo.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
  openGraph: {
    title: "Custodia360",
    description: "Sistema privado para control operativo de bultos, guías, pases USD y cuentas corrientes por cliente.",
    images: [{ url: "/brand/custodia360_og_1200x630.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#9AFF00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body><AppStateProvider>{children}</AppStateProvider><CookieBanner /><PrestigeFooter /></body></html>;
}
