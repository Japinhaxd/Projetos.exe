import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';
import { addDays, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ArrowRightLeft, Calendar, TrendingUp } from 'lucide-react';
import { useStore, getTotalBalance } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { MoneyText } from '../components/ui/MoneyText';
import { CATEGORY_COLORS } from '../types';
import { round2, formatCompact } from '../lib/money';

export function CashFlow() {
  const { t, tc, money, lang } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // ==========================================================
  // Waterfall data — current month
  // ==========================================================
  const waterfall = useMemo(() => {
    let income = 0;
    const catMap: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      const d = new Date(tx.date);
      if (!isWithinInterval(d, { start: monthStart, end: monthEnd })) continue;
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense')
        catMap[tx.category] = round2((catMap[tx.category] || 0) + tx.amount);
    }
    income = round2(income);
    const expenses = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    expenses.sort((a, b) => b.value - a.value);
    const net = round2(income - expenses.reduce((a, b) => a + b.value, 0));

    const data: {
      name: string;
      positive?: number;
      negative?: number;
      color: string;
      key: string;
    }[] = [];
    data.push({
      name: t('common.income'),
      positive: income,
      color: '#3b82f6',
      key: 'income',
    });
    for (const e of expenses) {
      data.push({
        name: tc(e.name),
        negative: e.value,
        color: CATEGORY_COLORS[e.name] || '#ef4444',
        key: e.name,
      });
    }
    data.push({
      name: t('common.net'),
      positive: net >= 0 ? net : undefined,
      negative: net < 0 ? Math.abs(net) : undefined,
      color: net >= 0 ? '#3b82f6' : '#ef4444',
      key: 'net',
    });
    return { data, income, net, expenses };
  }, [transactions, monthStart, monthEnd, t, tc]);

  // ==========================================================
  // Projected balance — next 30 days based on recurring
  // ==========================================================
  const projection = useMemo(() => {
    const today = getTotalBalance(accounts, transactions);
    const days: { day: string; balance: number }[] = [];
    let running = today;
    // Collect recurring transactions
    const recurring = transactions.filter(
      (tx) =>
        tx.recurrence !== 'none' &&
        !tx.tags?.includes('__split_parent') &&
        tx.type !== 'transfer',
    );
    for (let i = 0; i <= 30; i++) {
      const d = addDays(now, i);
      for (const rec of recurring) {
        const last = new Date(rec.date);
        let match = false;
        if (rec.recurrence === 'daily') match = true;
        else if (rec.recurrence === 'weekly')
          match = d.getDay() === last.getDay() && i > 0;
        else if (rec.recurrence === 'monthly')
          match = d.getDate() === last.getDate() && i > 0;
        if (match) {
          if (rec.type === 'income') running = round2(running + rec.amount);
          else running = round2(running - rec.amount);
        }
      }
      days.push({ day: format(d, 'dd/MM'), balance: running });
    }
    return days;
  }, [transactions, accounts]);

  // ==========================================================
  // Upcoming — next 7 days recurring
  // ==========================================================
  const upcoming = useMemo(() => {
    const items: { date: Date; tx: any }[] = [];
    const recurring = transactions.filter(
      (tx) =>
        tx.recurrence !== 'none' &&
        !tx.tags?.includes('__split_parent') &&
        tx.type !== 'transfer',
    );
    for (let i = 1; i <= 7; i++) {
      const d = addDays(now, i);
      for (const rec of recurring) {
        const last = new Date(rec.date);
        let match = false;
        if (rec.recurrence === 'daily') match = true;
        else if (rec.recurrence === 'weekly') match = d.getDay() === last.getDay();
        else if (rec.recurrence === 'monthly') match = d.getDate() === last.getDate();
        if (match) items.push({ date: d, tx: rec });
      }
    }
    return items;
  }, [transactions]);

  const finalProjected = projection[projection.length - 1]?.balance ?? 0;

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('cashflow.title')}</h1>
        <p className="text-sm text-muted">{format(now, 'MMMM yyyy')}</p>
      </header>

      {/* Waterfall */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-pos" />
            {t('cashflow.waterfall')}
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-pos rounded-full" />
              {t('cashflow.inflows')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-neg rounded-full" />
              {t('cashflow.outflows')}
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={waterfall.data} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                angle={-25}
                textAnchor="end"
                height={60}
                interval={0}
                fontSize={11}
              />
              <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
              <Tooltip
                formatter={(v: number, n: string) => [money(v), n === 'positive' ? t('cashflow.inflows') : t('cashflow.outflows')]}
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="positive" stackId="wf" radius={[4, 4, 0, 0]}>
                {waterfall.data.map((d) => (
                  <Cell key={d.key + '_p'} fill={d.color} />
                ))}
              </Bar>
              <Bar dataKey="negative" stackId="wf" radius={[4, 4, 0, 0]}>
                {waterfall.data.map((d) => (
                  <Cell key={d.key + '_n'} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Projected balance */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-pos" />
              {t('cashflow.projected')}
            </h3>
            <MoneyText value={finalProjected} size="lg" className="font-bold" />
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={projection}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
                <Tooltip
                  formatter={(v: number) => money(v)}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-warn" />
            {t('cashflow.upcoming')}
          </h3>
          {upcoming.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">
              {t('cashflow.noUpcoming')}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {upcoming.map((u, i) => {
                const sign = u.tx.type === 'income' ? 1 : -1;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.tx.description}</div>
                      <div className="text-[11px] text-muted">
                        {format(u.date, 'dd MMM')} · {tc(u.tx.category)}
                      </div>
                    </div>
                    <MoneyText value={sign * u.tx.amount} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card card-pos p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('cashflow.inflows')}
          </div>
          <MoneyText value={waterfall.income} forceColor="pos" size="xl" />
        </div>
        <div className="card card-neg p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('cashflow.outflows')}
          </div>
          <MoneyText
            value={-waterfall.expenses.reduce((a, b) => a + b.value, 0)}
            forceColor="neg"
            size="xl"
          />
        </div>
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('common.net')}
          </div>
          <MoneyText value={waterfall.net} size="xl" />
        </div>
      </div>
    </div>
  );
}
