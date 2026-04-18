import { useState } from 'react';
import { Link2, Shield, Info, Lock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useI18n } from '../../i18n/useI18n';
import { useStore } from '../../store/useStore';
import { getApiKey, getConnectToken, openPluggyConnect, syncPluggyItem } from '../../lib/pluggy';
import { Link } from 'react-router-dom';

const SUPPORTED_BANKS = [
  { name: 'Nubank', color: '#820ad1', initials: 'Nu' },
  { name: 'Itaú', color: '#ec7000', initials: 'It' },
  { name: 'Bradesco', color: '#cc092f', initials: 'Br' },
  { name: 'Santander', color: '#ec0000', initials: 'Sa' },
  { name: 'Banco do Brasil', color: '#fff200', initials: 'BB', fg: '#003087' },
  { name: 'Caixa', color: '#0066b3', initials: 'Cx' },
  { name: 'C6 Bank', color: '#1a1a1a', initials: 'C6' },
  { name: 'Inter', color: '#ff7a00', initials: 'In' },
  { name: 'BTG Pactual', color: '#003366', initials: 'BT' },
  { name: 'XP Inc', color: '#ffcc00', initials: 'XP', fg: '#0a0a0a' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ConnectBankModal({ open, onClose }: Props) {
  const { t } = useI18n();
  const pluggyCreds = useStore((s) => s.pluggyCreds);
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const addAccount = useStore((s) => s.addAccount);
  const addTransactionsBatch = useStore((s) => s.addTransactionsBatch);
  const updateAccount = useStore((s) => s.updateAccount);
  const pushToast = useStore((s) => s.pushToast);

  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    if (!pluggyCreds) {
      pushToast({ type: 'warn', message: t('toast.missingPluggy') });
      return;
    }
    try {
      setLoading(true);
      const apiKey = await getApiKey(pluggyCreds);
      const connectToken = await getConnectToken(apiKey);

      openPluggyConnect(
        connectToken,
        async (itemId, connectorName, connectorLogo) => {
          try {
            const res = await syncPluggyItem(
              apiKey,
              itemId,
              accounts,
              transactions,
              addAccount,
              addTransactionsBatch,
              updateAccount,
              connectorName,
              connectorLogo,
            );
            pushToast({
              type: 'success',
              message: `${t('toast.syncSuccess')} · +${res.transactionsAdded}`,
            });
            onClose();
          } catch (e: any) {
            pushToast({
              type: 'error',
              message: e?.message || t('toast.syncError'),
            });
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          pushToast({ type: 'error', message: err?.message || t('toast.syncError') });
          setLoading(false);
        },
      );
    } catch (e: any) {
      pushToast({ type: 'error', message: e?.message || t('toast.syncError') });
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('accounts.connectYourBank')}
      size="lg"
    >
      <div className="space-y-5">
        {/* Pluggy trust banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-pos-soft border border-pos/30">
          <Shield size={18} className="text-pos mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-pos mb-1">
              🔒 {t('accounts.securedBy')}
            </div>
            <div className="text-muted">{t('accounts.credentialsDisclaimer')}</div>
          </div>
        </div>

        {/* No creds warning */}
        {!pluggyCreds && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warn-soft border border-warn/30">
            <Info size={16} className="text-warn mt-0.5 flex-shrink-0" />
            <div className="text-xs flex-1">
              <div className="text-warn font-medium mb-1">
                {t('accounts.noPluggyKeys')}
              </div>
              <Link
                to="/settings"
                onClick={onClose}
                className="text-pos underline-offset-4 hover:underline"
              >
                {t('accounts.openSettings')} →
              </Link>
            </div>
          </div>
        )}

        {/* Supported banks grid */}
        <div>
          <div className="text-xs text-muted uppercase tracking-wider mb-3">
            {t('accounts.supportedBanks')}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {SUPPORTED_BANKS.map((b) => (
              <div
                key={b.name}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{
                    background: b.color,
                    color: b.fg || 'white',
                  }}
                >
                  {b.initials}
                </div>
                <span className="text-[10px] text-muted text-center">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary w-full h-11"
          onClick={handleConnect}
          disabled={!pluggyCreds || loading}
        >
          <Link2 size={16} />
          {loading ? t('accounts.syncing') : t('accounts.connectOpenFinance')}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <Lock size={10} />
          Pluggy · Open Finance Brasil
        </div>
      </div>
    </Modal>
  );
}
