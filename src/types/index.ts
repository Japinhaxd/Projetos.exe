export type TransactionType = 'income' | 'expense' | 'transfer';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type AccountType = 'cash' | 'checking' | 'savings' | 'credit' | 'investment';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; sign determined by type
  category: string;
  accountId: string;
  date: string; // ISO
  description: string;
  tags: string[];
  recurrence: Recurrence;
  parentId?: string; // split parent
  transferToAccountId?: string; // for transfers
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface Settings {
  currency: string; // e.g. 'BRL', 'USD'
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
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
  Health: '#ec4899',
  Entertainment: '#f43f5e',
  Salary: '#3b82f6',
  Investment: '#10b981',
  Other: '#64748b',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Housing: '🏠',
  Health: '💊',
  Entertainment: '🎬',
  Salary: '💼',
  Investment: '📈',
  Other: '📦',
};
