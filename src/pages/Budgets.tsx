import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Plus,
  Target,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Money } from '../components/ui/Money';
import { Badge } from '../components/ui/Badge';
import { Confirm, Modal } from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Input';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/layout/EmptyState';
import { CATEGORIES, CATEGORY_EMOJIS, Budget } from '../types';
import { useStore } from '../store/useStore';
import { budgetBarColor, isSameMonth, monthKey } from '../lib/utils';

export function Budgets() {
  const budgets = useStore(s => s.budgets);
  const transactions = useStore(s => s.transactions);
  const addBudget = useStore(s => s.addBudget);
  const updateBudget = useStore(s => s.updateBudget);
  const removeBudget = useStore(s => s.removeBudget);
  const reorderBudgets = useStore(s => s.reorderBudgets);

  const today = new Date();
  const curMonth = monthKey(today);

  // Show only budgets for the current month
  const monthBudgets = useMemo(
    () => budgets.filter(b => b.month === curMonth),
    [budgets, curMonth]
  );

  // Compute spent per category for current month
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      if (!isSameMonth(t.date, today)) continue;
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return map;
  }, [transactions]);

  // Health score
  const healthScore = useMemo(() => {
    if (monthBudgets.length === 0) return 0;
    let healthy = 0;
    for (const b of monthBudgets) {
      const spent = spentByCategory[b.category] || 0;
      if (spent <= b.monthlyLimit) healthy++;
    }
    return Math.round((healthy / monthBudgets.length) * 100);
  }, [monthBudgets, spentByCategory]);

  const totalLimit = monthBudgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = monthBudgets.reduce(
    (s, b) => s + (spentByCategory[b.category] || 0),
    0
  );
  const overCount = monthBudgets.filter(
    b => (spentByCategory[b.category] || 0) > b.monthlyLimit
  ).length;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [category, setCategory] = useState<string>('Food');
  const [limit, setLimit] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<Budget | null>(null);

  // Drag & drop
  const [dragId, setDragId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setCategory(
      CATEGORIES.find(c => !monthBudgets.some(b => b.category === c)) || 'Food'
    );
    setLimit('');
    setModalOpen(true);
  }
  function openEdit(b: Budget) {
    setEditing(b);
    setCategory(b.category);
    setLimit(String(b.monthlyLimit));
    setModalOpen(true);
  }
  function save() {
    const amt = parseFloat(limit);
    if (!amt || amt <= 0) return;
    if (editing) {
      updateBudget(editing.id, { category, monthlyLimit: amt });
    } else {
      addBudget({ category, monthlyLimit: amt, month: curMonth });
    }
    setModalOpen(false);
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }
  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
  }
  function handleDrop(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const ids = monthBudgets.map(b => b.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(overId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...ids];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragId);
    reorderBudgets(next);
    setDragId(null);
  }

  return (
    <div>
      <PageHeader
        title="Budgets"
        description={`Your monthly limits for ${format(today, 'MMMM yyyy')}. Drag to reorder.`}
        actions={
          <Button icon={<Plus size={16} />} onClick={openNew}>
            New Budget
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          glow={healthScore >= 80 ? 'pos' : healthScore < 50 ? 'neg' : 'none'}
        >
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-muted uppercase tracking-wide">
              Health Score
            </div>
            {healthScore >= 80 ? (
              <CheckCircle2 size={15} className="text-pos" />
            ) : (
              <AlertTriangle size={15} className="text-warn" />
            )}
          </div>
          <div
            className={`text-2xl font-semibold mt-2 ${
              healthScore >= 80
                ? 'text-pos'
                : healthScore >= 50
                ? 'text-warn'
                : 'text-neg'
            }`}
          >
            {healthScore}%
          </div>
          <div className="text-xs text-muted mt-1">
            {monthBudgets.length - overCount} / {monthBudgets.length} on track
          </div>
        </Card>

        <Card>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Total Budget
          </div>
          <Money
            value={totalLimit}
            neutralZero={false}
            className="text-2xl font-semibold mt-2 block !text-text"
          />
          <div className="text-xs text-muted mt-1">
            across {monthBudgets.length} categories
          </div>
        </Card>

        <Card>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Spent
          </div>
          <Money
            value={-totalSpent}
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">
            {totalLimit > 0
              ? `${Math.round((totalSpent / totalLimit) * 100)}% of budget`
              : 'no budget set'}
          </div>
        </Card>

        <Card>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Remaining
          </div>
          <Money
            value={totalLimit - totalSpent}
            forceSign
            className="text-2xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">
            {overCount > 0 ? `${overCount} over budget` : 'all within limits'}
          </div>
        </Card>
      </div>

      {/* Budgets list */}
      {monthBudgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target size={22} />}
            title="No budgets for this month"
            description="Set spending limits per category and keep your finances on track."
            action={
              <Button icon={<Plus size={16} />} onClick={openNew}>
                Create first budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {monthBudgets.map(b => {
            const spent = spentByCategory[b.category] || 0;
            const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
            const barColor = budgetBarColor(pct);
            const remaining = b.monthlyLimit - spent;
            const over = pct > 100;
            return (
              <Card
                key={b.id}
                className={`transition-all ${
                  dragId === b.id ? 'opacity-50' : ''
                }`}
                glow={over ? 'neg' : 'none'}
              >
                <div
                  draggable
                  onDragStart={() => handleDragStart(b.id)}
                  onDragOver={e => handleDragOver(e, b.id)}
                  onDrop={e => handleDrop(e, b.id)}
                  onDragEnd={() => setDragId(null)}
                  className="flex items-center gap-3 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={16} className="text-muted flex-shrink-0" />
                  <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-lg flex-shrink-0">
                    {CATEGORY_EMOJIS[b.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium">{b.category}</span>
                        {over && (
                          <Badge variant="neg" className="!text-[10px]">
                            <AlertTriangle size={10} /> Over budget
                          </Badge>
                        )}
                        {pct > 85 && pct <= 100 && (
                          <Badge variant="warn" className="!text-[10px]">
                            Near limit
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm tabular-nums">
                        <span className="text-muted hidden sm:inline">
                          {Math.round(pct)}%
                        </span>
                        <div className="whitespace-nowrap">
                          <Money value={-spent} signInvert className="font-medium" />
                          <span className="text-muted mx-1">/</span>
                          <Money
                            value={b.monthlyLimit}
                            neutralZero={false}
                            className="!text-text"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, pct)}%`,
                          background: barColor,
                          boxShadow: over ? '0 0 8px rgba(239,68,68,0.5)' : undefined,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-muted">
                      <span>
                        {over
                          ? 'Exceeded by '
                          : remaining > 0
                          ? 'Remaining '
                          : 'Limit reached '}
                        <Money
                          value={Math.abs(remaining)}
                          neutralZero
                          className={
                            over
                              ? '!text-neg'
                              : remaining >= 0
                              ? '!text-pos'
                              : '!text-neg'
                          }
                        />
                      </span>
                      <span>Resets {format(new Date(today.getFullYear(), today.getMonth() + 1, 1), 'MMM d')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-2 text-muted hover:text-text hover:bg-surface-hover rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(b)}
                      className="p-2 text-muted hover:text-neg hover:bg-surface-hover rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Budget' : 'New Budget'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Category">
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={!!editing}
            >
              {CATEGORIES.map(c => (
                <option
                  key={c}
                  value={c}
                  disabled={
                    !editing && monthBudgets.some(b => b.category === c)
                  }
                >
                  {c}
                  {!editing && monthBudgets.some(b => b.category === c)
                    ? ' (used)'
                    : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Monthly Limit">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              autoFocus
            />
          </Field>
          <div className="text-xs text-muted">
            This limit will apply for {format(today, 'MMMM yyyy')}. You can
            adjust it anytime.
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Confirm
        open={!!confirmDelete}
        title="Delete budget"
        message={`Remove budget for ${confirmDelete?.category}? This won't delete any transactions.`}
        confirmText="Delete"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) removeBudget(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
