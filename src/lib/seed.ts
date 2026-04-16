import { addDays, format, startOfMonth, subMonths } from 'date-fns';
import type { Account, Budget, Transaction } from '../types';
import { uid } from './utils';

export function createSeed(): {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
} {
  const accounts: Account[] = [
    { id: 'acc-checking', name: 'Checking Nubank', type: 'checking', initialBalance: 2500, color: '#8b5cf6' },
    { id: 'acc-savings', name: 'Poupança Itaú', type: 'savings', initialBalance: 8000, color: '#3b82f6' },
    { id: 'acc-cash', name: 'Dinheiro', type: 'cash', initialBalance: 200, color: '#f59e0b' },
    { id: 'acc-credit', name: 'Cartão de Crédito', type: 'credit', initialBalance: 0, color: '#ef4444' },
    { id: 'acc-investment', name: 'XP Investimentos', type: 'investment', initialBalance: 12000, color: '#10b981' },
  ];

  const transactions: Transaction[] = [];
  const today = new Date();

  // Generate for current and 2 previous months (3 months total)
  for (let mOffset = 2; mOffset >= 0; mOffset--) {
    const monthStart = startOfMonth(subMonths(today, mOffset));

    // Salary (5th day)
    transactions.push({
      id: uid(),
      type: 'income',
      amount: 3500,
      category: 'Salary',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 4), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Salário mensal',
      tags: ['fixo'],
      recurrence: 'monthly',
    });

    // Freelance occasionally
    if (mOffset !== 0 || today.getDate() > 15) {
      transactions.push({
        id: uid(),
        type: 'income',
        amount: 800 + Math.floor(Math.random() * 400),
        category: 'Salary',
        accountId: 'acc-checking',
        date: format(addDays(monthStart, 15), "yyyy-MM-dd'T'HH:mm:ss"),
        description: 'Freelance design',
        tags: ['extra'],
        recurrence: 'none',
      });
    }

    // Rent (10th)
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 1200,
      category: 'Housing',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 9), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Aluguel',
      tags: ['fixo'],
      recurrence: 'monthly',
    });

    // Internet + utilities
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 120,
      category: 'Housing',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 7), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Internet Vivo Fibra',
      tags: ['fixo'],
      recurrence: 'monthly',
    });
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 85 + Math.floor(Math.random() * 40),
      category: 'Housing',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 12), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Conta de luz',
      tags: ['fixo'],
      recurrence: 'monthly',
    });

    // Food - several throughout the month
    const foodItems = [
      { desc: 'Supermercado Pão de Açúcar', amount: 280 },
      { desc: 'iFood almoço', amount: 38 },
      { desc: 'Padaria', amount: 22 },
      { desc: 'Restaurante japonês', amount: 95 },
      { desc: 'Hortifrúti', amount: 65 },
      { desc: 'Café Starbucks', amount: 28 },
      { desc: 'iFood jantar', amount: 52 },
      { desc: 'Mercado Extra', amount: 145 },
    ];
    foodItems.forEach((item, i) => {
      transactions.push({
        id: uid(),
        type: 'expense',
        amount: item.amount + Math.floor(Math.random() * 20) - 10,
        category: 'Food',
        accountId: i % 2 === 0 ? 'acc-credit' : 'acc-checking',
        date: format(addDays(monthStart, 2 + i * 3), "yyyy-MM-dd'T'HH:mm:ss"),
        description: item.desc,
        tags: [],
        recurrence: 'none',
      });
    });

    // Transport
    const transportItems = [
      { desc: 'Uber', amount: 24 },
      { desc: 'Combustível Shell', amount: 180 },
      { desc: 'Metrô', amount: 48 },
      { desc: 'Uber', amount: 32 },
    ];
    transportItems.forEach((item, i) => {
      transactions.push({
        id: uid(),
        type: 'expense',
        amount: item.amount + Math.floor(Math.random() * 10),
        category: 'Transport',
        accountId: 'acc-credit',
        date: format(addDays(monthStart, 3 + i * 6), "yyyy-MM-dd'T'HH:mm:ss"),
        description: item.desc,
        tags: [],
        recurrence: 'none',
      });
    });

    // Health
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 180,
      category: 'Health',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 14), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Plano de saúde',
      tags: ['fixo'],
      recurrence: 'monthly',
    });
    if (mOffset !== 1) {
      transactions.push({
        id: uid(),
        type: 'expense',
        amount: 45 + Math.floor(Math.random() * 30),
        category: 'Health',
        accountId: 'acc-credit',
        date: format(addDays(monthStart, 20), "yyyy-MM-dd'T'HH:mm:ss"),
        description: 'Farmácia',
        tags: [],
        recurrence: 'none',
      });
    }

    // Entertainment
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 55.9,
      category: 'Entertainment',
      accountId: 'acc-credit',
      date: format(addDays(monthStart, 3), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Netflix + Spotify',
      tags: ['fixo'],
      recurrence: 'monthly',
    });
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 80 + Math.floor(Math.random() * 60),
      category: 'Entertainment',
      accountId: 'acc-credit',
      date: format(addDays(monthStart, 17), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Cinema e sorveteria',
      tags: [],
      recurrence: 'none',
    });

    // Investment
    transactions.push({
      id: uid(),
      type: 'transfer',
      amount: 500,
      category: 'Investment',
      accountId: 'acc-checking',
      transferToAccountId: 'acc-investment',
      date: format(addDays(monthStart, 8), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'Aporte mensal XP',
      tags: ['investimento'],
      recurrence: 'monthly',
    });

    // Other
    if (mOffset === 1) {
      transactions.push({
        id: uid(),
        type: 'expense',
        amount: 320,
        category: 'Other',
        accountId: 'acc-credit',
        date: format(addDays(monthStart, 11), "yyyy-MM-dd'T'HH:mm:ss"),
        description: 'Presente de aniversário',
        tags: [],
        recurrence: 'none',
      });
    }
    transactions.push({
      id: uid(),
      type: 'expense',
      amount: 29.9,
      category: 'Other',
      accountId: 'acc-checking',
      date: format(addDays(monthStart, 6), "yyyy-MM-dd'T'HH:mm:ss"),
      description: 'iCloud',
      tags: ['fixo', 'assinatura'],
      recurrence: 'monthly',
    });
  }

  // Sort descending by date
  transactions.sort((a, b) => (a.date < b.date ? 1 : -1));

  const curMonth = format(today, 'yyyy-MM');
  const budgets: Budget[] = [
    { id: uid(), category: 'Food', monthlyLimit: 800, month: curMonth },
    { id: uid(), category: 'Transport', monthlyLimit: 400, month: curMonth },
    { id: uid(), category: 'Entertainment', monthlyLimit: 200, month: curMonth },
    { id: uid(), category: 'Housing', monthlyLimit: 1500, month: curMonth },
    { id: uid(), category: 'Health', monthlyLimit: 250, month: curMonth },
  ];

  return { accounts, transactions, budgets };
}
