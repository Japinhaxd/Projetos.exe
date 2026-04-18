// ============================================================
// CRITICAL — Monetary precision
// ALL monetary values MUST pass through round2() before being
// stored, computed, or displayed. Zero floating point drift.
// ============================================================

/** Round to 2 decimals using bankers-safe rounding. */
export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  // Add a tiny epsilon to counteract IEEE-754 representation errors
  // (e.g. 1.005 would otherwise round to 1.00 instead of 1.01)
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Sum any list of numbers, applying round2 at the end. */
export function sum(values: number[]): number {
  let total = 0;
  for (const v of values) total += v || 0;
  return round2(total);
}

/** Safely parse a user-typed number (handles "1.500,50" and "1,500.50"). */
export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return round2(input);
  if (!input) return 0;
  let s = String(input).trim();
  // Remove currency symbols and spaces
  s = s.replace(/[^\d,.\-]/g, '');
  if (!s) return 0;
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // Whichever comes last is the decimal separator
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      // pt-BR style: 1.500,50 → 1500.50
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // en-US style: 1,500.50 → 1500.50
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Only comma — treat as decimal
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? round2(n) : 0;
}

/** Format a monetary value for the active locale. */
export function formatCurrency(
  value: number,
  lang: string = 'pt-BR',
): string {
  const v = round2(value);
  const cfg = getLocaleCurrencyConfig(lang);
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${cfg.symbol} ${v.toFixed(2)}`;
  }
}

/** Format a compact number like 1.2k for charts. */
export function formatCompact(value: number, lang = 'pt-BR'): string {
  const v = round2(value);
  const cfg = getLocaleCurrencyConfig(lang);
  const abs = Math.abs(v);
  let out: string;
  if (abs >= 1_000_000) out = (v / 1_000_000).toFixed(1) + 'M';
  else if (abs >= 1_000) out = (v / 1_000).toFixed(1) + 'k';
  else out = v.toFixed(0);
  return `${cfg.symbol}${out}`;
}

export function getLocaleCurrencyConfig(lang: string) {
  const map: Record<
    string,
    { locale: string; currency: string; symbol: string }
  > = {
    'pt-BR': { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' },
    'en-US': { locale: 'en-US', currency: 'USD', symbol: '$' },
    es: { locale: 'es-ES', currency: 'EUR', symbol: '€' },
    fr: { locale: 'fr-FR', currency: 'EUR', symbol: '€' },
    de: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
    it: { locale: 'it-IT', currency: 'EUR', symbol: '€' },
    zh: { locale: 'zh-CN', currency: 'CNY', symbol: '¥' },
    ja: { locale: 'ja-JP', currency: 'JPY', symbol: '¥' },
  };
  return map[lang] || map['pt-BR'];
}

/** Return blue/red/zero color based on value. */
export function signColor(value: number): 'pos' | 'neg' | 'zero' {
  const v = round2(value);
  if (v > 0) return 'pos';
  if (v < 0) return 'neg';
  return 'zero';
}

/** Blue (#3b82f6) for positive, red (#ef4444) for negative, muted for zero. */
export function signHex(value: number): string {
  const s = signColor(value);
  if (s === 'pos') return '#3b82f6';
  if (s === 'neg') return '#ef4444';
  return '#64748b';
}
