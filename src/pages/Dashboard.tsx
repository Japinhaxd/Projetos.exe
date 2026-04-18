import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useStore, getAccountBalance, getMonthlyTotals, getTotalBalance } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { MoneyText } from '../components/ui/MoneyText';
import { round2, sum, formatCompact } from '../lib/money';
import { CATEGORY_COLORS } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { t, tc, money, lang } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);

  const now = new Date();
  const totalBalance = getTotalBalance(accounts, transactions);
  const monthly = getMonthlyTotals(transactions, now.getFullYear(), now.getMonth());

  // ==========================================================
  // Balance over time: last 12 months
  // ==========================================================
  const balanceSeries = useMemo(() => {
    const series: { month: string; balance: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthDate);
      // compute balance at end of this month
      let bal = sum(accounts.map((a) => a.initialBalance));
      for (const tx of transactions) {
        if (tx.tags?.includes('__split_parent')) continue;
        const d = new Date(tx.date);
        if (d > monthEnd) continue;
        if (tx.type === 'income') bal += tx.amount;
        else if (tx.type === 'expense') bal -= tx.amount;
      }
      series.push({
        month: format(monthDate, 'MMM'),
        balance: round2(bal),
      });
    }
    return series;
  }, [transactions, accounts]);

  // ==========================================================
  // Category donut — current month expenses
  // ==========================================================
  const categoryData = useMemo(() => {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date);
      if (!isWithinInterval(d, { start: monthStart, end: monthEnd })) continue;
      map[tx.category] = round2((map[tx.category] || 0) + tx.amount);
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // ==========================================================
  // Income vs Expense — last 6 months
  // ==========================================================
  const barData = useMemo(() => {
    const arr: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const mt = getMonthlyTotals(transactions, d.getFullYear(), d.getMonth());
      arr.push({ label: format(d, 'MMM'), income: mt.income, expense: mt.expense });
    }
    return arr;
  }, [transactions]);

  // ==========================================================
  // Recent transactions (last 10)
  // ==========================================================
  const recent = useMemo(() => {
    return [...transactions]
      .filter((tx) => !tx.tags?.includes('__split_parent'))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 10);
  }, [transactions]);

  const hasData = transactions.length > 0 || accounts.length > 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted">{format(now, 'EEEE, MMM d, yyyy')}</p>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={Wallet}
          label={t('dashboard.totalBalance')}
          value={totalBalance}
          tone="auto"
        />
        <KpiCard
          icon={ArrowUpRight}
          label={t('dashboard.monthlyIncome')}
          value={monthly.income}
          tone="pos"
        />
        <KpiCard
          icon={ArrowDownRight}
          label={t('dashboard.monthlyExpenses')}
          value={-monthly.expense}
          tone="neg"
          displayAbsolute={false}
        />
        <KpiCard
          icon={DollarSign}
          label={t('dashboard.netThisMonth')}
          value={monthly.net}
          tone="auto"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Line chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-pos" />
            {t('dashboard.balanceOverTime')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={balanceSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => money(v)}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-neg" />
            {t('dashboard.expenseByCategory')}
          </h3>
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted">
              {t('common.empty')}
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((d) => (
                      <Cell
                        key={d.name}
                        fill={CATEGORY_COLORS[d.name] || '#64748b'}
                        stroke="var(--bg-surface)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 8,
                    }}
                    formatter={(v: number, _n: any, p: any) => [money(v), tc(p.payload.name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {categoryData.length > 0 && (
            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto pr-1">
              {categoryData.slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[d.name] || '#64748b' }}
                    />
                    <span className="truncate">{tc(d.name)}</span>
                  </span>
                  <MoneyText value={-d.value} colored size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">{t('dashboard.incomeVsExpenses')}</h3>
        <div className="h-60">
          <ResponsiveContainer>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="label" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 8,
                }}
                formatter={(v: number) => money(v)}
              />
              <Legend
                formatter={(val: string) =>
                  val === 'income' ? t('common.income') : t('common.expense')
                }
              />
              <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{t('dashboard.recentTransactions')}</h3>
          <Link to="/transactions" className="text-xs text-pos hover:underline">
            {t('common.all')} →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('dashboard.noTransactions')}
            description={t('dashboard.startByAdding')}
            action={
              <Link to="/transactions" className="btn btn-primary">
                {t('transactions.new')}
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {recent.map((tx) => {
              const acc = accounts.find((a) => a.id === tx.accountId);
              const sign = tx.type === 'income' ? 1 : tx.type === 'expense' ? -1 : 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        sign > 0 ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)',
                      color: sign > 0 ? '#3b82f6' : '#ef4444',
                    }}
                  >
                    {sign > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tx.description}</div>
                    <div className="text-[11px] text-muted flex gap-2">
                      <span>{tc(tx.category)}</span>
                      {acc && (
                        <>
                          <span>·</span>
                          <span>{acc.name}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{format(new Date(tx.date), 'dd MMM')}</span>
                    </div>
                  </div>
                  <MoneyText
                    value={sign * tx.amount}
                    size="sm"
                    className="font-semibold"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface KpiProps {
  icon: any;
  label: string;
  value: number;
  tone: 'pos' | 'neg' | 'auto';
  displayAbsolute?: boolean;
}

function KpiCard({ icon: Icon, label, value, tone, displayAbsolute }: KpiProps) {
  const toneClass =
    tone === 'pos' ? 'card-pos' : tone === 'neg' ? 'card-neg' : value < 0 ? 'card-neg' : 'card-pos';
  const iconColor = tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : value < 0 ? 'text-neg' : 'text-pos';
  const iconBg = tone === 'pos' ? 'bg-pos-soft' : tone === 'neg' ? 'bg-neg-soft' : value < 0 ? 'bg-neg-soft' : 'bg-pos-soft';

  const forceColor = tone === 'pos' ? 'pos' : tone === 'neg' ? 'neg' : undefined;

  return (
    <div className={`card ${toneClass} p-5 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <MoneyText
        value={displayAbsolute === false ? value : value}
        animate
        size="xl"
        forceColor={forceColor}
      />
    </div>
  );
}
