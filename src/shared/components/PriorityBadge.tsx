import type { Priority } from "@/domain/entities/types";
import styles from "./ui.module.css";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone = priority === "critica" || priority === "alta" ? styles.dangerTone : priority === "media" ? styles.warn : styles.ok;
  return <span className={`${styles.badge} ${tone}`}>{priority}</span>;
}
