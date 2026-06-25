import styles from "./BrandLockup.module.css";

type BrandLockupProps = {
  variant?: "horizontal" | "stacked" | "compact";
  subtitle?: string;
  className?: string;
  iconOnlyLabel?: string;
};

export function BrandLockup({
  variant = "horizontal",
  subtitle = "Sistema privado operativo",
  className = "",
  iconOnlyLabel = "Custodia360",
}: BrandLockupProps) {
  const classNames = [styles.lockup, styles[variant], className].filter(Boolean).join(" ");

  return <div className={classNames} aria-label={iconOnlyLabel}>
    <span className={styles.symbol} aria-hidden="true">
      <img src="/brand/custodia360_icono_transparente_aprox.png" alt="" />
    </span>
    <span className={styles.copy}>
      <span className={styles.name}><span>Custodia</span><strong>360</strong></span>
      {subtitle ? <small>{subtitle}</small> : null}
    </span>
  </div>;
}
