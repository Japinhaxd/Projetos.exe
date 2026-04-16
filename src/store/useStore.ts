import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, Budget, Settings, Transaction } from '../types';
import { createSeed } from '../lib/seed';
import { uid } from '../lib/utils';

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

interface State {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: Settings;
  seeded: boolean;
  // UI
  sidebarCollapsed: boolean;
  toasts: Toast[];

  // Seed
  ensureSeed: () => void;

  // Accounts
  addAccount: (a: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  // Transactions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addTransactionsBulk: (txs: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  removeTransactions: (ids: string[]) => void;
  bulkRecategorize: (ids: string[], category: string) => void;
  splitTransaction: (
    id: string,
    parts: { amount: number; category: string; description?: string }[]
  ) => void;

  // Budgets
  addBudget: (b: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  removeBudget: (id: string) => void;
  reorderBudgets: (ids: string[]) => void;

  // Settings
  setSettings: (patch: Partial<Settings>) => void;

  // Global
  importAll: (payload: {
    accounts: Account[];
    transactions: Transaction[];
    budgets: Budget[];
    settings?: Settings;
  }) => void;
  clearAll: () => void;
  resetSeed: () => void;

  // UI
  toggleSidebar: () => void;
  pushToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      budgets: [],
      settings: { currency: 'BRL', dateFormat: 'dd/MM/yyyy' },
      seeded: false,
      sidebarCollapsed: false,
      toasts: [],

      ensureSeed: () => {
        if (get().seeded && get().accounts.length > 0) return;
        const seed = createSeed();
        set({
          accounts: seed.accounts,
          transactions: seed.transactions,
          budgets: seed.budgets,
          seeded: true,
        });
      },

      addAccount: (a) => {
        const newAcc = { ...a, id: uid() };
        set({ accounts: [...get().accounts, newAcc] });
        get().pushToast('success', `Account "${newAcc.name}" added`);
      },
      updateAccount: (id, patch) => {
        set({
          accounts: get().accounts.map(a => (a.id === id ? { ...a, ...patch } : a)),
        });
        get().pushToast('success', 'Account updated');
      },
      removeAccount: (id) => {
        set({
          accounts: get().accounts.filter(a => a.id !== id),
          transactions: get().transactions.filter(
            t => t.accountId !== id && t.transferToAccountId !== id
          ),
        });
        get().pushToast('success', 'Account removed');
      },

      addTransaction: (t) => {
        const newT = { ...t, id: uid() };
        set({ transactions: [newT, ...get().transactions] });
        get().pushToast('success', 'Transaction added');
      },
      addTransactionsBulk: (txs) => {
        const ids = txs.map(t => ({ ...t, id: uid() }));
        set({ transactions: [...ids, ...get().transactions] });
      },
      updateTransaction: (id, patch) => {
        set({
          transactions: get().transactions.map(t =>
            t.id === id ? { ...t, ...patch } : t
          ),
        });
      },
      removeTransaction: (id) => {
        set({
          transactions: get().transactions.filter(
            t => t.id !== id && t.parentId !== id
          ),
        });
        get().pushToast('success', 'Transaction removed');
      },
      removeTransactions: (ids) => {
        const set_ids = new Set(ids);
        set({
          transactions: get().transactions.filter(
            t => !set_ids.has(t.id) && !(t.parentId && set_ids.has(t.parentId))
          ),
        });
        get().pushToast('success', `${ids.length} transactions removed`);
      },
      bulkRecategorize: (ids, category) => {
        const set_ids = new Set(ids);
        set({
          transactions: get().transactions.map(t =>
            set_ids.has(t.id) ? { ...t, category } : t
          ),
        });
        get().pushToast('success', `${ids.length} transactions recategorized`);
      },
      splitTransaction: (id, parts) => {
        const original = get().transactions.find(t => t.id === id);
        if (!original) return;
        const newParts: Transaction[] = parts.map(p => ({
          id: uid(),
          type: original.type,
          amount: p.amount,
          category: p.category,
          accountId: original.accountId,
          date: original.date,
          description: p.description || original.description,
          tags: [...original.tags, 'split'],
          recurrence: 'none',
          parentId: original.id,
        }));
        // Remove original, add parts
        set({
          transactions: [
            ...newParts,
            ...get().transactions.filter(t => t.id !== id),
          ],
        });
        get().pushToast('success', `Split into ${parts.length} parts`);
      },

      addBudget: (b) => {
        set({ budgets: [...get().budgets, { ...b, id: uid() }] });
        get().pushToast('success', `Budget for ${b.category} added`);
      },
      updateBudget: (id, patch) => {
        set({ budgets: get().budgets.map(b => (b.id === id ? { ...b, ...patch } : b)) });
      },
      removeBudget: (id) => {
        set({ budgets: get().budgets.filter(b => b.id !== id) });
        get().pushToast('success', 'Budget removed');
      },
      reorderBudgets: (ids) => {
        const map = Object.fromEntries(get().budgets.map(b => [b.id, b]));
        const ordered = ids.map(id => map[id]).filter(Boolean) as Budget[];
        const remaining = get().budgets.filter(b => !ids.includes(b.id));
        set({ budgets: [...ordered, ...remaining] });
      },

      setSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
        get().pushToast('success', 'Settings saved');
      },

      importAll: (payload) => {
        set({
          accounts: payload.accounts,
          transactions: payload.transactions,
          budgets: payload.budgets,
          settings: payload.settings || get().settings,
          seeded: true,
        });
        get().pushToast('success', 'Data imported successfully');
      },
      clearAll: () => {
        set({
          accounts: [],
          transactions: [],
          budgets: [],
          seeded: true,
        });
        get().pushToast('info', 'All data cleared');
      },
      resetSeed: () => {
        const seed = createSeed();
        set({
          accounts: seed.accounts,
          transactions: seed.transactions,
          budgets: seed.budgets,
          seeded: true,
        });
        get().pushToast('success', 'Seed data restored');
      },

      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      pushToast: (type, message) => {
        const id = uid();
        set({ toasts: [...get().toasts, { id, type, message }] });
        setTimeout(() => {
          set({ toasts: get().toasts.filter(t => t.id !== id) });
        }, 3000);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
    }),
    {
      name: 'finance-os-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
        settings: state.settings,
        seeded: state.seeded,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
