import { useMemo } from 'react';
import { format, startOfMonth, subMonths, endOfMonth } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Money } from '../components/ui/Money';
import { PageHeader } from '../components/layout/PageHeader';
import { useStore } from '../store/useStore';
import {
  classForValue,
  formatShortCurrency,
  getTotalBalance,
  isSameMonth,
  monthKey,
  monthLabel,
} from '../lib/utils';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../types';

interface DashboardProps {
  onNewTx: () => void;
}

export function Dashboard({ onNewTx }: DashboardProps) {
  const accounts = useStore(s => s.accounts);
  const transactions = useStore(s => s.transactions);
  const currency = useStore(s => s.settings.currency);

  const totalBalance = getTotalBalance(accounts, transactions);

  const today = new Date();
  const monthTxs = useMemo(
    () => transactions.filter(t => isSameMonth(t.date, today)),
    [transactions]
  );

  const monthIncome = monthTxs
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = monthTxs
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const netMonth = monthIncome - monthExpenses;

  // Balance evolution over last 12 months
  const balanceEvolution = useMemo(() => {
    const months: { key: string; label: string; balance: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      const endIso = endOfMonth(d).toISOString();
      const txUpTo = transactions.filter(t => t.date <= endIso);
      const balance = accounts.reduce((acc, a) => {
        let b = a.initialBalance;
        for (const t of txUpTo) {
          if (t.accountId === a.id) {
            if (t.type === 'income') b += t.amount;
            else if (t.type === 'expense') b -= t.amount;
            else if (t.type === 'transfer') b -= t.amount;
          }
          if (t.transferToAccountId === a.id && t.type === 'transfer') b += t.amount;
        }
        return acc + b;
      }, 0);
      months.push({
        key: monthKey(d),
        label: monthLabel(monthKey(d)),
        balance: Math.round(balance * 100) / 100,
      });
    }
    return months;
  }, [transactions, accounts]);

  // Expense breakdown by category (current month)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of monthTxs) {
      if (t.type !== 'expense') continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [monthTxs]);

  const totalCat = categoryBreakdown.reduce((s, c) => s + c.value, 0);

  // Income vs Expenses last 6 months
  const monthlyIE = useMemo(() => {
    const out: { key: string; label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const mk = monthKey(d);
      const inc = transactions
        .filter(t => t.type === 'income' && monthKey(t.date) === mk)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter(t => t.type === 'expense' && monthKey(t.date) === mk)
        .reduce((s, t) => s + t.amount, 0);
      out.push({
        key: mk,
        label: monthLabel(mk),
        income: Math.round(inc * 100) / 100,
        expense: Math.round(exp * 100) / 100,
      });
    }
    return out;
  }, [transactions]);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 10),
    [transactions]
  );
  const accMap = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${format(today, 'EEEE, MMMM d, yyyy')} — your financial overview at a glance.`}
        actions={
          <Button icon={<Plus size={16} />} onClick={onNewTx}>
            New Transaction
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card glow={totalBalance >= 0 ? 'pos' : 'neg'} id="kpi-total-balance">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Total Balance
            </div>
            <Wallet size={16} className={classForValue(totalBalance)} />
          </div>
          <div className="mt-2">
            <Money value={totalBalance} className="text-2xl font-semibold" animate />
          </div>
          <div className="text-xs text-muted mt-1">Across {accounts.length} accounts</div>
        </Card>

        <Card glow="pos" id="kpi-income">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Monthly Income
            </div>
            <ArrowUpRight size={16} className="text-pos" />
          </div>
          <div className="mt-2">
            <Money value={monthIncome} className="text-2xl font-semibold" animate />
          </div>
          <div className="text-xs text-muted mt-1">
            {monthTxs.filter(t => t.type === 'income').length} incoming tx
          </div>
        </Card>

        <Card glow="neg" id="kpi-expenses">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Monthly Expenses
            </div>
            <ArrowDownRight size={16} className="text-neg" />
          </div>
          <div className="mt-2">
            <Money value={monthExpenses} className="text-2xl font-semibold" animate signInvert />
          </div>
          <div className="text-xs text-muted mt-1">
            {monthTxs.filter(t => t.type === 'expense').length} outgoing tx
          </div>
        </Card>

        <Card glow={netMonth >= 0 ? 'pos' : 'neg'} id="kpi-net">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Net this Month
            </div>
            {netMonth >= 0 ? (
              <TrendingUp size={16} className="text-pos" />
            ) : (
              <TrendingDown size={16} className="text-neg" />
            )}
          </div>
          <div className="mt-2">
            <Money value={netMonth} className="text-2xl font-semibold" animate forceSign />
          </div>
          <div className="text-xs text-muted mt-1">
            Savings rate: {monthIncome > 0 ? Math.round((netMonth / monthIncome) * 100) : 0}%
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Balance line */}
        <Card className="lg:col-span-2" id="balance-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">Balance Evolution</h2>
              <p className="text-xs text-muted mt-0.5">Last 12 months</p>
            </div>
            <PiggyBank size={18} className="text-muted" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={balanceEvolution} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(v: number) => formatShortCurrency(v, currency)}
              />
              <Tooltip
                formatter={(v: number) => formatShortCurrency(v, currency)}
                cursor={{ stroke: '#1e1e2e' }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#balGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Donut */}
        <Card id="category-donut">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Expense Breakdown</h2>
            <p className="text-xs text-muted mt-0.5">This month by category</p>
          </div>
          {categoryBreakdown.length > 0 ? (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {categoryBreakdown.map((c, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[c.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatShortCurrency(v, currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[10px] text-muted uppercase tracking-wider">
                    Total
                  </div>
                  <Money
                    value={-totalCat}
                    className="text-sm font-semibold"
                    signInvert
                  />
                </div>
              </div>
              <div className="space-y-1.5 mt-4 max-h-40 overflow-y-auto pr-1">
                {categoryBreakdown.slice(0, 6).map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[c.name] || '#64748b' }}
                      />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-muted">
                        {totalCat > 0 ? ((c.value / totalCat) * 100).toFixed(0) : 0}%
                      </span>
                      <Money value={-c.value} className="font-medium" signInvert />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-muted">
              No expenses this month yet.
            </div>
          )}
        </Card>
      </div>

      {/* Income vs Expenses + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" id="income-expense-chart">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Income vs Expenses</h2>
            <p className="text-xs text-muted mt-0.5">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyIE} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(v: number) => formatShortCurrency(v, currency)}
              />
              <Tooltip
                formatter={(v: number) => formatShortCurrency(v, currency)}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card id="recent-transactions">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <p className="text-xs text-muted mt-0.5">Last 10 transactions</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-pos hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && (
              <div className="py-4 text-center text-sm text-muted">
                No transactions yet
              </div>
            )}
            {recent.map(t => {
              const signed =
                t.type === 'income'
                  ? t.amount
                  : t.type === 'expense'
                  ? -t.amount
                  : 0;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-sm flex-shrink-0">
                      {CATEGORY_EMOJIS[t.category] || '💳'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm truncate">{t.description}</div>
                      <div className="text-[11px] text-muted truncate">
                        {format(new Date(t.date), 'MMM d')} · {accMap[t.accountId]}
                      </div>
                    </div>
                  </div>
                  <Money
                    value={signed}
                    className="text-sm font-medium flex-shrink-0"
                    forceSign
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
