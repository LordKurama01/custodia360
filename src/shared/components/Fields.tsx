import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.label}>{label}{children}</label>;
}
export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) { return <input className={`${styles.input} ${className}`} {...props} />; }
export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={`${styles.textarea} ${className}`} {...props} />; }
export function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select className={`${styles.select} ${className}`} {...props} />; }
