export const TURBIDITY_THRESHOLD = 1.0;
export const PH_DEVIATION_THRESHOLD = 0.5;
export const PH_REFERENCE = 7.0;

export function calculatePhDeviation(ph: number): number {
  return Math.abs(ph - PH_REFERENCE);
}

export function isAnomaly(maxTurbidity: number, maxPhDeviation: number): boolean {
  return maxTurbidity > TURBIDITY_THRESHOLD || maxPhDeviation > PH_DEVIATION_THRESHOLD;
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (!trimmed) return false;
  const date = new Date(trimmed);
  return !isNaN(date.getTime());
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
