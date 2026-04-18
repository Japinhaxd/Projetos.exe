import { useMemo, useState } from 'react';
import { Plus, AlertTriangle, Target, Trash2, GripVertical, Pencil } from 'lucide-react';
import { startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import { useStore, getCurrentMonth } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { MoneyText } from '../components/ui/MoneyText';
import { CATEGORIES, CATEGORY_COLORS } from '../types';
import { round2, parseAmount } from '../lib/money';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';

export function Budgets() {
  const { t, tc, money } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const budgets = useStore((s) => s.budgets);
  const addBudget = useStore((s) => s.addBudget);
  const updateBudget = useStore((s) => s.updateBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);
  const reorderBudgets = useStore((s) => s.reorderBudgets);
  const pushToast = useStore((s) => s.pushToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<string>('Food');
  const [formLimit, setFormLimit] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = getCurrentMonth();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const budgetRows = useMemo(() => {
    const currentBudgets = budgets
      .filter((b) => b.month === currentMonth)
      .sort((a, b) => a.order - b.order);
    // Spent per category this month
    const spentMap: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.tags?.includes('__split_parent')) continue;
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date);
      if (!isWithinInterval(d, { start: monthStart, end: monthEnd })) continue;
      spentMap[tx.category] = round2((spentMap[tx.category] || 0) + tx.amount);
    }
    return currentBudgets.map((b) => {
      const spent = round2(spentMap[b.category] || 0);
      const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      return {
        ...b,
        spent,
        pct,
        remaining: round2(b.monthlyLimit - spent),
      };
    });
  }, [budgets, transactions, currentMonth, monthStart, monthEnd]);

  const health = useMemo(() => {
    if (budgetRows.length === 0) return { score: 100, onTrack: 0, atRisk: 0, exceeded: 0 };
    let onTrack = 0,
      atRisk = 0,
      exceeded = 0;
    for (const r of budgetRows) {
      if (r.pct >= 100) exceeded++;
      else if (r.pct >= 85) atRisk++;
      else onTrack++;
    }
    const score = Math.round((onTrack / budgetRows.length) * 100);
    return { score, onTrack, atRisk, exceeded };
  }, [budgetRows]);

  function openForm(id?: string) {
    if (id) {
      const b = budgets.find((x) => x.id === id);
      if (!b) return;
      setEditId(id);
      setFormCategory(b.category);
      setFormLimit(String(b.monthlyLimit));
    } else {
      setEditId(null);
      setFormCategory('Food');
      setFormLimit('');
    }
    setModalOpen(true);
  }

  function handleSave() {
    const limit = parseAmount(formLimit);
    if (limit <= 0) {
      pushToast({ type: 'error', message: t('budgets.limitAmount') });
      return;
    }
    if (editId) {
      updateBudget(editId, { category: formCategory, monthlyLimit: limit });
    } else {
      // Prevent duplicates for the same category+month
      const exists = budgets.find(
        (b) => b.month === currentMonth && b.category === formCategory,
      );
      if (exists) {
        updateBudget(exists.id, { monthlyLimit: limit });
      } else {
        addBudget({ category: formCategory, monthlyLimit: limit, month: currentMonth });
      }
    }
    setModalOpen(false);
    pushToast({ type: 'success', message: t('toast.saved') });
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = budgetRows.map((r) => r.id);
    const srcIdx = ids.indexOf(dragId);
    const tgtIdx = ids.indexOf(targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;
    const next = [...ids];
    next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, dragId);
    reorderBudgets(next);
    setDragId(null);
  }

  function barColor(pct: number): string {
    if (pct > 100) return '#ef4444';
    if (pct >= 85) return '#fb923c';
    if (pct >= 60) return '#f59e0b';
    return '#3b82f6';
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t('budgets.title')}</h1>
          <p className="text-sm text-muted">{format(now, 'MMMM yyyy')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <Plus size={14} />
          {t('budgets.new')}
        </button>
      </header>

      {/* Health score */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('budgets.healthScore')}
          </div>
          <div className="text-3xl font-bold tabular-nums text-pos">
            {health.score}%
          </div>
        </div>
        <div className="card card-pos p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('budgets.onTrack')}
          </div>
          <div className="text-3xl font-bold tabular-nums text-pos">{health.onTrack}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('budgets.atRisk')}
          </div>
          <div className="text-3xl font-bold tabular-nums text-warn">{health.atRisk}</div>
        </div>
        <div className="card card-neg p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
            {t('budgets.exceeded')}
          </div>
          <div className="text-3xl font-bold tabular-nums text-neg">{health.exceeded}</div>
        </div>
      </div>

      {/* Budget rows */}
      {budgetRows.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={Target}
            title={t('budgets.empty')}
            action={
              <button className="btn btn-primary" onClick={() => openForm()}>
                <Plus size={14} />
                {t('budgets.new')}
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {budgetRows.map((b) => (
            <div
              key={b.id}
              className="card p-4 group transition-all"
              draggable
              onDragStart={() => onDragStart(b.id)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(b.id)}
              style={{ opacity: dragId === b.id ? 0.5 : 1 }}
            >
              <div className="flex items-center gap-3">
                <GripVertical
                  size={14}
                  className="text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                />
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[b.category] || '#64748b' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tc(b.category)}</span>
                      {b.pct >= 100 && (
                        <span className="badge badge-neg">
                          <AlertTriangle size={10} /> {t('common.over')}
                        </span>
                      )}
                      {b.pct >= 85 && b.pct < 100 && (
                        <span className="badge badge-warn">
                          <AlertTriangle size={10} /> {t('budgets.atRisk')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn-icon" onClick={() => openForm(b.id)}>
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn-icon hover:text-neg"
                        onClick={() => {
                          deleteBudget(b.id);
                          pushToast({ type: 'success', message: t('toast.deleted') });
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2.5 bg-surface-hover rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, b.pct)}%`,
                        background: barColor(b.pct),
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {t('common.spent')} <MoneyText value={b.spent} size="sm" colored={false} />{' '}
                      / {money(b.monthlyLimit)}
                    </span>
                    <span className="tabular-nums" style={{ color: barColor(b.pct) }}>
                      {b.pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? t('common.edit') : t('budgets.new')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t('common.category')}
            </label>
            <select
              className="input"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tc(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t('budgets.limitAmount')}
            </label>
            <input
              className="input tabular-nums"
              inputMode="decimal"
              value={formLimit}
              onChange={(e) => setFormLimit(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
