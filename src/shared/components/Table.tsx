import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function DataTable({ children }: { children: ReactNode }) {
  return <table className={styles.table}>{children}</table>;
}
