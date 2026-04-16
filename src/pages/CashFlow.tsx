import { useMemo } from 'react';
import { addDays, addMonths, addWeeks, format, isBefore, startOfDay } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Money } from '../components/ui/Money';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { useStore } from '../store/useStore';
import {
  dayKey,
  formatShortCurrency,
  getTotalBalance,
  isSameMonth,
  signedAmount,
} from '../lib/utils';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, Transaction } from '../types';

function nextOccurrence(tx: Transaction, after: Date): Date | null {
  if (tx.recurrence === 'none') return null;
  let d = new Date(tx.date);
  const step = tx.recurrence;
  // Loop forward to the first occurrence >= after
  for (let i = 0; i < 400; i++) {
    if (!isBefore(d, after)) return d;
    if (step === 'daily') d = addDays(d, 1);
    else if (step === 'weekly') d = addWeeks(d, 1);
    else if (step === 'monthly') d = addMonths(d, 1);
    else return null;
  }
  return null;
}

export function CashFlow() {
  const transactions = useStore(s => s.transactions);
  const accounts = useStore(s => s.accounts);
  const currency = useStore(s => s.settings.currency);
  const today = startOfDay(new Date());

  // Waterfall: current month income by category → expenses by category → net
  const waterfall = useMemo(() => {
    const monthTx = transactions.filter(t => isSameMonth(t.date, today));
    const incomeByCat: Record<string, number> = {};
    const expByCat: Record<string, number> = {};
    for (const t of monthTx) {
      if (t.type === 'income') incomeByCat[t.category] = (incomeByCat[t.category] || 0) + t.amount;
      else if (t.type === 'expense')
        expByCat[t.category] = (expByCat[t.category] || 0) + t.amount;
    }
    const totalInc = Object.values(incomeByCat).reduce((s, v) => s + v, 0);
    const totalExp = Object.values(expByCat).reduce((s, v) => s + v, 0);
    const net = totalInc - totalExp;

    // Build bars: income bars (positive), then expense bars (negative), then net marker
    let running = 0;
    const bars: {
      name: string;
      start: number;
      end: number;
      value: number;
      type: 'inflow' | 'outflow' | 'net';
      color: string;
    }[] = [];

    const incomeEntries = Object.entries(incomeByCat).sort((a, b) => b[1] - a[1]);
    for (const [cat, v] of incomeEntries) {
      bars.push({
        name: cat,
        start: running,
        end: running + v,
        value: v,
        type: 'inflow',
        color: CATEGORY_COLORS[cat] || '#3b82f6',
      });
      running += v;
    }
    const expenseEntries = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
    for (const [cat, v] of expenseEntries) {
      bars.push({
        name: cat,
        start: running - v,
        end: running,
        value: -v,
        type: 'outflow',
        color: CATEGORY_COLORS[cat] || '#ef4444',
      });
      running -= v;
    }
    // Net marker
    bars.push({
      name: 'Net',
      start: 0,
      end: net,
      value: net,
      type: 'net',
      color: net >= 0 ? '#3b82f6' : '#ef4444',
    });

    return { bars, totalInc, totalExp, net };
  }, [transactions]);

  // Projected balance for next 30 days using recurring
  const projection = useMemo(() => {
    const days: { label: string; date: string; balance: number; change: number }[] = [];
    const recurring = transactions.filter(t => t.recurrence !== 'none');

    let runningBalance = getTotalBalance(accounts, transactions);
    for (let i = 0; i < 30; i++) {
      const d = addDays(today, i);
      let change = 0;
      for (const r of recurring) {
        const next = nextOccurrence(r, addDays(today, 1));
        if (!next) continue;
        // Walk through all upcoming occurrences within 30 days
        let occ: Date | null = next;
        let guard = 0;
        while (occ && guard < 40) {
          if (format(occ, 'yyyy-MM-dd') === dayKey(d)) {
            change += signedAmount(r);
          }
          if (occ > addDays(today, 30)) break;
          if (r.recurrence === 'daily') occ = addDays(occ, 1);
          else if (r.recurrence === 'weekly') occ = addWeeks(occ, 1);
          else if (r.recurrence === 'monthly') occ = addMonths(occ, 1);
          else break;
          guard++;
        }
      }
      runningBalance += change;
      days.push({
        label: format(d, 'MMM d'),
        date: dayKey(d),
        balance: Math.round(runningBalance * 100) / 100,
        change: Math.round(change * 100) / 100,
      });
    }
    return days;
  }, [transactions, accounts]);

  // Upcoming (next 7 days, from recurring)
  const upcoming = useMemo(() => {
    const out: { tx: Transaction; nextDate: Date }[] = [];
    const horizon = addDays(today, 7);
    for (const r of transactions.filter(t => t.recurrence !== 'none')) {
      let occ = nextOccurrence(r, addDays(today, 0));
      let guard = 0;
      while (occ && occ <= horizon && guard < 30) {
        out.push({ tx: r, nextDate: occ });
        if (r.recurrence === 'daily') occ = addDays(occ, 1);
        else if (r.recurrence === 'weekly') occ = addWeeks(occ, 1);
        else if (r.recurrence === 'monthly') occ = addMonths(occ, 1);
        else break;
        guard++;
      }
    }
    out.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return out;
  }, [transactions]);

  const accMap = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  );

  return (
    <div>
      <PageHeader
        title="Cash Flow"
        description="Visualize how money flows through your accounts and what's coming next."
      />

      {/* Top summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card glow="pos">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Total Inflows
            </div>
            <ArrowUpRight size={16} className="text-pos" />
          </div>
          <Money
            value={waterfall.totalInc}
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">This month</div>
        </Card>
        <Card glow="neg">
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Total Outflows
            </div>
            <ArrowDownRight size={16} className="text-neg" />
          </div>
          <Money
            value={-waterfall.totalExp}
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">This month</div>
        </Card>
        <Card glow={waterfall.net >= 0 ? 'pos' : 'neg'}>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Net Flow
            </div>
          </div>
          <Money
            value={waterfall.net}
            forceSign
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">
            {waterfall.totalInc > 0
              ? `${Math.round((waterfall.net / waterfall.totalInc) * 100)}% savings rate`
              : '—'}
          </div>
        </Card>
      </div>

      {/* Waterfall */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Money Flow Waterfall</h2>
          <p className="text-xs text-muted mt-0.5">
            Income sources build up, expenses break down, final net balance
          </p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={waterfall.bars}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(v: number) => formatShortCurrency(v, currency)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-lg p-2.5 text-xs">
                    <div className="font-medium">{p.name}</div>
                    <div
                      className={
                        p.type === 'inflow'
                          ? 'text-pos'
                          : p.type === 'outflow'
                          ? 'text-neg'
                          : p.value >= 0
                          ? 'text-pos'
                          : 'text-neg'
                      }
                    >
                      {formatShortCurrency(p.value, currency)}
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="#2a2a3a" />
            <Bar
              dataKey={(d: { start: number; end: number }) => [d.start, d.end]}
              radius={[4, 4, 4, 4]}
            >
              {waterfall.bars.map((b, i) => (
                <Cell key={i} fill={b.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Projection + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-semibold">30-Day Balance Projection</h2>
            <p className="text-xs text-muted mt-0.5">
              Forecast based on recurring transactions
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={projection}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#projGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Upcoming</h2>
              <p className="text-xs text-muted mt-0.5">Next 7 days</p>
            </div>
            <Clock size={18} className="text-muted" />
          </div>
          {upcoming.length === 0 ? (
            <div className="text-sm text-muted text-center py-6">
              No recurring transactions in the next 7 days.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {upcoming.map((u, i) => {
                const sign = signedAmount(u.tx);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-hover/50 border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm flex-shrink-0">
                      {CATEGORY_EMOJIS[u.tx.category] || '🔁'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{u.tx.description}</div>
                      <div className="text-[11px] text-muted">
                        {format(u.nextDate, 'EEE, MMM d')} ·{' '}
                        {accMap[u.tx.accountId]}
                      </div>
                    </div>
                    <Money
                      value={sign}
                      className="text-sm font-medium"
                      forceSign
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Flow legend */}
      <Card>
        <div className="mb-4">
          <h2 className="text-base font-semibold">Flow Lines</h2>
          <p className="text-xs text-muted mt-0.5">
            Breakdown of how each category contributes to your net balance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {waterfall.bars
            .filter(b => b.type !== 'net')
            .map((b, i) => {
              const pct =
                b.type === 'inflow'
                  ? (b.value / (waterfall.totalInc || 1)) * 100
                  : (Math.abs(b.value) / (waterfall.totalExp || 1)) * 100;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-hover/50 border border-border"
                >
                  <Badge
                    variant={b.type === 'inflow' ? 'pos' : 'neg'}
                    className="!text-[10px]"
                  >
                    {b.type === 'inflow' ? 'IN' : 'OUT'}
                  </Badge>
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: b.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-sm truncate">{b.name}</span>
                      <Money
                        value={b.value}
                        forceSign
                        className="text-sm font-medium"
                      />
                    </div>
                    <div className="h-1 rounded-full bg-surface mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: b.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
