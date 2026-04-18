import { useEffect, useState } from 'react';
import { Plus, Trash2, Split } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { useStore } from '../../store/useStore';
import { useI18n } from '../../i18n/useI18n';
import { CATEGORIES, type Recurrence, type Transaction, type TransactionType } from '../../types';
import { parseAmount, round2, sum } from '../../lib/money';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

export function TransactionDrawer({ open, onClose, editTx }: Props) {
  const { t, tc } = useI18n();
  const accounts = useStore((s) => s.accounts);
  const addTx = useStore((s) => s.addTransaction);
  const updateTx = useStore((s) => s.updateTransaction);
  const splitTx = useStore((s) => s.splitTransaction);
  const pushToast = useStore((s) => s.pushToast);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');

  const [splitMode, setSplitMode] = useState(false);
  const [parts, setParts] = useState<
    { amount: string; category: string; description: string }[]
  >([{ amount: '', category: 'Food', description: '' }]);

  useEffect(() => {
    if (!open) return;
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setCategory(editTx.category);
      setAccountId(editTx.accountId);
      setToAccountId(editTx.toAccountId || '');
      setDate(format(new Date(editTx.date), 'yyyy-MM-dd'));
      setDescription(editTx.description);
      setTagsInput((editTx.tags || []).filter((x) => !x.startsWith('__')).join(', '));
      setRecurrence(editTx.recurrence);
      setSplitMode(false);
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setAccountId(accounts[0]?.id || '');
      setToAccountId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setDescription('');
      setTagsInput('');
      setRecurrence('none');
      setSplitMode(false);
      setParts([{ amount: '', category: 'Food', description: '' }]);
    }
  }, [open, editTx, accounts]);

  const totalAmount = round2(parseAmount(amount));
  const partsTotal = splitMode ? sum(parts.map((p) => parseAmount(p.amount))) : 0;
  const splitMatches = Math.abs(partsTotal - totalAmount) < 0.005;

  function handleSave() {
    if (!accountId) return;
    const parsedAmount = parseAmount(amount);
    if (parsedAmount <= 0) {
      pushToast({ type: 'error', message: t('common.amount') });
      return;
    }
    if (type === 'transfer' && !toAccountId) {
      pushToast({ type: 'error', message: t('transactions.transferTo') });
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editTx) {
      updateTx(editTx.id, {
        type,
        amount: parsedAmount,
        category,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date: new Date(date).toISOString(),
        description: description || tc(category),
        tags,
        recurrence,
      });
      pushToast({ type: 'success', message: t('toast.saved') });
      onClose();
      return;
    }

    const base = addTx({
      type,
      amount: parsedAmount,
      category,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      date: new Date(date).toISOString(),
      description: description || tc(category),
      tags,
      recurrence,
      source: 'manual',
    });

    if (splitMode) {
      if (!splitMatches) {
        pushToast({ type: 'error', message: t('transactions.splitMismatch') });
        return;
      }
      splitTx(
        base.id,
        parts.map((p) => ({
          amount: parseAmount(p.amount),
          category: p.category,
          description: p.description,
        })),
      );
    }

    pushToast({ type: 'success', message: t('toast.saved') });
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editTx ? t('transactions.edit') : t('transactions.new')}
    >
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['income', 'expense', 'transfer'] as TransactionType[]).map((opt) => {
              const active = type === opt;
              const activeStyle =
                opt === 'income'
                  ? 'bg-pos-soft text-pos border-pos'
                  : opt === 'expense'
                  ? 'bg-neg-soft text-neg border-neg'
                  : 'bg-surface-hover text-text border-border-strong';
              return (
                <button
                  key={opt}
                  className={`h-10 rounded-lg border text-xs font-medium transition-all ${
                    active ? activeStyle : 'border-border hover:border-border-strong text-muted'
                  }`}
                  onClick={() => setType(opt)}
                >
                  {t(`common.${opt}` as any)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.amount')}
          </label>
          <input
            className={`input tabular-nums text-lg ${type === 'expense' ? 'input-neg' : ''}`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Category */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t('common.category')}
            </label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tc(c)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Account */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.account')}
          </label>
          <select
            className="input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {type === 'transfer' && (
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t('transactions.transferTo')}
            </label>
            <select
              className="input"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">—</option>
              {accounts
                .filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.date')}
          </label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.description')}
          </label>
          <input
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={tc(category)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.tags')}
          </label>
          <input
            className="input"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="trabalho, fixo, essencial"
          />
        </div>

        {/* Recurrence */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.recurrence')}
          </label>
          <select
            className="input"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as Recurrence)}
          >
            <option value="none">{t('common.none')}</option>
            <option value="daily">{t('common.daily')}</option>
            <option value="weekly">{t('common.weekly')}</option>
            <option value="monthly">{t('common.monthly')}</option>
          </select>
        </div>

        {/* Split mode (only for new transactions) */}
        {!editTx && type !== 'transfer' && (
          <div className="pt-2 border-t border-border">
            <button
              className={`btn w-full ${splitMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSplitMode((v) => !v)}
            >
              <Split size={14} />
              {t('transactions.split')}
            </button>

            {splitMode && (
              <div className="mt-3 space-y-2 animate-slide-up">
                <p className="text-[11px] text-muted">{t('transactions.splitDesc')}</p>
                {parts.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="input flex-1"
                      inputMode="decimal"
                      placeholder={`${t('transactions.part')} ${i + 1}`}
                      value={p.amount}
                      onChange={(e) => {
                        const next = [...parts];
                        next[i].amount = e.target.value;
                        setParts(next);
                      }}
                    />
                    <select
                      className="input flex-1"
                      value={p.category}
                      onChange={(e) => {
                        const next = [...parts];
                        next[i].category = e.target.value;
                        setParts(next);
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {tc(c)}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-icon text-neg"
                      onClick={() => setParts(parts.filter((_, idx) => idx !== i))}
                      disabled={parts.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-ghost w-full"
                  onClick={() =>
                    setParts([...parts, { amount: '', category: 'Other', description: '' }])
                  }
                >
                  <Plus size={14} />
                  {t('transactions.addPart')}
                </button>
                <div
                  className={`text-xs flex justify-between p-2 rounded ${
                    splitMatches ? 'bg-pos-soft text-pos' : 'bg-neg-soft text-neg'
                  }`}
                >
                  <span>{t('transactions.totalParts')}</span>
                  <span className="font-semibold tabular-nums">
                    {partsTotal.toFixed(2)} / {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
