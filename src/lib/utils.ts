import { format, parseISO } from 'date-fns';
import type { Account, Budget, Transaction } from '../types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function formatCurrency(n: number, currency = 'BRL'): string {
  const locale = currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function formatShortCurrency(n: number, currency = 'BRL'): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
  if (abs >= 1_000_000) return `${sign}${symbol} ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${symbol} ${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${symbol} ${abs.toFixed(0)}`;
}

export function colorForValue(n: number): string {
  if (n > 0) return '#3b82f6';
  if (n < 0) return '#ef4444';
  return '#64748b';
}

export function classForValue(n: number): string {
  if (n > 0) return 'text-pos';
  if (n < 0) return 'text-neg';
  return 'text-muted';
}

export function signedAmount(tx: Transaction): number {
  if (tx.type === 'income') return tx.amount;
  if (tx.type === 'expense') return -tx.amount;
  return 0; // transfer is neutral for totals
}

export function getAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.initialBalance;
  for (const t of transactions) {
    if (t.accountId === account.id) {
      if (t.type === 'income') balance += t.amount;
      else if (t.type === 'expense') balance -= t.amount;
      else if (t.type === 'transfer') balance -= t.amount; // source
    }
    if (t.transferToAccountId === account.id && t.type === 'transfer') {
      balance += t.amount;
    }
  }
  return balance;
}

export function getTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, a) => sum + getAccountBalance(a, transactions), 0);
}

export function formatDate(date: string, pattern = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(date), pattern);
  } catch {
    return date;
  }
}

export function monthKey(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

export function dayKey(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

export function isSameMonth(iso: string, ref: Date): boolean {
  try {
    const d = parseISO(iso);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  } catch {
    return false;
  }
}

export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function txToCSV(transactions: Transaction[], accounts: Account[]): string {
  const accMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));
  const header = ['Date', 'Type', 'Description', 'Category', 'Account', 'Amount', 'Tags', 'Recurrence'].join(',');
  const rows = transactions.map(t => {
    const signed = t.type === 'expense' ? -t.amount : t.amount;
    const fields = [
      t.date.slice(0, 10),
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      accMap[t.accountId] || '',
      signed.toFixed(2),
      `"${t.tags.join('; ')}"`,
      t.recurrence,
    ];
    return fields.join(',');
  });
  return [header, ...rows].join('\n');
}

export function groupBy<T, K extends string | number>(
  arr: T[],
  fn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [] as T[];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function budgetStatus(spent: number, limit: number): 'ok' | 'warn' | 'high' | 'over' {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  if (pct > 100) return 'over';
  if (pct > 85) return 'high';
  if (pct > 60) return 'warn';
  return 'ok';
}

export function budgetBarColor(pct: number): string {
  if (pct > 100) return '#ef4444';
  if (pct > 85) return '#f97316';
  if (pct > 60) return '#f59e0b';
  return '#3b82f6';
}
