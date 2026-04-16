import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';
import { Field, Input, Select, Textarea } from './ui/Input';
import { CATEGORIES, Transaction, TransactionType, Recurrence } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
}

export function TransactionDrawer({ open, onClose, editing }: Props) {
  const accounts = useStore(s => s.accounts);
  const addTransaction = useStore(s => s.addTransaction);
  const updateTransaction = useStore(s => s.updateTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [accountId, setAccountId] = useState<string>('');
  const [transferToAccountId, setTransferToAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setAmount(String(editing.amount));
        setCategory(editing.category);
        setAccountId(editing.accountId);
        setTransferToAccountId(editing.transferToAccountId || '');
        setDate(editing.date.slice(0, 10));
        setDescription(editing.description);
        setTags(editing.tags.join(', '));
        setRecurrence(editing.recurrence);
      } else {
        setType('expense');
        setAmount('');
        setCategory('Food');
        setAccountId(accounts[0]?.id || '');
        setTransferToAccountId(accounts[1]?.id || '');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setDescription('');
        setTags('');
        setRecurrence('none');
      }
    }
  }, [open, editing, accounts]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (!accountId) return;
    if (type === 'transfer' && !transferToAccountId) return;

    const payload = {
      type,
      amount: amt,
      category: type === 'transfer' ? 'Transfer' : category,
      accountId,
      transferToAccountId: type === 'transfer' ? transferToAccountId : undefined,
      date: new Date(date + 'T12:00:00').toISOString(),
      description: description.trim() || (type === 'transfer' ? 'Transfer' : category),
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      recurrence,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'New Transaction'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="submit" form="tx-form">
            {editing ? 'Save Changes' : 'Create Transaction'}
          </Button>
        </div>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div>
          <div className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Type
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['income', 'expense', 'transfer'] as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 text-sm rounded-lg border transition-colors capitalize ${
                  type === t
                    ? t === 'income'
                      ? 'bg-pos-soft border-pos text-pos'
                      : t === 'expense'
                      ? 'bg-neg-soft border-neg text-neg'
                      : 'bg-surface-hover border-border-strong text-text'
                    : 'bg-surface border-border text-muted hover:border-border-strong'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Field label="Amount">
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            autoFocus
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {type !== 'transfer' && (
            <Field label="Category">
              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label={type === 'transfer' ? 'From Account' : 'Account'}>
            <Select value={accountId} onChange={e => setAccountId(e.target.value)}>
              <option value="">Select…</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {type === 'transfer' && (
          <Field label="To Account">
            <Select
              value={transferToAccountId}
              onChange={e => setTransferToAccountId(e.target.value)}
            >
              <option value="">Select…</option>
              {accounts
                .filter(a => a.id !== accountId)
                .map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </Field>
          <Field label="Recurrence">
            <Select value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)}>
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Supermercado Extra"
          />
        </Field>

        <Field label="Tags" hint="Separate with commas">
          <Input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="fixo, importante"
          />
        </Field>
      </form>
    </Drawer>
  );
}
