import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Pencil,
  Tag,
  ArrowDown,
  ArrowUp,
  ArrowRightLeft,
  Filter as FilterIcon,
  X,
  Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { TransactionDrawer } from '../components/modals/TransactionDrawer';
import { MoneyText } from '../components/ui/MoneyText';
import { CATEGORIES, type Transaction, type TransactionType } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { Confirm } from '../components/ui/Confirm';
import { Modal } from '../components/ui/Modal';

export function Transactions() {
  const { t, tc } = useI18n();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const deleteTxs = useStore((s) => s.deleteTransactions);
  const recategorize = useStore((s) => s.recategorize);
  const pushToast = useStore((s) => s.pushToast);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recatOpen, setRecatOpen] = useState(false);
  const [recatCategory, setRecatCategory] = useState<string>('Other');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    function openDrawer() {
      setEditing(null);
      setDrawerOpen(true);
    }
    window.addEventListener('financeOS:newTransaction', openDrawer);
    return () => window.removeEventListener('financeOS:newTransaction', openDrawer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((tx) => !tx.tags?.includes('__split_parent'))
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
        if (accountFilter !== 'all' && tx.accountId !== accountFilter) return false;
        if (tagFilter && !tx.tags?.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
        if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(tx.date) > new Date(dateTo + 'T23:59:59')) return false;
        if (q) {
          const hay =
            tx.description.toLowerCase() +
            ' ' +
            tx.category.toLowerCase() +
            ' ' +
            (tx.tags || []).join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [transactions, query, typeFilter, categoryFilter, accountFilter, tagFilter, dateFrom, dateTo]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  }

  function clearFilters() {
    setQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setTagFilter('');
    setDateFrom('');
    setDateTo('');
  }

  function handleExportCSV() {
    const rows = [
      ['Date', 'Type', 'Description', 'Category', 'Account', 'Amount', 'Tags'],
      ...filtered.map((tx) => {
        const acc = accounts.find((a) => a.id === tx.accountId)?.name || '';
        return [
          format(new Date(tx.date), 'yyyy-MM-dd'),
          tx.type,
          `"${tx.description.replace(/"/g, '""')}"`,
          tx.category,
          acc,
          tx.amount.toFixed(2),
          `"${(tx.tags || []).filter((tag) => !tag.startsWith('__')).join(', ')}"`,
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeOS_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast({ type: 'success', message: t('toast.exported') });
  }

  const hasAnyFilter =
    !!query ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    accountFilter !== 'all' ||
    !!tagFilter ||
    !!dateFrom ||
    !!dateTo;

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted">{filtered.length} {t('common.total').toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={handleExportCSV} disabled={!filtered.length}>
            <Download size={14} />
            {t('transactions.exportCSV')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            <Plus size={14} />
            {t('transactions.new')}
          </button>
        </div>
      </header>

      {/* Search + filters */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="tx-search"
              className="input pl-9"
              placeholder={t('transactions.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className={`btn ${showFilters || hasAnyFilter ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <FilterIcon size={14} />
            {t('common.filter')}
          </button>
          {hasAnyFilter && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              <X size={14} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 animate-slide-up">
            <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
              <option value="all">{t('common.type')} · {t('common.all')}</option>
              <option value="income">{t('common.income')}</option>
              <option value="expense">{t('common.expense')}</option>
              <option value="transfer">{t('common.transfer')}</option>
            </select>
            <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">{t('common.category')} · {t('common.all')}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tc(c)}
                </option>
              ))}
            </select>
            <select className="input" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
              <option value="all">{t('common.account')} · {t('common.all')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder={t('common.tags')}
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="card p-3 mb-3 flex items-center justify-between animate-slide-up">
          <span className="text-sm">
            <strong>{selected.size}</strong> {t('transactions.selected')}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setRecatOpen(true)}>
              <Tag size={14} />
              {t('transactions.recategorize')}
            </button>
            <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              {t('transactions.deleteSelected')}
            </button>
            <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={Receipt}
            title={t('transactions.noResults')}
            description={hasAnyFilter ? undefined : t('dashboard.startByAdding')}
            action={
              !hasAnyFilter ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditing(null);
                    setDrawerOpen(true);
                  }}
                >
                  {t('transactions.new')}
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-hover">
                <tr className="text-left">
                  <th className="py-2 px-3 w-8">
                    <input
                      type="checkbox"
                      className="accent-pos"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                    {t('common.date')}
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                    {t('common.description')}
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                    {t('common.category')}
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider">
                    {t('common.account')}
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider text-right">
                    {t('common.amount')}
                  </th>
                  <th className="py-2 px-3 text-[11px] font-medium text-muted uppercase tracking-wider w-24">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  const sign = tx.type === 'income' ? 1 : tx.type === 'expense' ? -1 : 0;
                  const signedAmount = sign * tx.amount;
                  return (
                    <tr
                      key={tx.id}
                      className="border-t border-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          className="accent-pos"
                          checked={selected.has(tx.id)}
                          onChange={() => toggle(tx.id)}
                        />
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-muted">
                        {format(new Date(tx.date), 'dd MMM yy')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {tx.type === 'income' ? (
                            <ArrowUp size={13} className="text-pos flex-shrink-0" />
                          ) : tx.type === 'expense' ? (
                            <ArrowDown size={13} className="text-neg flex-shrink-0" />
                          ) : (
                            <ArrowRightLeft size={13} className="text-muted flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate max-w-[240px]">{tx.description}</div>
                            {tx.parentId && (
                              <span className="badge badge-muted mt-0.5">split</span>
                            )}
                            {tx.source === 'pluggy' && (
                              <span className="badge badge-pos mt-0.5 ml-1">🔗 synced</span>
                            )}
                            {tx.recurrence !== 'none' && (
                              <span className="badge badge-muted mt-0.5 ml-1">
                                {t(`common.${tx.recurrence}` as any)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-muted">{tc(tx.category)}</td>
                      <td className="py-2 px-3 text-muted">
                        {acc ? (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: acc.color }}
                            />
                            <span className="truncate max-w-[120px]">{acc.name}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <MoneyText value={signedAmount} size="sm" className="font-semibold" />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setEditing(tx);
                              setDrawerOpen(true);
                            }}
                            aria-label={t('common.edit')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-icon hover:text-neg"
                            onClick={() => {
                              setSelected(new Set([tx.id]));
                              setConfirmDelete(true);
                            }}
                            aria-label={t('common.delete')}
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
        </div>
      )}

      <TransactionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editTx={editing}
      />

      <Confirm
        open={confirmDelete}
        title={t('common.delete') + '?'}
        description={`${selected.size} ${t('transactions.selected')}`}
        onConfirm={() => {
          deleteTxs(Array.from(selected));
          setSelected(new Set());
          pushToast({ type: 'success', message: t('toast.deleted') });
        }}
        onClose={() => setConfirmDelete(false)}
      />

      <Modal
        open={recatOpen}
        onClose={() => setRecatOpen(false)}
        title={t('transactions.recategorize')}
        size="sm"
      >
        <select
          className="input mb-4"
          value={recatCategory}
          onChange={(e) => setRecatCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tc(c)}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setRecatOpen(false)}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              recategorize(Array.from(selected), recatCategory);
              setRecatOpen(false);
              setSelected(new Set());
              pushToast({ type: 'success', message: t('toast.saved') });
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
