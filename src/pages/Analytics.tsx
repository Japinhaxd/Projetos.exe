import { useMemo } from 'react';
import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar,
  Flame,
  Repeat,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Money } from '../components/ui/Money';
import { PageHeader } from '../components/layout/PageHeader';
import { useStore } from '../store/useStore';
import {
  dayKey,
  formatShortCurrency,
  isSameMonth,
  monthKey,
  monthLabel,
} from '../lib/utils';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../types';

export function Analytics() {
  const transactions = useStore(s => s.transactions);
  const currency = useStore(s => s.settings.currency);
  const today = new Date();

  const expenses = useMemo(
    () => transactions.filter(t => t.type === 'expense'),
    [transactions]
  );

  // Heatmap — last 16 weeks (112 days)
  const heatmapDays = useMemo(() => {
    const totalDays = 16 * 7;
    const start = subDays(today, totalDays - 1);
    const dailyTotals: Record<string, number> = {};
    for (const t of expenses) {
      const k = dayKey(t.date);
      dailyTotals[k] = (dailyTotals[k] || 0) + t.amount;
    }
    const out: { date: Date; key: string; value: number }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(start, i);
      const k = dayKey(d);
      out.push({ date: d, key: k, value: dailyTotals[k] || 0 });
    }
    return out;
  }, [expenses]);
  const maxDay = heatmapDays.reduce((m, d) => Math.max(m, d.value), 0);

  function heatColor(value: number): string {
    if (value === 0) return '#111118';
    const ratio = Math.min(1, value / (maxDay || 1));
    // Gradient: red (expenses grow)
    if (ratio < 0.25) return 'rgba(239, 68, 68, 0.2)';
    if (ratio < 0.5) return 'rgba(239, 68, 68, 0.4)';
    if (ratio < 0.75) return 'rgba(239, 68, 68, 0.65)';
    return 'rgba(239, 68, 68, 0.9)';
  }

  // Organize heatmap into weeks (columns) × 7 (rows)
  const heatWeeks = useMemo(() => {
    const weeks: { date: Date; key: string; value: number }[][] = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      weeks.push(heatmapDays.slice(i, i + 7));
    }
    return weeks;
  }, [heatmapDays]);

  // Category breakdown (this month)
  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of expenses) {
      if (!isSameMonth(t.date, today)) continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    const entries = Object.entries(map).map(([name, value]) => ({ name, value }));
    entries.sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    return { entries, total };
  }, [expenses]);

  // Month-over-month
  const momTable = useMemo(() => {
    const out: {
      key: string;
      label: string;
      income: number;
      expense: number;
      net: number;
    }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i);
      const mk = monthKey(d);
      const inc = transactions
        .filter(t => t.type === 'income' && monthKey(t.date) === mk)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter(t => t.type === 'expense' && monthKey(t.date) === mk)
        .reduce((s, t) => s + t.amount, 0);
      out.push({ key: mk, label: monthLabel(mk), income: inc, expense: exp, net: inc - exp });
    }
    return out;
  }, [transactions]);

  // Average daily spend (current month so far)
  const avgDaily = useMemo(() => {
    const mStart = startOfMonth(today);
    const daysElapsed = Math.max(1, differenceInDays(today, mStart) + 1);
    const monthExp = expenses
      .filter(t => isSameMonth(t.date, today))
      .reduce((s, t) => s + t.amount, 0);
    return monthExp / daysElapsed;
  }, [expenses]);

  // 30-day rolling average trend
  const trendLine = useMemo(() => {
    const days: { label: string; date: string; spend: number; rolling: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i);
      const k = dayKey(d);
      const spend = expenses
        .filter(t => dayKey(t.date) === k)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ label: format(d, 'MMM d'), date: k, spend, rolling: 0 });
    }
    // compute rolling 7-day avg
    for (let i = 0; i < days.length; i++) {
      const slice = days.slice(Math.max(0, i - 6), i + 1);
      days[i].rolling =
        slice.reduce((s, d) => s + d.spend, 0) / slice.length;
    }
    return days;
  }, [expenses]);

  // Biggest single expense (last 90 days)
  const biggest = useMemo(() => {
    const cutoff = subDays(today, 90).toISOString();
    const recent = expenses.filter(t => t.date >= cutoff);
    if (recent.length === 0) return null;
    return recent.reduce((a, b) => (a.amount > b.amount ? a : b));
  }, [expenses]);

  // Most frequent expense category (last 90 days)
  const mostFrequent = useMemo(() => {
    const cutoff = subDays(today, 90).toISOString();
    const counts: Record<string, number> = {};
    for (const t of expenses) {
      if (t.date < cutoff) continue;
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    const arr = Object.entries(counts);
    if (arr.length === 0) return null;
    arr.sort((a, b) => b[1] - a[1]);
    return { category: arr[0][0], count: arr[0][1] };
  }, [expenses]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Understand your spending patterns and trends over time."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Avg Daily Spend
            </div>
            <Calendar size={15} className="text-muted" />
          </div>
          <Money
            value={avgDaily}
            className="text-2xl font-semibold mt-2 block"
            signInvert
          />
          <div className="text-xs text-muted mt-1">This month</div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Biggest Expense
            </div>
            <Flame size={15} className="text-neg" />
          </div>
          {biggest ? (
            <>
              <Money
                value={-biggest.amount}
                className="text-2xl font-semibold mt-2 block"
              />
              <div className="text-xs text-muted mt-1 truncate">
                {biggest.description}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted mt-2">No data</div>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Most Frequent
            </div>
            <Repeat size={15} className="text-muted" />
          </div>
          {mostFrequent ? (
            <>
              <div className="text-2xl font-semibold mt-2">
                {CATEGORY_EMOJIS[mostFrequent.category] || '📦'}{' '}
                {mostFrequent.category}
              </div>
              <div className="text-xs text-muted mt-1">
                {mostFrequent.count} transactions · last 90d
              </div>
            </>
          ) : (
            <div className="text-sm text-muted mt-2">No data</div>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              This Month Total
            </div>
            <TrendingDown size={15} className="text-neg" />
          </div>
          <Money
            value={-catBreakdown.total}
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">
            {expenses.filter(t => isSameMonth(t.date, today)).length} transactions
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="mb-6" id="heatmap">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-base font-semibold">Spending Heatmap</h2>
            <p className="text-xs text-muted mt-0.5">Last 16 weeks · daily expenses</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 0.3, 0.5, 0.75, 1].map((r, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background:
                      r === 0 ? '#111118' : `rgba(239, 68, 68, ${0.2 + r * 0.7})`,
                    border: r === 0 ? '1px solid #1e1e2e' : 'none',
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-fit">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 text-[10px] text-muted">
              {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
                <div key={i} className="h-[14px] flex items-center">
                  {d}
                </div>
              ))}
            </div>
            {heatWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map(day => (
                  <div
                    key={day.key}
                    title={`${format(day.date, 'MMM d, yyyy')} — ${day.value.toFixed(2)}`}
                    className="w-[14px] h-[14px] rounded-sm border border-border/60"
                    style={{ background: heatColor(day.value) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Category bars + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold">Category Breakdown</h2>
            <p className="text-xs text-muted mt-0.5">
              % of total expenses this month
            </p>
          </div>
          {catBreakdown.entries.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">
              No expenses this month
            </div>
          ) : (
            <div className="space-y-3">
              {catBreakdown.entries.map(c => {
                const pct = (c.value / catBreakdown.total) * 100;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between items-center mb-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: CATEGORY_COLORS[c.name] || '#64748b',
                          }}
                        />
                        <span>{c.name}</span>
                        <span className="text-xs text-muted">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <Money value={-c.value} signInvert className="font-medium" />
                    </div>
                    <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: CATEGORY_COLORS[c.name] || '#64748b',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Top 5 Categories</h2>
              <p className="text-xs text-muted mt-0.5">By spending this month</p>
            </div>
            <Trophy size={18} className="text-muted" />
          </div>
          {catBreakdown.entries.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">No data</div>
          ) : (
            <div className="space-y-3">
              {catBreakdown.entries.slice(0, 5).map((c, i) => {
                const pct = (c.value / catBreakdown.total) * 100;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        i === 0
                          ? 'bg-pos-soft text-pos'
                          : 'bg-surface-hover text-muted'
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="truncate">
                          {CATEGORY_EMOJIS[c.name] || '📦'} {c.name}
                        </span>
                        <Money value={-c.value} signInvert className="font-medium" />
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: CATEGORY_COLORS[c.name] || '#64748b',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Rolling avg trend */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Spending Trend</h2>
          <p className="text-xs text-muted mt-0.5">
            30 days · daily (bars) and 7-day rolling average (line)
          </p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trendLine} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1e1e2e" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={3}
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
            <Bar dataKey="spend" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={trendLine} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip
              formatter={(v: number) => formatShortCurrency(v, currency)}
            />
            <Line
              type="monotone"
              dataKey="rolling"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* MoM Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Month-over-Month</h2>
            <p className="text-xs text-muted mt-0.5">
              Compare income, expenses and net across 6 months
            </p>
          </div>
          <TrendingUp size={18} className="text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                <th className="text-left py-2 px-3">Month</th>
                <th className="text-right py-2 px-3">Income</th>
                <th className="text-right py-2 px-3">Expenses</th>
                <th className="text-right py-2 px-3">Net</th>
                <th className="text-right py-2 px-3">vs Prev</th>
              </tr>
            </thead>
            <tbody>
              {momTable.map((m, i) => {
                const prev = momTable[i - 1];
                const diff = prev ? m.net - prev.net : 0;
                return (
                  <tr key={m.key} className="border-b border-border/50">
                    <td className="py-2.5 px-3 font-medium">{m.label}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <Money value={m.income} />
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <Money value={-m.expense} />
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <Money value={m.net} forceSign />
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {prev ? <Money value={diff} forceSign /> : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
