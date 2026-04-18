import { useState } from 'react';
import {
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  Download,
  Upload,
  Trash2,
  Link2,
  Eye,
  EyeOff,
  HelpCircle,
  Repeat,
  Flame,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';
import { LANG_META } from '../i18n/translations';
import type { FirebaseConfig, SupportedLanguage, Theme } from '../types';
import { Confirm } from '../components/ui/Confirm';
import { format } from 'date-fns';
import { firebaseLogout, validateFirebaseConfig } from '../lib/firebase';
import { MoneyText } from '../components/ui/MoneyText';

export function Settings() {
  const { t, tc } = useI18n();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const firebaseConfig = useStore((s) => s.firebaseConfig);
  const setFirebaseConfig = useStore((s) => s.setFirebaseConfig);
  const pluggyCreds = useStore((s) => s.pluggyCreds);
  const setPluggyCreds = useStore((s) => s.setPluggyCreds);
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const budgets = useStore((s) => s.budgets);
  const replaceAll = useStore((s) => s.replaceAll);
  const clearAll = useStore((s) => s.clearAll);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const pushToast = useStore((s) => s.pushToast);

  const [firebaseText, setFirebaseText] = useState(
    firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : '',
  );
  const [pluggyId, setPluggyId] = useState(pluggyCreds?.clientId || '');
  const [pluggySecret, setPluggySecret] = useState(pluggyCreds?.clientSecret || '');
  const [showSecret, setShowSecret] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const recurring = transactions.filter(
    (t) => t.recurrence !== 'none' && !t.tags?.includes('__split_parent'),
  );

  // ==========================================================
  // Actions
  // ==========================================================
  function handleSaveFirebase() {
    if (!firebaseText.trim()) {
      setFirebaseConfig(null);
      pushToast({ type: 'info', message: t('toast.saved') });
      return;
    }
    const parsed: FirebaseConfig | null = validateFirebaseConfig(firebaseText);
    if (!parsed) {
      pushToast({ type: 'error', message: t('toast.invalidFirebase') });
      return;
    }
    setFirebaseConfig(parsed);
    pushToast({ type: 'success', message: t('toast.saved') });
  }

  function handleSavePluggy() {
    if (!pluggyId || !pluggySecret) {
      setPluggyCreds(null);
      pushToast({ type: 'info', message: t('toast.saved') });
      return;
    }
    setPluggyCreds({ clientId: pluggyId, clientSecret: pluggySecret });
    pushToast({ type: 'success', message: t('toast.saved') });
  }

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      accounts,
      budgets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeOS_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast({ type: 'success', message: t('toast.exported') });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(String(ev.target?.result));
        if (!Array.isArray(obj.transactions) || !Array.isArray(obj.accounts)) {
          throw new Error('Invalid shape');
        }
        replaceAll({
          transactions: obj.transactions,
          accounts: obj.accounts,
          budgets: obj.budgets || [],
        });
        pushToast({ type: 'success', message: t('toast.imported') });
      } catch {
        pushToast({ type: 'error', message: t('toast.invalidJSON') });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleLogout() {
    await firebaseLogout();
    setUser(null);
    pushToast({ type: 'info', message: t('toast.loggedOut') });
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </header>

      <div className="space-y-6">
        {/* ========== APPEARANCE ========== */}
        <Section icon={Sun} title={t('settings.appearance')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <div>
                <div className="text-sm font-medium">
                  {theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
                </div>
                <div className="text-xs text-muted">
                  {theme === 'dark' ? '🌙' : '☀️'} {t('settings.appearance')}
                </div>
              </div>
            </div>
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme((theme === 'dark' ? 'light' : 'dark') as Theme)}
              className={`toggle ${theme === 'light' ? 'active' : ''}`}
            />
          </div>
        </Section>

        {/* ========== LANGUAGE ========== */}
        <Section icon={Globe} title={t('settings.language')}>
          <select
            className="input"
            value={lang}
            onChange={(e) => setLang(e.target.value as SupportedLanguage)}
          >
            {LANG_META.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.native} ({l.code})
              </option>
            ))}
          </select>
          <p className="text-xs text-muted mt-2">
            Sample: <MoneyText value={1500} size="sm" colored={false} />
          </p>
        </Section>

        {/* ========== ACCOUNT ========== */}
        <Section icon={UserIcon} title={t('settings.account')}>
          {user ? (
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pos-soft flex items-center justify-center">
                  <UserIcon size={20} className="text-pos" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.displayName}</div>
                <div className="text-xs text-muted truncate">
                  {user.provider === 'local'
                    ? t('settings.localModeActive')
                    : `${t('settings.loggedInAs')} · ${user.email}`}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={handleLogout}>
                <LogOut size={14} />
                {t('app.logout')}
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">{t('settings.notLoggedIn')}</p>
          )}
        </Section>

        {/* ========== INTEGRATIONS ========== */}
        <Section icon={Link2} title={t('settings.integrations')}>
          {/* Firebase */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-muted mb-1.5">
              {t('settings.firebaseConfig')}
            </label>
            <textarea
              className="input font-mono text-xs"
              rows={6}
              placeholder='{"apiKey": "...", "authDomain": "..."}'
              value={firebaseText}
              onChange={(e) => setFirebaseText(e.target.value)}
            />
            <p className="text-[11px] text-muted mt-1.5 flex items-start gap-1.5">
              <HelpCircle size={12} className="flex-shrink-0 mt-0.5" />
              {t('settings.firebaseHelp')}
            </p>
            <button
              className="btn btn-ghost mt-2"
              onClick={handleSaveFirebase}
            >
              {t('common.save')}
            </button>
          </div>

          {/* Pluggy */}
          <div className="pt-4 border-t border-border">
            <div className="text-sm font-medium mb-3">{t('settings.pluggyKeys')}</div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  {t('settings.pluggyClientId')}
                </label>
                <input
                  className="input font-mono text-xs"
                  value={pluggyId}
                  onChange={(e) => setPluggyId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  {t('settings.pluggyClientSecret')}
                </label>
                <div className="relative">
                  <input
                    className="input font-mono text-xs pr-10"
                    type={showSecret ? 'text' : 'password'}
                    value={pluggySecret}
                    onChange={(e) => setPluggySecret(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon"
                    onClick={() => setShowSecret((v) => !v)}
                    type="button"
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted flex items-start gap-1.5">
                <HelpCircle size={12} className="flex-shrink-0 mt-0.5" />
                {t('settings.pluggyHelp')}
              </p>
              <button className="btn btn-ghost" onClick={handleSavePluggy}>
                {t('common.save')}
              </button>
            </div>
          </div>
        </Section>

        {/* ========== DATA ========== */}
        <Section icon={Download} title={t('settings.data')}>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={handleExport}>
              <Download size={14} />
              {t('settings.exportJSON')}
            </button>
            <label className="btn btn-ghost cursor-pointer">
              <Upload size={14} />
              {t('settings.importJSON')}
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <button className="btn btn-danger ml-auto" onClick={() => setConfirmClear(true)}>
              <Trash2 size={14} />
              {t('settings.clearData')}
            </button>
          </div>
        </Section>

        {/* ========== RECURRING ========== */}
        <Section icon={Repeat} title={t('settings.recurring')}>
          {recurring.length === 0 ? (
            <p className="text-sm text-muted">{t('settings.noRecurring')}</p>
          ) : (
            <div className="divide-y divide-border">
              {recurring.map((tx) => {
                const sign = tx.type === 'income' ? 1 : -1;
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5">
                    <div className="badge badge-muted">
                      {t(`common.${tx.recurrence}` as any)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tx.description}</div>
                      <div className="text-[11px] text-muted">{tc(tx.category)}</div>
                    </div>
                    <MoneyText value={sign * tx.amount} size="sm" />
                    <button
                      className="btn-icon hover:text-neg"
                      onClick={() => {
                        deleteTransaction(tx.id);
                        pushToast({ type: 'success', message: t('toast.deleted') });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <Confirm
        open={confirmClear}
        title={t('settings.clearConfirm')}
        description={t('settings.clearConfirmDesc')}
        onConfirm={() => {
          clearAll();
          pushToast({ type: 'success', message: t('toast.cleared') });
        }}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-pos" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </section>
  );
}
