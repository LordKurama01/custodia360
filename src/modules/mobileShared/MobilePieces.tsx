import type { ReactNode } from "react";
import { Card } from "@/shared/components/Card";
import styles from "./mobileComponents.module.css";

export function MobileHero({ title, subtitle }: { title: string; subtitle: string }) {
  return <section className={styles.hero}><h1>{title}</h1><p>{subtitle}</p></section>;
}

export function MobileKpi({ label, value }: { label: string; value: string | number }) {
  return <div className={styles.kpi}><span>{label}</span><strong>{value}</strong></div>;
}

export function MobileSection({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>;
}
