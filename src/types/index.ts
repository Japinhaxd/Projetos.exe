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

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transport: '#8b5cf6',
  Housing: '#06b6d4',
  Health: '#10b981',
  Entertainment: '#ec4899',
  Salary: '#3b82f6',
  Investment: '#22c55e',
  Other: '#64748b',
};

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
