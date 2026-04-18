import { create } from 'zustand';
import type {
  Account,
  AuthUser,
  Budget,
  FirebaseConfig,
  PluggyCredentials,
  SupportedLanguage,
  Theme,
  ToastMessage,
  Transaction,
} from '../types';
import { LS_KEYS, deobfuscate, lsGet, lsSet, obfuscate } from '../lib/storage';
import { round2, sum } from '../lib/money';
import { generateSeedData } from '../lib/seed';
import { uid } from '../lib/id';
import { format } from 'date-fns';

interface State {
  // Core data
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];

  // UI preferences
  theme: Theme;
  lang: SupportedLanguage;
  sidebarCollapsed: boolean;

  // Auth
  user: AuthUser | null;
  firebaseConfig: FirebaseConfig | null;

  // Integrations
  pluggyCreds: PluggyCredentials | null;

  // Toasts
  toasts: ToastMessage[];
}

interface Actions {
  // Bootstrap
  hydrate: () => void;
  seedIfEmpty: () => void;

  // Transactions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  addTransactionsBatch: (list: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  recategorize: (ids: string[], category: string) => void;
  splitTransaction: (
    id: string,
    parts: { amount: number; category: string; description?: string }[],
  ) => void;

  // Accounts
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Budgets
  addBudget: (b: Omit<Budget, 'id' | 'order'>) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  reorderBudgets: (orderedIds: string[]) => void;

  // UI prefs
  setTheme: (t: Theme) => void;
  setLang: (l: SupportedLanguage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (c: boolean) => void;

  // Auth
  setUser: (u: AuthUser | null) => void;
  setFirebaseConfig: (c: FirebaseConfig | null) => void;

  // Pluggy
  setPluggyCreds: (c: PluggyCredentials | null) => void;

  // Toasts
  pushToast: (t: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Bulk
  replaceAll: (data: {
    transactions?: Transaction[];
    accounts?: Account[];
    budgets?: Budget[];
  }) => void;
  clearAll: () => void;
}

const persistTx = (state: State) => lsSet(LS_KEYS.transactions, state.transactions);
const persistAcc = (state: State) => lsSet(LS_KEYS.accounts, state.accounts);
const persistBdg = (state: State) => lsSet(LS_KEYS.budgets, state.budgets);

export const useStore = create<State & Actions>((set, get) => ({
  // Initial state
  transactions: [],
  accounts: [],
  budgets: [],
  theme: 'dark',
  lang: 'pt-BR',
  sidebarCollapsed: false,
  user: null,
  firebaseConfig: null,
  pluggyCreds: null,
  toasts: [],

  hydrate: () => {
    const transactions = lsGet<Transaction[]>(LS_KEYS.transactions, []);
    const accounts = lsGet<Account[]>(LS_KEYS.accounts, []);
    const budgets = lsGet<Budget[]>(LS_KEYS.budgets, []);
    const theme = lsGet<Theme>(LS_KEYS.theme, 'dark');
    const lang = lsGet<SupportedLanguage>(LS_KEYS.lang, 'pt-BR');
    const sidebarCollapsed = lsGet<boolean>(LS_KEYS.sidebarCollapsed, false);
    const user = lsGet<AuthUser | null>(LS_KEYS.user, null);
    const firebaseConfig = lsGet<FirebaseConfig | null>(LS_KEYS.firebase, null);

    // Deobfuscate pluggy creds
    const obfPluggy = lsGet<{ clientId: string; clientSecret: string } | null>(
      LS_KEYS.pluggy,
      null,
    );
    const pluggyCreds = obfPluggy
      ? {
          clientId: deobfuscate(obfPluggy.clientId),
          clientSecret: deobfuscate(obfPluggy.clientSecret),
        }
      : null;

    set({
      transactions,
      accounts,
      budgets,
      theme,
      lang,
      sidebarCollapsed,
      user,
      firebaseConfig,
      pluggyCreds,
    });
  },

  seedIfEmpty: () => {
    const seeded = lsGet<boolean>(LS_KEYS.seeded, false);
    const { accounts, transactions } = get();
    if (seeded || accounts.length > 0 || transactions.length > 0) return;
    const seed = generateSeedData();
    set({
      accounts: seed.accounts,
      transactions: seed.transactions,
      budgets: seed.budgets,
    });
    lsSet(LS_KEYS.accounts, seed.accounts);
    lsSet(LS_KEYS.transactions, seed.transactions);
    lsSet(LS_KEYS.budgets, seed.budgets);
    lsSet(LS_KEYS.seeded, true);
  },

  // ==========================================================
  // Transactions
  // ==========================================================
  addTransaction: (t) => {
    const tx: Transaction = {
      ...t,
      id: uid('tx'),
      amount: round2(t.amount),
      createdAt: new Date().toISOString(),
      source: t.source || 'manual',
    };
    set((s) => {
      const next = { ...s, transactions: [tx, ...s.transactions] };
      persistTx(next);
      return next;
    });
    return tx;
  },

  addTransactionsBatch: (list) => {
    const newTx: Transaction[] = list.map((t) => ({
      ...t,
      id: uid('tx'),
      amount: round2(t.amount),
      createdAt: new Date().toISOString(),
      source: t.source || 'manual',
    }));
    set((s) => {
      const next = { ...s, transactions: [...newTx, ...s.transactions] };
      persistTx(next);
      return next;
    });
  },

  updateTransaction: (id, patch) => {
    set((s) => {
      const transactions = s.transactions.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              amount: patch.amount != null ? round2(patch.amount) : t.amount,
              isManuallyEdited: true,
            }
          : t,
      );
      const next = { ...s, transactions };
      persistTx(next);
      return next;
    });
  },

  deleteTransaction: (id) => {
    set((s) => {
      const transactions = s.transactions.filter((t) => t.id !== id && t.parentId !== id);
      const next = { ...s, transactions };
      persistTx(next);
      return next;
    });
  },

  deleteTransactions: (ids) => {
    const idSet = new Set(ids);
    set((s) => {
      const transactions = s.transactions.filter(
        (t) => !idSet.has(t.id) && !(t.parentId && idSet.has(t.parentId)),
      );
      const next = { ...s, transactions };
      persistTx(next);
      return next;
    });
  },

  recategorize: (ids, category) => {
    const idSet = new Set(ids);
    set((s) => {
      const transactions = s.transactions.map((t) =>
        idSet.has(t.id) ? { ...t, category, isManuallyEdited: true } : t,
      );
      const next = { ...s, transactions };
      persistTx(next);
      return next;
    });
  },

  splitTransaction: (id, parts) => {
    const { transactions } = get();
    const parent = transactions.find((t) => t.id === id);
    if (!parent) return;

    const partsSum = sum(parts.map((p) => p.amount));
    const parentAmount = round2(parent.amount);
    if (Math.abs(partsSum - parentAmount) > 0.009) {
      get().pushToast({
        type: 'error',
        message: `Split total (${partsSum}) differs from transaction amount (${parentAmount})`,
      });
      return;
    }

    const children: Transaction[] = parts.map((p, i) => ({
      id: uid('tx'),
      type: parent.type,
      amount: round2(p.amount),
      category: p.category,
      accountId: parent.accountId,
      date: parent.date,
      description: p.description || `${parent.description} (${i + 1})`,
      tags: parent.tags,
      recurrence: 'none',
      parentId: parent.id,
      source: 'manual',
      createdAt: new Date().toISOString(),
      isManuallyEdited: true,
    }));

    set((s) => {
      // Keep the parent as a marker so we can show the split tree,
      // but mark it as "split" via parentId on children. We DO NOT
      // remove the parent; we flag it so totals exclude it.
      const updatedParent: Transaction = {
        ...parent,
        tags: Array.from(new Set([...(parent.tags || []), '__split_parent'])),
      };
      const others = s.transactions.filter((t) => t.id !== id);
      const next = {
        ...s,
        transactions: [...children, updatedParent, ...others],
      };
      persistTx(next);
      return next;
    });
  },

  // ==========================================================
  // Accounts
  // ==========================================================
  addAccount: (a) => {
    const account: Account = {
      ...a,
      id: uid('acc'),
      initialBalance: round2(a.initialBalance),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const next = { ...s, accounts: [...s.accounts, account] };
      persistAcc(next);
      return next;
    });
    return account;
  },

  updateAccount: (id, patch) => {
    set((s) => {
      const accounts = s.accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              ...patch,
              initialBalance:
                patch.initialBalance != null
                  ? round2(patch.initialBalance)
                  : a.initialBalance,
            }
          : a,
      );
      const next = { ...s, accounts };
      persistAcc(next);
      return next;
    });
  },

  deleteAccount: (id) => {
    set((s) => {
      const accounts = s.accounts.filter((a) => a.id !== id);
      // Also remove transactions tied to this account
      const transactions = s.transactions.filter((t) => t.accountId !== id);
      const next = { ...s, accounts, transactions };
      persistAcc(next);
      persistTx(next);
      return next;
    });
  },

  // ==========================================================
  // Budgets
  // ==========================================================
  addBudget: (b) => {
    set((s) => {
      const order = s.budgets.length;
      const budget: Budget = {
        ...b,
        monthlyLimit: round2(b.monthlyLimit),
        id: uid('bdg'),
        order,
      };
      const next = { ...s, budgets: [...s.budgets, budget] };
      persistBdg(next);
      return next;
    });
  },

  updateBudget: (id, patch) => {
    set((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === id
          ? {
              ...b,
              ...patch,
              monthlyLimit:
                patch.monthlyLimit != null ? round2(patch.monthlyLimit) : b.monthlyLimit,
            }
          : b,
      );
      const next = { ...s, budgets };
      persistBdg(next);
      return next;
    });
  },

  deleteBudget: (id) => {
    set((s) => {
      const budgets = s.budgets.filter((b) => b.id !== id);
      const next = { ...s, budgets };
      persistBdg(next);
      return next;
    });
  },

  reorderBudgets: (orderedIds) => {
    set((s) => {
      const map = new Map(s.budgets.map((b) => [b.id, b]));
      const reordered = orderedIds
        .map((id, idx) => {
          const b = map.get(id);
          return b ? { ...b, order: idx } : null;
        })
        .filter(Boolean) as Budget[];
      // Append any missing
      s.budgets.forEach((b) => {
        if (!orderedIds.includes(b.id))
          reordered.push({ ...b, order: reordered.length });
      });
      const next = { ...s, budgets: reordered };
      persistBdg(next);
      return next;
    });
  },

  // ==========================================================
  // UI prefs
  // ==========================================================
  setTheme: (t) => {
    set({ theme: t });
    lsSet(LS_KEYS.theme, t);
    // Apply to <html>
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(t);
    }
  },

  setLang: (l) => {
    set({ lang: l });
    lsSet(LS_KEYS.lang, l);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
    }
  },

  toggleSidebar: () => {
    set((s) => {
      const v = !s.sidebarCollapsed;
      lsSet(LS_KEYS.sidebarCollapsed, v);
      return { sidebarCollapsed: v };
    });
  },

  setSidebarCollapsed: (c) => {
    set({ sidebarCollapsed: c });
    lsSet(LS_KEYS.sidebarCollapsed, c);
  },

  // ==========================================================
  // Auth
  // ==========================================================
  setUser: (u) => {
    set({ user: u });
    if (u) lsSet(LS_KEYS.user, u);
    else localStorage.removeItem(LS_KEYS.user);
  },

  setFirebaseConfig: (c) => {
    set({ firebaseConfig: c });
    if (c) lsSet(LS_KEYS.firebase, c);
    else localStorage.removeItem(LS_KEYS.firebase);
  },

  // ==========================================================
  // Pluggy
  // ==========================================================
  setPluggyCreds: (c) => {
    set({ pluggyCreds: c });
    if (c) {
      lsSet(LS_KEYS.pluggy, {
        clientId: obfuscate(c.clientId),
        clientSecret: obfuscate(c.clientSecret),
      });
    } else {
      localStorage.removeItem(LS_KEYS.pluggy);
    }
  },

  // ==========================================================
  // Toasts
  // ==========================================================
  pushToast: (t) => {
    const id = uid('t');
    set((s) => ({ toasts: [...s.toasts, { id, ...t }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3200);
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  // ==========================================================
  // Bulk
  // ==========================================================
  replaceAll: (data) => {
    set((s) => {
      const next = {
        ...s,
        transactions: data.transactions ?? s.transactions,
        accounts: data.accounts ?? s.accounts,
        budgets: data.budgets ?? s.budgets,
      };
      if (data.transactions) persistTx(next);
      if (data.accounts) persistAcc(next);
      if (data.budgets) persistBdg(next);
      return next;
    });
  },

  clearAll: () => {
    set({ transactions: [], accounts: [], budgets: [] });
    localStorage.removeItem(LS_KEYS.transactions);
    localStorage.removeItem(LS_KEYS.accounts);
    localStorage.removeItem(LS_KEYS.budgets);
    localStorage.removeItem(LS_KEYS.seeded);
  },
}));

// ==========================================================
// Selectors / derived helpers
// ==========================================================

export function getAccountBalance(
  accountId: string,
  accounts: Account[],
  transactions: Transaction[],
): number {
  const acc = accounts.find((a) => a.id === accountId);
  if (!acc) return 0;
  let balance = acc.initialBalance;
  for (const t of transactions) {
    if (t.tags?.includes('__split_parent')) continue;
    if (t.accountId === accountId) {
      if (t.type === 'income') balance += t.amount;
      else if (t.type === 'expense') balance -= t.amount;
      else if (t.type === 'transfer') balance -= t.amount;
    }
    if (t.type === 'transfer' && t.toAccountId === accountId) {
      balance += t.amount;
    }
  }
  return round2(balance);
}

export function getTotalBalance(
  accounts: Account[],
  transactions: Transaction[],
): number {
  return round2(
    accounts.reduce(
      (acc, a) => acc + getAccountBalance(a.id, accounts, transactions),
      0,
    ),
  );
}

export function getMonthlyTotals(
  transactions: Transaction[],
  year: number,
  month: number, // 0-11
): { income: number; expense: number; net: number } {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.tags?.includes('__split_parent')) continue;
    const d = new Date(t.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  }
  income = round2(income);
  expense = round2(expense);
  return { income, expense, net: round2(income - expense) };
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}
