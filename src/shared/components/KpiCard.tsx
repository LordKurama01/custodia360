import { Card } from "./Card";
import styles from "./ui.module.css";

export function KpiCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return <Card className={styles.kpi}><span>{label}</span><strong>{value}</strong>{helper ? <small>{helper}</small> : <small>&nbsp;</small>}</Card>;
}
