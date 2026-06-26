import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/modules/auth/components/LoginView";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LoginPage() {
  return <Suspense fallback={null}><LoginView /></Suspense>;
}
