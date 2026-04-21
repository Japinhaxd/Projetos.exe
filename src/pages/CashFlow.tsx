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
  // Shape:
  //   { name, value, type: 'income' | 'expense' | 'net' }
  // Colors are applied ONLY via <Cell> using the strict rule:
  //   income → blue, expense → red, net → blue if ≥ 0 else red.
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
      value: number;
      type: 'income' | 'expense' | 'net';
      key: string;
    }[] = [];
    data.push({
      name: t('common.income'),
      value: income,
      type: 'income',
      key: 'income',
    });
    for (const e of expenses) {
      data.push({
        name: tc(e.name),
        value: -e.value, // negative bar pointing down
        type: 'expense',
        key: e.name,
      });
    }
    data.push({
      name: t('common.net'),
      value: net,
      type: 'net',
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
              <YAxis
                stroke="var(--text-muted)"
                tickFormatter={(v) => formatCompact(v, lang)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={<WaterfallTooltip money={money} t={t} />}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 4, 4]}
                activeBar={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              >
                {waterfall.data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.type === 'income'
                        ? '#3b82f6'
                        : entry.type === 'expense'
                        ? '#ef4444'
                        : entry.value >= 0
                        ? '#3b82f6'
                        : '#ef4444'
                    }
                  />
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

// ============================================================
// Custom tooltip for the waterfall chart.
// Fixed dark glassmorphism background — NEVER inherits bar color.
// Text color is derived from entry.type so the line matches the rule:
//   income  \u2192 blue (#3b82f6)
//   expense \u2192 red  (#ef4444)
//   net     \u2192 blue if value \u2265 0 else red
// ============================================================
interface WaterfallTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  money: (v: number) => string;
  t: (k: any) => string;
}

function WaterfallTooltip({ active, payload, label, money, t }: WaterfallTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload as {
    name: string;
    value: number;
    type: 'income' | 'expense' | 'net';
  };

  // Color for the value line, matching the bar color rule exactly.
  const valueColor =
    entry.type === 'income'
      ? '#3b82f6'
      : entry.type === 'expense'
      ? '#ef4444'
      : entry.value >= 0
      ? '#3b82f6'
      : '#ef4444';

  // Label: "Entrada" for income/net>=0, "Saída" for expense/net<0
  const kindLabel =
    entry.type === 'expense' || (entry.type === 'net' && entry.value < 0)
      ? t('cashflow.outflows')
      : t('cashflow.inflows');

  return (
    <div
      style={{
        background: '#111118',
        border: '1px solid #1e1e2e',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#e2e8f0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <p style={{ fontWeight: 600, fontSize: 13, margin: 0, marginBottom: 4 }}>
        {label}
      </p>
      <p
        style={{
          color: valueColor,
          fontSize: 12,
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {kindLabel}: {money(Math.abs(entry.value))}
      </p>
    </div>
  );
}
