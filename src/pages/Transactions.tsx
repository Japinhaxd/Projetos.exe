import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Check,
  Download,
  Edit3,
  Plus,
  Scissors,
  Search,
  Trash2,
  Filter as FilterIcon,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Money } from '../components/ui/Money';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/layout/EmptyState';
import { TransactionDrawer } from '../components/TransactionDrawer';
import { Confirm, Modal } from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Input';
import { CATEGORIES, CATEGORY_EMOJIS, Transaction } from '../types';
import { useStore } from '../store/useStore';
import { downloadFile, txToCSV, uid } from '../lib/utils';

export function Transactions() {
  const transactions = useStore(s => s.transactions);
  const accounts = useStore(s => s.accounts);
  const removeTransaction = useStore(s => s.removeTransaction);
  const removeTransactions = useStore(s => s.removeTransactions);
  const bulkRecategorize = useStore(s => s.bulkRecategorize);
  const splitTransaction = useStore(s => s.splitTransaction);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [bulkCat, setBulkCat] = useState(false);
  const [bulkCatValue, setBulkCatValue] = useState<string>('Food');
  const [splitOpen, setSplitOpen] = useState<Transaction | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const accMap = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return transactions
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (filterAccount !== 'all' && t.accountId !== filterAccount) return false;
        if (dateFrom && t.date.slice(0, 10) < dateFrom) return false;
        if (dateTo && t.date.slice(0, 10) > dateTo) return false;
        if (q) {
          const hay = `${t.description} ${t.category} ${t.tags.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, query, filterType, filterCategory, filterAccount, dateFrom, dateTo]);

  const totalIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  const anyFilterActive =
    query ||
    filterType !== 'all' ||
    filterCategory !== 'all' ||
    filterAccount !== 'all' ||
    dateFrom ||
    dateTo;

  function clearFilters() {
    setQuery('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
    setDateFrom('');
    setDateTo('');
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(t => t.id)));
  }

  function handleExport() {
    const csv = txToCSV(filtered, accounts);
    const fn = `finance-os-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadFile(fn, csv, 'text/csv');
  }

  function onEdit(t: Transaction) {
    setEditing(t);
    setDrawerOpen(true);
  }
  function onCloseDrawer() {
    setDrawerOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Add, edit, split and organize every movement of your money."
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
            >
              New Transaction
            </Button>
          </>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="!p-4">
          <div className="text-[11px] text-muted uppercase tracking-wide">Showing</div>
          <div className="text-xl font-semibold mt-0.5">{filtered.length}</div>
          <div className="text-xs text-muted">of {transactions.length}</div>
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] text-muted uppercase tracking-wide">Income</div>
          <Money value={totalIncome} className="text-xl font-semibold mt-0.5 block" />
        </Card>
        <Card className="!p-4">
          <div className="text-[11px] text-muted uppercase tracking-wide">Expenses</div>
          <Money
            value={totalExpense}
            signInvert
            className="text-xl font-semibold mt-0.5 block"
          />
        </Card>
        <Card className="!p-4" glow={net >= 0 ? 'pos' : 'neg'}>
          <div className="text-[11px] text-muted uppercase tracking-wide">Net</div>
          <Money value={net} forceSign className="text-xl font-semibold mt-0.5 block" />
        </Card>
      </div>

      {/* Filters bar */}
      <Card className="mb-4 !p-4">
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <Input
              id="global-search"
              placeholder="Search description, tags, category…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="!pl-9"
            />
          </div>
          <Select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="!w-auto min-w-[120px]"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </Select>
          <Select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="!w-auto min-w-[140px]"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className="!w-auto min-w-[150px]"
          >
            <option value="all">All accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="!w-auto"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="!w-auto"
          />
          {anyFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X size={14} />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="bg-pos-soft border border-pos/30 rounded-lg px-4 py-2.5 mb-3 flex items-center gap-3 animate-fade-in">
          <div className="text-sm text-pos font-medium">
            {selected.size} selected
          </div>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit3 size={14} />}
            onClick={() => setBulkCat(true)}
          >
            Recategorize
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() =>
              setConfirmDelete({ open: true, ids: Array.from(selected) })
            }
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FilterIcon size={22} />}
            title={anyFilterActive ? 'No matches' : 'No transactions yet'}
            description={
              anyFilterActive
                ? 'Try adjusting your filters to see more transactions.'
                : 'Start by adding your first transaction to track your finances.'
            }
            action={
              anyFilterActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => {
                    setEditing(null);
                    setDrawerOpen(true);
                  }}
                >
                  New Transaction
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 text-left w-10">
                    <button
                      onClick={toggleAll}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selected.size === filtered.length && filtered.length > 0
                          ? 'bg-pos border-pos'
                          : 'border-border-strong'
                      }`}
                    >
                      {selected.size === filtered.length && filtered.length > 0 && (
                        <Check size={12} className="text-white" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Account</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const isSelected = selected.has(t.id);
                  const signed =
                    t.type === 'income'
                      ? t.amount
                      : t.type === 'expense'
                      ? -t.amount
                      : 0;
                  return (
                    <tr
                      key={t.id}
                      className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${
                        isSelected ? 'bg-pos-soft/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(t.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-pos border-pos'
                              : 'border-border-strong'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted tabular-nums whitespace-nowrap">
                        {format(new Date(t.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-surface-hover flex items-center justify-center flex-shrink-0 text-sm">
                            {t.type === 'transfer'
                              ? '🔄'
                              : CATEGORY_EMOJIS[t.category] || '💳'}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate max-w-[240px]">
                              {t.description}
                            </div>
                            {t.tags.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {t.tags.slice(0, 3).map(tag => (
                                  <Badge
                                    key={tag}
                                    variant="muted"
                                    className="!text-[10px] !py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {t.parentId && (
                              <Badge
                                variant="warn"
                                className="!text-[10px] !py-0 mt-0.5"
                              >
                                split
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{t.category}</td>
                      <td className="px-4 py-3 text-muted">
                        {accMap[t.accountId]}
                        {t.type === 'transfer' && t.transferToAccountId && (
                          <span className="text-muted">
                            {' → '}
                            {accMap[t.transferToAccountId]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {t.type === 'transfer' ? (
                          <span className="text-muted inline-flex items-center gap-1">
                            <ArrowLeftRight size={12} />
                            <Money value={t.amount} neutralZero={false} className="!text-text" />
                          </span>
                        ) : (
                          <Money value={signed} className="font-medium" forceSign />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {t.type === 'expense' && (
                            <button
                              onClick={() => setSplitOpen(t)}
                              className="p-1.5 text-muted hover:text-text hover:bg-surface rounded"
                              title="Split"
                            >
                              <Scissors size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({ open: true, ids: [t.id] })
                            }
                            className="p-1.5 text-muted hover:text-neg hover:bg-surface rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drawers / Modals */}
      <TransactionDrawer
        open={drawerOpen}
        onClose={onCloseDrawer}
        editing={editing}
      />
      <Confirm
        open={confirmDelete.open}
        title="Delete transactions"
        message={`This will permanently remove ${confirmDelete.ids.length} transaction(s). This action cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setConfirmDelete({ open: false, ids: [] })}
        onConfirm={() => {
          if (confirmDelete.ids.length === 1) removeTransaction(confirmDelete.ids[0]);
          else removeTransactions(confirmDelete.ids);
          setSelected(new Set());
          setConfirmDelete({ open: false, ids: [] });
        }}
      />

      {/* Bulk recategorize modal */}
      <Modal
        open={bulkCat}
        onClose={() => setBulkCat(false)}
        title="Recategorize Selected"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBulkCat(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                bulkRecategorize(Array.from(selected), bulkCatValue);
                setBulkCat(false);
                setSelected(new Set());
              }}
            >
              Apply
            </Button>
          </div>
        }
      >
        <Field label="New Category">
          <Select
            value={bulkCatValue}
            onChange={e => setBulkCatValue(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <div className="text-xs text-muted mt-3">
          This will update {selected.size} transaction(s).
        </div>
      </Modal>

      {/* Split modal */}
      {splitOpen && (
        <SplitModal
          open={!!splitOpen}
          tx={splitOpen}
          onClose={() => setSplitOpen(null)}
          onSplit={parts => {
            splitTransaction(splitOpen.id, parts);
            setSplitOpen(null);
          }}
        />
      )}
    </div>
  );
}

// ------------------ Split modal ------------------

interface SplitModalProps {
  open: boolean;
  tx: Transaction;
  onClose: () => void;
  onSplit: (parts: { amount: number; category: string; description?: string }[]) => void;
}

function SplitModal({ open, tx, onClose, onSplit }: SplitModalProps) {
  const [parts, setParts] = useState<
    { id: string; amount: string; category: string; description: string }[]
  >([
    { id: uid(), amount: (tx.amount / 2).toFixed(2), category: tx.category, description: '' },
    { id: uid(), amount: (tx.amount / 2).toFixed(2), category: 'Other', description: '' },
  ]);

  const total = parts.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const diff = Math.round((tx.amount - total) * 100) / 100;

  function updatePart(id: string, patch: Partial<(typeof parts)[number]>) {
    setParts(parts.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }
  function addPart() {
    setParts([...parts, { id: uid(), amount: '0', category: 'Other', description: '' }]);
  }
  function removePart(id: string) {
    if (parts.length <= 2) return;
    setParts(parts.filter(p => p.id !== id));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Split Transaction"
      maxWidth="560px"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={Math.abs(diff) > 0.01}
            onClick={() =>
              onSplit(
                parts.map(p => ({
                  amount: parseFloat(p.amount) || 0,
                  category: p.category,
                  description: p.description,
                }))
              )
            }
          >
            Create Split
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card className="!p-3 bg-surface-hover">
          <div className="text-xs text-muted">Original transaction</div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-sm">{tx.description}</div>
            <Money value={-tx.amount} className="font-semibold" signInvert />
          </div>
        </Card>

        <div className="space-y-2">
          {parts.map((p, i) => (
            <div
              key={p.id}
              className="flex gap-2 items-start bg-surface-hover border border-border rounded-lg p-2"
            >
              <div className="w-6 h-6 flex-shrink-0 rounded bg-surface text-xs flex items-center justify-center text-muted mt-1.5">
                {i + 1}
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={p.amount}
                onChange={e => updatePart(p.id, { amount: e.target.value })}
                className="!w-28"
              />
              <Select
                value={p.category}
                onChange={e => updatePart(p.id, { category: e.target.value })}
                className="!w-36"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Description (optional)"
                value={p.description}
                onChange={e => updatePart(p.id, { description: e.target.value })}
              />
              <button
                onClick={() => removePart(p.id)}
                disabled={parts.length <= 2}
                className="p-1.5 text-muted hover:text-neg disabled:opacity-30"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={addPart}>
            Add part
          </Button>
          <div className="flex gap-4 text-xs text-muted">
            <span>
              Original: <Money value={tx.amount} neutralZero={false} className="!text-text" />
            </span>
            <span>
              Sum: <Money value={total} neutralZero={false} className="!text-text" />
            </span>
            <span>
              Diff:{' '}
              <span
                className={
                  Math.abs(diff) > 0.01
                    ? 'text-warn font-medium'
                    : 'text-pos font-medium'
                }
              >
                {diff >= 0 ? '+' : ''}
                {diff.toFixed(2)}
              </span>
            </span>
          </div>
        </div>

        {Math.abs(diff) > 0.01 && (
          <div className="text-xs text-warn">
            The sum of parts must match the original amount exactly.
          </div>
        )}
      </div>
    </Modal>
  );
}
