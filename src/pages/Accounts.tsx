import { useMemo, useState } from 'react';
import {
  Plus,
  Wallet,
  Pencil,
  Trash2,
  CreditCard,
  Landmark,
  Banknote,
  PiggyBank,
  TrendingUp,
  RefreshCw,
  Shield,
  Link2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useStore, getAccountBalance, getTotalBalance } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { MoneyText } from '../components/ui/MoneyText';
import { Confirm } from '../components/ui/Confirm';
import { AccountModal } from '../components/modals/AccountModal';
import { ConnectBankModal } from '../components/modals/ConnectBankModal';
import type { Account, AccountType } from '../types';
import { getApiKey, syncPluggyItem } from '../lib/pluggy';

const ICONS: Record<AccountType, any> = {
  cash: Banknote,
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
};

export function Accounts() {
  const { t, lang } = useI18n();
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const updateAccount = useStore((s) => s.updateAccount);
  const addAccount = useStore((s) => s.addAccount);
  const addTransactionsBatch = useStore((s) => s.addTransactionsBatch);
  const pluggyCreds = useStore((s) => s.pluggyCreds);
  const pushToast = useStore((s) => s.pushToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const totalBalance = getTotalBalance(accounts, transactions);

  const manualAccounts = useMemo(
    () => accounts.filter((a) => !a.isConnected),
    [accounts],
  );
  const connectedAccounts = useMemo(
    () => accounts.filter((a) => a.isConnected),
    [accounts],
  );

  const locale = lang === 'en-US' ? enUS : ptBR;

  async function handleSync(acc: Account) {
    if (!pluggyCreds || !acc.pluggyItemId) {
      pushToast({ type: 'warn', message: t('toast.missingPluggy') });
      return;
    }
    try {
      setSyncing(acc.id);
      const apiKey = await getApiKey(pluggyCreds);
      const res = await syncPluggyItem(
        apiKey,
        acc.pluggyItemId,
        accounts,
        transactions,
        addAccount,
        addTransactionsBatch,
        updateAccount,
        acc.bankName,
        acc.bankLogo,
      );
      pushToast({
        type: 'success',
        message: `${t('toast.syncSuccess')} · +${res.transactionsAdded}`,
      });
    } catch (e: any) {
      pushToast({ type: 'error', message: e?.message || t('toast.syncError') });
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t('accounts.title')}</h1>
          <p className="text-sm text-muted">
            {t('common.netWorth')}:{' '}
            <MoneyText value={totalBalance} size="sm" className="font-semibold" />
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => setConnectOpen(true)}
            title={t('accounts.connectBank')}
          >
            <Link2 size={14} />
            {t('accounts.connectBank')}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={14} />
            {t('accounts.new')}
          </button>
        </div>
      </header>

      {/* Net worth hero */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-surface to-surface-hover">
        <div className="text-[11px] uppercase tracking-wider text-muted mb-2">
          {t('common.netWorth')}
        </div>
        <MoneyText value={totalBalance} size="xl" animate className="text-4xl" />
      </div>

      {/* Manual accounts */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          {t('accounts.title')}
        </h2>
        {manualAccounts.length === 0 ? (
          <div className="card p-8 text-center">
            <Wallet size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-muted mb-4">{t('common.empty')}</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus size={14} />
              {t('accounts.new')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {manualAccounts.map((acc) => {
              const bal = getAccountBalance(acc.id, accounts, transactions);
              const Icon = ICONS[acc.type];
              return (
                <div
                  key={acc.id}
                  className={`card p-5 group transition-all ${
                    bal >= 0 ? 'card-pos' : 'card-neg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: acc.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-semibold">{acc.name}</div>
                        <div className="text-[11px] text-muted">
                          {t(`accounts.${acc.type}` as any)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setEditing(acc);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn-icon hover:text-neg"
                        onClick={() => setConfirmId(acc.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
                    {t('accounts.currentBalance')}
                  </div>
                  <MoneyText value={bal} size="xl" />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Connected banks */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield size={14} className="text-pos" />
          {t('accounts.connectedBanks')}
        </h2>
        {connectedAccounts.length === 0 ? (
          <div className="card p-6 flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-medium mb-1">{t('accounts.pluggyCta')}</div>
              <p className="text-xs text-muted">
                {t('accounts.credentialsDisclaimer')}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setConnectOpen(true)}>
              <Link2 size={14} />
              {t('accounts.connectBank')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map((acc) => {
              const bal = getAccountBalance(acc.id, accounts, transactions);
              const synced = acc.lastSynced
                ? formatDistanceToNow(new Date(acc.lastSynced), { locale, addSuffix: true })
                : '—';
              return (
                <div key={acc.id} className="card p-5 card-pos group transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {acc.bankLogo ? (
                        <img
                          src={acc.bankLogo}
                          alt=""
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1 flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: acc.color }}
                        >
                          <Landmark size={18} />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-muted">
                          {acc.bankName || t(`accounts.${acc.type}` as any)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-icon"
                      title={t('accounts.syncNow')}
                      onClick={() => handleSync(acc)}
                      disabled={syncing === acc.id}
                    >
                      <RefreshCw
                        size={14}
                        className={syncing === acc.id ? 'animate-spin' : ''}
                      />
                    </button>
                  </div>
                  <div className="text-[11px] text-muted uppercase tracking-wider mb-1">
                    {t('accounts.currentBalance')}
                  </div>
                  <MoneyText value={bal} size="xl" />
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-pos">
                      <Shield size={11} />
                      {t('accounts.securedBy')}
                    </span>
                    <span className="text-muted">
                      {t('accounts.lastSynced')}: {synced}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editAccount={editing}
      />
      <ConnectBankModal open={connectOpen} onClose={() => setConnectOpen(false)} />

      <Confirm
        open={!!confirmId}
        title={t('common.delete') + '?'}
        description={t('settings.clearConfirmDesc')}
        onConfirm={() => {
          if (confirmId) {
            deleteAccount(confirmId);
            pushToast({ type: 'success', message: t('toast.deleted') });
          }
        }}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
