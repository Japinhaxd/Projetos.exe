import { addDays, format, startOfMonth, subMonths } from 'date-fns';
import type { Account, Budget, Transaction } from '../types';
import { round2 } from './money';
import { uid } from './id';

/**
 * Generate realistic Brazilian data for the last 3 months.
 * Roughly 40+ transactions across: salary, rent, food, transport,
 * health, entertainment, investments, and misc expenses.
 */
export function generateSeedData(): {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
} {
  const now = new Date();

  const accounts: Account[] = [
    {
      id: 'acc_checking',
      name: 'Conta Corrente',
      type: 'checking',
      initialBalance: round2(1500),
      color: '#3b82f6',
      createdAt: now.toISOString(),
    },
    {
      id: 'acc_savings',
      name: 'Poupança',
      type: 'savings',
      initialBalance: round2(4200),
      color: '#10b981',
      createdAt: now.toISOString(),
    },
    {
      id: 'acc_credit',
      name: 'Cartão de Crédito',
      type: 'credit',
      initialBalance: round2(0),
      color: '#ef4444',
      createdAt: now.toISOString(),
    },
    {
      id: 'acc_cash',
      name: 'Dinheiro',
      type: 'cash',
      initialBalance: round2(200),
      color: '#f59e0b',
      createdAt: now.toISOString(),
    },
  ];

  const transactions: Transaction[] = [];

  const mk = (
    offsetDays: number,
    type: Transaction['type'],
    amount: number,
    category: string,
    description: string,
    accountId: string,
    recurrence: Transaction['recurrence'] = 'none',
    tags: string[] = [],
  ) => {
    const date = addDays(now, -offsetDays);
    transactions.push({
      id: uid('tx'),
      type,
      amount: round2(amount),
      category,
      accountId,
      date: date.toISOString(),
      description,
      tags,
      recurrence,
      source: 'manual',
      createdAt: date.toISOString(),
    });
  };

  // Generate 3 months of data
  for (let m = 0; m < 3; m++) {
    const monthStart = startOfMonth(subMonths(now, m));
    const baseOffset = Math.max(0, Math.floor((+now - +monthStart) / 86_400_000));

    // Salary — day 5 of each month
    mk(baseOffset - 5, 'income', 3500, 'Salary', 'Salário mensal', 'acc_checking', 'monthly', ['trabalho']);
    // Freelance bonus in current & last month
    if (m < 2) mk(baseOffset - 18, 'income', 450, 'Salary', 'Freela design', 'acc_checking', 'none', ['freela']);

    // Rent — day 10
    mk(baseOffset - 10, 'expense', 1200, 'Housing', 'Aluguel', 'acc_checking', 'monthly', ['fixo']);
    // Utilities
    mk(baseOffset - 12, 'expense', 180, 'Housing', 'Conta de luz', 'acc_checking', 'monthly', ['fixo']);
    mk(baseOffset - 14, 'expense', 95, 'Housing', 'Internet', 'acc_checking', 'monthly', ['fixo']);

    // Food — several times
    mk(baseOffset - 3, 'expense', 52.9, 'Food', 'Mercado Pão de Açúcar', 'acc_credit');
    mk(baseOffset - 7, 'expense', 38.5, 'Food', 'Hortifruti', 'acc_cash');
    mk(baseOffset - 11, 'expense', 24.9, 'Food', 'iFood almoço', 'acc_credit');
    mk(baseOffset - 15, 'expense', 142.3, 'Food', 'Mercado Dia', 'acc_credit');
    mk(baseOffset - 20, 'expense', 85.0, 'Food', 'Restaurante Japonês', 'acc_credit');
    mk(baseOffset - 25, 'expense', 45.9, 'Food', 'Padaria do mês', 'acc_cash');

    // Transport
    mk(baseOffset - 2, 'expense', 35.0, 'Transport', 'Uber trabalho', 'acc_credit');
    mk(baseOffset - 8, 'expense', 180.0, 'Transport', 'Gasolina', 'acc_credit');
    mk(baseOffset - 16, 'expense', 85.0, 'Transport', 'Bilhete único', 'acc_cash');

    // Health
    if (m === 0) mk(baseOffset - 6, 'expense', 120.0, 'Health', 'Farmácia', 'acc_credit');
    if (m === 1) mk(baseOffset - 22, 'expense', 350.0, 'Health', 'Consulta médica', 'acc_checking');

    // Entertainment
    mk(baseOffset - 9, 'expense', 39.9, 'Entertainment', 'Netflix', 'acc_credit', 'monthly');
    mk(baseOffset - 17, 'expense', 21.9, 'Entertainment', 'Spotify', 'acc_credit', 'monthly');
    if (m === 0) mk(baseOffset - 4, 'expense', 68.0, 'Entertainment', 'Cinema', 'acc_credit');
    if (m === 2) mk(baseOffset - 13, 'expense', 180.0, 'Entertainment', 'Show', 'acc_credit');

    // Investment
    mk(baseOffset - 6, 'expense', 500.0, 'Investment', 'Aporte Tesouro Direto', 'acc_checking', 'monthly', ['investimento']);

    // Misc
    if (m === 0) mk(baseOffset - 1, 'expense', 29.9, 'Other', 'Presente amigo', 'acc_credit');
    if (m === 1) mk(baseOffset - 19, 'expense', 72.5, 'Other', 'Papelaria', 'acc_cash');
  }

  // Current month budgets
  const currentMonth = format(now, 'yyyy-MM');
  const budgets: Budget[] = [
    { id: uid('bdg'), category: 'Food', monthlyLimit: round2(700), month: currentMonth, order: 0 },
    { id: uid('bdg'), category: 'Transport', monthlyLimit: round2(400), month: currentMonth, order: 1 },
    { id: uid('bdg'), category: 'Housing', monthlyLimit: round2(1500), month: currentMonth, order: 2 },
    { id: uid('bdg'), category: 'Entertainment', monthlyLimit: round2(150), month: currentMonth, order: 3 },
    { id: uid('bdg'), category: 'Health', monthlyLimit: round2(200), month: currentMonth, order: 4 },
  ];

  return { accounts, transactions, budgets };
}
