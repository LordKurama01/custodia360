import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function Card({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <section className={`${styles.card} ${pad ? styles.cardPad : ""} ${className}`}>{children}</section>;
}
