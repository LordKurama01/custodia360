export function nextCode(prefix: string, currentCount: number): string {
  return `${prefix}-${String(currentCount + 1).padStart(6, "0")}`;
}
