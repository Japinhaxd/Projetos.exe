import { useMemo, useState } from 'react';
import {
  Banknote,
  CreditCard,
  Edit3,
  Landmark,
  LineChart,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Money } from '../components/ui/Money';
import { Badge } from '../components/ui/Badge';
import { Confirm, Modal } from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Input';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/layout/EmptyState';
import { useStore } from '../store/useStore';
import { Account, AccountType } from '../types';
import { getAccountBalance, getTotalBalance, isSameMonth } from '../lib/utils';

const TYPE_LABEL: Record<AccountType, string> = {
  cash: 'Cash',
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit Card',
  investment: 'Investment',
};
const TYPE_ICON: Record<AccountType, React.ReactNode> = {
  cash: <Banknote size={16} />,
  checking: <Wallet size={16} />,
  savings: <Landmark size={16} />,
  credit: <CreditCard size={16} />,
  investment: <LineChart size={16} />,
};
const PALETTE = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#f97316',
];

export function Accounts() {
  const accounts = useStore(s => s.accounts);
  const transactions = useStore(s => s.transactions);
  const addAccount = useStore(s => s.addAccount);
  const updateAccount = useStore(s => s.updateAccount);
  const removeAccount = useStore(s => s.removeAccount);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initial, setInitial] = useState<string>('0');
  const [color, setColor] = useState(PALETTE[0]);
  const [confirmDelete, setConfirmDelete] = useState<Account | null>(null);

  const totalBalance = getTotalBalance(accounts, transactions);
  const today = new Date();

  const stats = useMemo(() => {
    return accounts.map(a => {
      const balance = getAccountBalance(a, transactions);
      const monthTx = transactions.filter(
        t => isSameMonth(t.date, today) && (t.accountId === a.id || t.transferToAccountId === a.id)
      );
      const monthIn = monthTx
        .filter(t => (t.type === 'income' && t.accountId === a.id) || (t.type === 'transfer' && t.transferToAccountId === a.id))
        .reduce((s, t) => s + t.amount, 0);
      const monthOut = monthTx
        .filter(t => t.accountId === a.id && (t.type === 'expense' || t.type === 'transfer'))
        .reduce((s, t) => s + t.amount, 0);
      const txCount = transactions.filter(
        t => t.accountId === a.id || t.transferToAccountId === a.id
      ).length;
      return { account: a, balance, monthIn, monthOut, txCount };
    });
  }, [accounts, transactions]);

  function openNew() {
    setEditing(null);
    setName('');
    setType('checking');
    setInitial('0');
    setColor(PALETTE[accounts.length % PALETTE.length]);
    setModalOpen(true);
  }
  function openEdit(a: Account) {
    setEditing(a);
    setName(a.name);
    setType(a.type);
    setInitial(String(a.initialBalance));
    setColor(a.color);
    setModalOpen(true);
  }
  function save() {
    if (!name.trim()) return;
    const initialBalance = parseFloat(initial) || 0;
    if (editing) {
      updateAccount(editing.id, { name: name.trim(), type, initialBalance, color });
    } else {
      addAccount({ name: name.trim(), type, initialBalance, color });
    }
    setModalOpen(false);
  }

  const positiveCount = stats.filter(s => s.balance >= 0).length;
  const debtTotal = stats
    .filter(s => s.balance < 0)
    .reduce((s, v) => s + v.balance, 0);
  const assetTotal = stats
    .filter(s => s.balance >= 0)
    .reduce((s, v) => s + v.balance, 0);

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Manage your financial accounts and track net worth across everything you own."
        actions={
          <Button icon={<Plus size={16} />} onClick={openNew}>
            New Account
          </Button>
        }
      />

      {/* Net worth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card glow={totalBalance >= 0 ? 'pos' : 'neg'}>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Net Worth
          </div>
          <Money
            value={totalBalance}
            className="text-3xl font-semibold mt-2 block"
            animate
          />
          <div className="text-xs text-muted mt-1">
            {accounts.length} accounts · {positiveCount} positive
          </div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Total Assets
          </div>
          <Money
            value={assetTotal}
            className="text-3xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">Cash, savings & investments</div>
        </Card>
        <Card>
          <div className="text-xs font-medium text-muted uppercase tracking-wide">
            Liabilities
          </div>
          <Money
            value={debtTotal}
            className="text-3xl font-semibold mt-2 block"
          />
          <div className="text-xs text-muted mt-1">Debt & negative balances</div>
        </Card>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Landmark size={22} />}
            title="No accounts yet"
            description="Add your first account to start tracking balances and transactions."
            action={
              <Button icon={<Plus size={16} />} onClick={openNew}>
                Create first account
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(s => {
            const a = s.account;
            return (
              <Card
                key={a.id}
                glow={s.balance >= 0 ? 'pos' : 'neg'}
                className="overflow-hidden relative"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: a.color }}
                />
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: a.color }}
                    >
                      {TYPE_ICON[a.type]}
                    </div>
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-[11px] text-muted uppercase tracking-wide">
                        {TYPE_LABEL[a.type]}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 text-muted hover:text-text hover:bg-surface-hover rounded"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(a)}
                      className="p-1.5 text-muted hover:text-neg hover:bg-surface-hover rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-[11px] text-muted uppercase tracking-wide">
                    Current balance
                  </div>
                  <Money
                    value={s.balance}
                    className="text-2xl font-semibold block mt-1"
                    animate
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                  <div>
                    <div className="text-muted">This month in</div>
                    <Money value={s.monthIn} className="font-medium text-sm" />
                  </div>
                  <div>
                    <div className="text-muted">This month out</div>
                    <Money
                      value={-s.monthOut}
                      className="font-medium text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-muted">
                  <Badge variant="muted">{s.txCount} tx total</Badge>
                  <span>
                    Initial:{' '}
                    <Money
                      value={a.initialBalance}
                      neutralZero={false}
                      className="!text-muted"
                    />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Account' : 'New Account'}
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
          <Field label="Name">
            <Input
              placeholder="e.g. Nubank Checking"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
              >
                {Object.entries(TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Initial Balance">
              <Input
                type="number"
                step="0.01"
                value={initial}
                onChange={e => setInitial(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Color Tag">
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? 'ring-2 ring-white/50 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Confirm
        open={!!confirmDelete}
        title="Delete account"
        message={`Remove "${confirmDelete?.name}"? All transactions linked to this account will also be deleted.`}
        confirmText="Delete Account"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) removeAccount(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
