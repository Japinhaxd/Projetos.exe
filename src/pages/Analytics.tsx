import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Flame, TrendingUp, Calendar, BarChart3, Target, Award, Repeat } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { MoneyText } from '../components/ui/MoneyText';
import { CATEGORY_COLORS } from '../types';
import { round2, formatCompact } from '../lib/money';

export function Analytics() {
  const { t, tc, money, lang } = useI18n();
  const transactions = useStore((s) => s.transactions);

  const now = new Date();

  // ==========================================================
  // Heatmap — last 90 days
  // ==========================================================
  const heatmap = useMemo(() => {
    const start = startOfDay(subDays(now, 89));
    const days = eachDayOfInterval({ start, end: now });
    const dayMap: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      if (tx.type !== 'expense') continue;
      const key = format(new Date(tx.date), 'yyyy-MM-dd');
      dayMap[key] = round2((dayMap[key] || 0) + tx.amount);
    }
    const values = Object.values(dayMap);
    const max = values.length ? Math.max(...values) : 0;
    return { days, dayMap, max };
  }, [transactions]);

  // ==========================================================
  // Category breakdown — last 30 days
  // ==========================================================
  const breakdown = useMemo(() => {
    const start = subDays(now, 29);
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date);
      if (d < start || d > now) continue;
      map[tx.category] = round2((map[tx.category] || 0) + tx.amount);
    }
    const total = round2(Object.values(map).reduce((a, b) => a + b, 0));
    const arr = Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
    return { arr, total };
  }, [transactions]);

  // ==========================================================
  // MoM comparison — last 3 months per category
  // ==========================================================
  const momTable = useMemo(() => {
    const months = [0, 1, 2].map((i) => subMonths(now, i));
    const map: Record<string, number[]> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      if (tx.type !== 'expense') continue;
      for (let i = 0; i < 3; i++) {
        const m = months[i];
        const s = startOfMonth(m);
        const e = endOfMonth(m);
        const d = new Date(tx.date);
        if (isWithinInterval(d, { start: s, end: e })) {
          if (!map[tx.category]) map[tx.category] = [0, 0, 0];
          map[tx.category][i] = round2(map[tx.category][i] + tx.amount);
        }
      }
    }
    const rows = Object.entries(map)
      .map(([cat, vals]) => ({ cat, vals }))
      .sort((a, b) => b.vals[0] - a.vals[0]);
    return { rows, months };
  }, [transactions]);

  // ==========================================================
  // Rolling 30-day average
  // ==========================================================
  const rolling = useMemo(() => {
    const days: { day: string; avg: number }[] = [];
    for (let i = 59; i >= 0; i--) {
      const endDay = subDays(now, i);
      const startDay = subDays(endDay, 29);
      let sum = 0;
      for (const tx of transactions) {
        if (tx.tags?.includes('__split_parent')) continue;
        if (tx.type !== 'expense') continue;
        const d = new Date(tx.date);
        if (d >= startDay && d <= endDay) sum += tx.amount;
      }
      days.push({
        day: format(endDay, 'dd/MM'),
        avg: round2(sum / 30),
      });
    }
    return days;
  }, [transactions]);

  // ==========================================================
  // Stats
  // ==========================================================
  const stats = useMemo(() => {
    const start30 = subDays(now, 29);
    const expenses30 = transactions.filter((tx) => {
      if (tx.tags?.includes('__split_parent')) return false;
      if (tx.type !== 'expense') return false;
      const d = new Date(tx.date);
      return d >= start30 && d <= now;
    });
    const total30 = round2(expenses30.reduce((a, b) => a + b.amount, 0));
    const avgDaily = round2(total30 / 30);

    const biggest =
      expenses30.length > 0
        ? expenses30.reduce((max, t) => (t.amount > max.amount ? t : max), expenses30[0])
        : null;

    const freqMap: Record<string, number> = {};
    for (const tx of expenses30) {
      const key = tx.description.trim().toLowerCase();
      if (!key) continue;
      freqMap[key] = (freqMap[key] || 0) + 1;
    }
    const mostFrequent = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];
    const mostFrequentTx = mostFrequent
      ? expenses30.find((t) => t.description.trim().toLowerCase() === mostFrequent[0])
      : null;

    return { avgDaily, biggest, mostFrequent, mostFrequentTx, total30 };
  }, [transactions]);

  const heatColor = (v: number) => {
    if (!v || heatmap.max === 0) return 'bg-surface-hover';
    const r = v / heatmap.max;
    if (r < 0.25) return 'bg-[rgba(239,68,68,0.15)]';
    if (r < 0.5) return 'bg-[rgba(239,68,68,0.35)]';
    if (r < 0.75) return 'bg-[rgba(239,68,68,0.6)]';
    return 'bg-[rgba(239,68,68,0.9)]';
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
        <p className="text-sm text-muted">{t('analytics.heatmapDesc')}</p>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-2">
            <Calendar size={12} />
            {t('analytics.averageDaily')}
          </div>
          <MoneyText value={-stats.avgDaily} forceColor="neg" size="lg" />
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-2">
            <Award size={12} />
            {t('analytics.biggestExpense')}
          </div>
          {stats.biggest ? (
            <>
              <MoneyText value={-stats.biggest.amount} forceColor="neg" size="lg" />
              <div className="text-xs text-muted mt-1 truncate">
                {stats.biggest.description}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted">—</div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-2">
            <Repeat size={12} />
            {t('analytics.mostFrequent')}
          </div>
          {stats.mostFrequentTx ? (
            <>
              <div className="text-lg font-semibold truncate">{stats.mostFrequentTx.description}</div>
              <div className="text-xs text-muted mt-1">
                {stats.mostFrequent?.[1]}× · {tc(stats.mostFrequentTx.category)}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted">—</div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-2">
            <TrendingUp size={12} />
            {t('common.total')} · 30d
          </div>
          <MoneyText value={-stats.total30} forceColor="neg" size="lg" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Flame size={16} className="text-neg" />
          {t('analytics.heatmap')}
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1">
          {heatmap.days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const v = heatmap.dayMap[key] || 0;
            return (
              <div
                key={key}
                className={`${heatColor(v)} aspect-square rounded-sm border border-border/40`}
                title={`${format(d, 'MMM d')} · ${money(v)}`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted mt-3">
          <span>{t('common.empty')}</span>
          <span className="w-3 h-3 rounded-sm bg-surface-hover border border-border" />
          <span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.15)]" />
          <span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.35)]" />
          <span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.6)]" />
          <span className="w-3 h-3 rounded-sm bg-[rgba(239,68,68,0.9)]" />
          <span>{t('analytics.biggestExpense')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-pos" />
            {t('analytics.breakdown')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={breakdown.arr} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--text-muted)"
                  width={80}
                  tickFormatter={(v) => tc(v)}
                />
                <Tooltip formatter={(v: number) => money(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {breakdown.arr.map((d) => (
                    <rect key={d.name} fill={CATEGORY_COLORS[d.name] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Target size={16} className="text-warn" />
            {t('analytics.topCategories')}
          </h3>
          {breakdown.arr.length === 0 ? (
            <div className="text-sm text-muted py-8 text-center">{t('common.empty')}</div>
          ) : (
            <div className="space-y-4">
              {breakdown.arr.slice(0, 5).map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CATEGORY_COLORS[c.name] || '#64748b' }}
                      />
                      <span>{tc(c.name)}</span>
                    </span>
                    <span className="text-muted tabular-nums text-xs">
                      {c.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, c.pct)}%`,
                        background: CATEGORY_COLORS[c.name] || '#64748b',
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-muted mt-1">
                    <MoneyText value={-c.value} size="sm" forceColor="neg" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rolling average */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-pos" />
          {t('analytics.rollingAverage')}
        </h3>
        <div className="h-52">
          <ResponsiveContainer>
            <LineChart data={rolling}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatCompact(v, lang)} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MoM table */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4">{t('analytics.mom')}</h3>
        {momTable.rows.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center">{t('common.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left text-[11px] uppercase tracking-wider text-muted">
                    {t('common.category')}
                  </th>
                  {momTable.months.map((m, i) => (
                    <th
                      key={i}
                      className="py-2 px-2 text-right text-[11px] uppercase tracking-wider text-muted"
                    >
                      {format(m, 'MMM yy')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {momTable.rows.map((row) => (
                  <tr key={row.cat} className="border-b border-border last:border-0">
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: CATEGORY_COLORS[row.cat] || '#64748b' }}
                        />
                        {tc(row.cat)}
                      </span>
                    </td>
                    {row.vals.map((v, i) => (
                      <td key={i} className="py-2 px-2 text-right">
                        <MoneyText value={-v} size="sm" forceColor={v > 0 ? 'neg' : 'zero'} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
