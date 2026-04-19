import type { Num } from './bp-types';

const nfFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nfFr2 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function dzd(v: Num, opts?: { millions?: boolean }): string {
  if (!isNum(v)) return '—';
  if (opts?.millions) {
    return `${nfFr2.format(v / 1_000_000)} M DZD`;
  }
  return `${nfFr.format(v)} DZD`;
}

export function num(v: Num): string {
  if (!isNum(v)) return '—';
  return nfFr.format(v);
}

export function pct(v: Num, fractionDigits = 1): string {
  if (!isNum(v)) return '—';
  // value is already a ratio like 0.25 → "25,0 %"
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(v);
  return formatted;
}

export function dash(v: Num): string {
  return isNum(v) ? num(v) : '—';
}

// Used by Recharts: replace nulls with 0 OR null based on context. For most charts we drop nulls.
export function toChartNum(v: Num): number | null {
  return isNum(v) ? v : null;
}

export function isAllZero(arr: Num[]): boolean {
  return arr.every(v => !isNum(v) || v === 0);
}
