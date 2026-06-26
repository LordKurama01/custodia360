"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GA_ID } from "@/shared/lib/analytics";
import styles from "./CookieBanner.module.css";

const storageKey = "custodia360:cookie-consent";

export function CookieBanner() {
  const [choice, setChoice] = useState<"accepted" | "rejected" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "accepted" || stored === "rejected") setChoice(stored);
    setReady(true);
  }, []);

  const save = (value: "accepted" | "rejected") => {
    window.localStorage.setItem(storageKey, value);
    setChoice(value);
  };

  return <>
    {choice === "accepted" && GA_ID ? <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}</Script>
    </> : null}
    {ready && !choice ? <section className={styles.banner} aria-label="Consentimiento de cookies">
      <p>Usamos cookies para mejorar la experiencia, medir el uso del sitio y optimizar el servicio. Podés aceptar o rechazar su uso.</p>
      <div>
        <button type="button" onClick={() => save("rejected")}>Rechazar</button>
        <a href="/politica-de-cookies">Ver política</a>
        <button type="button" onClick={() => save("accepted")}>Aceptar</button>
      </div>
    </section> : null}
  </>;
}
