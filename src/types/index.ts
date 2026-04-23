// ============================================================
// Finance OS — Core data types
// ============================================================

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type AccountType =
  | 'cash'
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Monetary value — always stored via Math.round(amount * 100) / 100 */
  amount: number;
  category: string;
  accountId: string;
  /** Destination account for transfers */
  toAccountId?: string;
  /** ISO date string */
  date: string;
  description: string;
  tags: string[];
  recurrence: Recurrence;
  /** Parent transaction id for split transactions */
  parentId?: string;
  /** Pluggy transaction id */
  externalId?: string;
  /** If true, never overwrite from sync */
  isManuallyEdited?: boolean;
  /** Marks a transaction originating from a bank sync */
  source?: 'manual' | 'pluggy';
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Monetary value — always rounded */
  initialBalance: number;
  color: string;
  isConnected?: boolean;
  pluggyItemId?: string;
  pluggyAccountId?: string;
  bankLogo?: string;
  bankName?: string;
  lastSynced?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  /** Monetary value — always rounded */
  monthlyLimit: number;
  /** YYYY-MM */
  month: string;
  order: number;
}

export type SupportedLanguage =
  | 'pt-BR'
  | 'en-US'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'zh'
  | 'ja';

export type Theme = 'dark' | 'light';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
}

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  provider: 'google' | 'microsoft' | 'local';
}

export interface PluggyCredentials {
  clientId: string;
  clientSecret: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warn';
  message: string;
}

export const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Health',
  'Entertainment',
  'Salary',
  'Investment',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

// ============================================================
// Strict chart color palette
// ------------------------------------------------------------
// Expenses use a red / warm family; income uses a blue / cyan family.
// Every chart component MUST pull colors from this map via
// resolveCategoryColor() below — never hard-code per category.
// ============================================================
export const CATEGORY_COLORS: Record<string, string> = {
  // Expense family (red → warm)
  Housing: '#ef4444',        // Moradia
  Food: '#f97316',           // Alimentação
  Transport: '#eab308',      // Transporte
  Health: '#ec4899',         // Saúde
  Entertainment: '#a855f7',  // Lazer
  Other: '#64748b',          // Outros

  // Income family (blue / cyan)
  Salary: '#3b82f6',         // Salário
  Investment: '#06b6d4',     // Investimento
};

/**
 * Resolve a stable color for a category. Unknown categories fall back to
 * the neutral gray, guaranteeing we never leak a Recharts default palette.
 */
export function resolveCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#64748b';
}

/**
 * Strict semantic color rule used by every chart and UI surface.
 *   value > 0 → blue  (#3b82f6)
 *   value < 0 → red   (#ef4444)
 *   value = 0 → gray  (#64748b)
 */
export function semanticColor(value: number): string {
  if (value > 0) return '#3b82f6';
  if (value < 0) return '#ef4444';
  return '#64748b';
}

export const ACCOUNT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ef4444',
  '#64748b',
];
