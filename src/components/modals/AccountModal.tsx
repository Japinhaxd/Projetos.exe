import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useI18n } from '../../i18n/useI18n';
import { useStore } from '../../store/useStore';
import { ACCOUNT_COLORS, type Account, type AccountType } from '../../types';
import { parseAmount } from '../../lib/money';

interface Props {
  open: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

export function AccountModal({ open, onClose, editAccount }: Props) {
  const { t } = useI18n();
  const addAccount = useStore((s) => s.addAccount);
  const updateAccount = useStore((s) => s.updateAccount);
  const pushToast = useStore((s) => s.pushToast);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (!open) return;
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setBalance(String(editAccount.initialBalance));
      setColor(editAccount.color);
    } else {
      setName('');
      setType('checking');
      setBalance('');
      setColor(ACCOUNT_COLORS[0]);
    }
  }, [open, editAccount]);

  function handleSave() {
    if (!name.trim()) {
      pushToast({ type: 'error', message: t('common.name') });
      return;
    }
    const bal = parseAmount(balance || '0');
    if (editAccount) {
      updateAccount(editAccount.id, { name, type, initialBalance: bal, color });
    } else {
      addAccount({
        name,
        type,
        initialBalance: bal,
        color,
      });
    }
    pushToast({ type: 'success', message: t('toast.saved') });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editAccount ? t('common.edit') : t('accounts.new')}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.name')}
          </label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('common.type')}
          </label>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          >
            <option value="cash">{t('accounts.cash')}</option>
            <option value="checking">{t('accounts.checking')}</option>
            <option value="savings">{t('accounts.savings')}</option>
            <option value="credit">{t('accounts.credit')}</option>
            <option value="investment">{t('accounts.investment')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('accounts.initialBalance')}
          </label>
          <input
            className="input tabular-nums"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            {t('accounts.color')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all ${
                  color === c ? 'ring-pos' : 'ring-transparent'
                }`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
