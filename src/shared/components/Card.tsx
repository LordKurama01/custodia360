import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function Card({ children, className = "", pad = true, id }: { children: ReactNode; className?: string; pad?: boolean; id?: string }) {
  return <section id={id} className={`${styles.card} ${pad ? styles.cardPad : ""} ${className}`}>{children}</section>;
}
