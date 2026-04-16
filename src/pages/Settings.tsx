import { useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Database,
  Download,
  RefreshCw,
  Repeat,
  Trash2,
  Upload,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Select } from '../components/ui/Input';
import { Confirm } from '../components/ui/Modal';
import { Money } from '../components/ui/Money';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/layout/EmptyState';
import { useStore } from '../store/useStore';
import { CATEGORY_EMOJIS } from '../types';
import { downloadFile, signedAmount } from '../lib/utils';

export function Settings() {
  const accounts = useStore(s => s.accounts);
  const transactions = useStore(s => s.transactions);
  const budgets = useStore(s => s.budgets);
  const settings = useStore(s => s.settings);
  const setSettings = useStore(s => s.setSettings);
  const importAll = useStore(s => s.importAll);
  const clearAll = useStore(s => s.clearAll);
  const resetSeed = useStore(s => s.resetSeed);
  const pushToast = useStore(s => s.pushToast);
  const removeTransaction = useStore(s => s.removeTransaction);

  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const accMap = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a.name])),
    [accounts]
  );

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
      budgets,
      settings,
    };
    const fn = `finance-os-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadFile(fn, JSON.stringify(payload, null, 2));
    pushToast('success', 'Backup exported');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data.accounts) || !Array.isArray(data.transactions)) {
          throw new Error('Invalid format');
        }
        importAll({
          accounts: data.accounts,
          transactions: data.transactions,
          budgets: data.budgets || [],
          settings: data.settings,
        });
      } catch (err) {
        pushToast('error', 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const recurring = useMemo(
    () => transactions.filter(t => t.recurrence !== 'none'),
    [transactions]
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure preferences, manage data and review recurring transactions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Preferences */}
        <Card>
          <h2 className="text-base font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <Field label="Currency">
              <Select
                value={settings.currency}
                onChange={e => setSettings({ currency: e.target.value })}
              >
                <option value="BRL">Brazilian Real (R$)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </Select>
            </Field>
            <Field label="Date Format">
              <Select
                value={settings.dateFormat}
                onChange={e =>
                  setSettings({ dateFormat: e.target.value as any })
                }
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY (e.g. 31/12/2025)</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY (e.g. 12/31/2025)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (e.g. 2025-12-31)</option>
              </Select>
            </Field>
          </div>
        </Card>

        {/* Data */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Data Management</h2>
            <Database size={18} className="text-muted" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-surface-hover/50 border border-border rounded-lg p-3">
              <div className="text-[11px] text-muted uppercase tracking-wide">
                Transactions
              </div>
              <div className="text-xl font-semibold mt-0.5 tabular-nums">
                {transactions.length}
              </div>
            </div>
            <div className="bg-surface-hover/50 border border-border rounded-lg p-3">
              <div className="text-[11px] text-muted uppercase tracking-wide">
                Accounts
              </div>
              <div className="text-xl font-semibold mt-0.5 tabular-nums">
                {accounts.length}
              </div>
            </div>
            <div className="bg-surface-hover/50 border border-border rounded-lg p-3">
              <div className="text-[11px] text-muted uppercase tracking-wide">
                Budgets
              </div>
              <div className="text-xl font-semibold mt-0.5 tabular-nums">
                {budgets.length}
              </div>
            </div>
            <div className="bg-surface-hover/50 border border-border rounded-lg p-3">
              <div className="text-[11px] text-muted uppercase tracking-wide">
                Recurring
              </div>
              <div className="text-xl font-semibold mt-0.5 tabular-nums">
                {recurring.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              icon={<Download size={15} />}
              onClick={handleExport}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              icon={<Upload size={15} />}
              onClick={() => fileInput.current?.click()}
            >
              Import JSON
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="secondary"
              icon={<RefreshCw size={15} />}
              onClick={() => setConfirmReset(true)}
            >
              Reset to Seed
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={15} />}
              onClick={() => setConfirmClear(true)}
            >
              Clear All Data
            </Button>
          </div>
        </Card>
      </div>

      {/* Recurring manager */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Recurring Transactions</h2>
            <p className="text-xs text-muted mt-0.5">
              Transactions that repeat automatically on a schedule
            </p>
          </div>
          <Repeat size={18} className="text-muted" />
        </div>

        {recurring.length === 0 ? (
          <EmptyState
            icon={<Repeat size={20} />}
            title="No recurring transactions"
            description="Set a recurrence on any transaction to track fixed income or expenses."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Category</th>
                  <th className="text-left py-2 px-3">Account</th>
                  <th className="text-left py-2 px-3">Frequency</th>
                  <th className="text-right py-2 px-3">Amount</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {recurring.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-surface-hover">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_EMOJIS[t.category] || '🔁'}</span>
                        <span className="truncate">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted">{t.category}</td>
                    <td className="py-2.5 px-3 text-muted">{accMap[t.accountId]}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="muted" className="capitalize">
                        {t.recurrence}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <Money value={signedAmount(t)} forceSign />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => removeTransaction(t.id)}
                        className="p-1.5 text-muted hover:text-neg hover:bg-surface rounded"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Shortcuts info */}
      <Card className="mt-4">
        <h2 className="text-base font-semibold mb-3">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between py-1.5 px-3 bg-surface-hover/50 rounded-lg">
            <span className="text-muted">New transaction</span>
            <kbd className="px-2 py-0.5 bg-surface border border-border rounded text-xs">
              N
            </kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 px-3 bg-surface-hover/50 rounded-lg">
            <span className="text-muted">Focus search</span>
            <kbd className="px-2 py-0.5 bg-surface border border-border rounded text-xs">
              F
            </kbd>
          </div>
          <div className="flex items-center justify-between py-1.5 px-3 bg-surface-hover/50 rounded-lg">
            <span className="text-muted">Close drawer / modal</span>
            <kbd className="px-2 py-0.5 bg-surface border border-border rounded text-xs">
              Esc
            </kbd>
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      <Confirm
        open={confirmClear}
        title="Clear all data?"
        message="This will permanently remove all accounts, transactions and budgets. This action cannot be undone."
        confirmText="Clear Everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
      />
      <Confirm
        open={confirmReset}
        title="Restore seed data?"
        message="This replaces all current data with the default demo dataset. Current data will be lost."
        confirmText="Restore Seed"
        danger={false}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetSeed();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
