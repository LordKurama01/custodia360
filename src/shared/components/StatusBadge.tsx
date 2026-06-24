import type { OperationalStatus, UserRole } from "@/domain/entities/types";
import { statusLabel, statusTone } from "@/domain/status/statusLabels";
import styles from "./ui.module.css";

export function StatusBadge({ status, role }: { status: OperationalStatus; role?: UserRole }) {
  const tone = statusTone(status);
  const cls = tone === "danger" ? styles.dangerTone : styles[tone];
  return <span className={`${styles.badge} ${cls}`}>{statusLabel(status, role)}</span>;
}
