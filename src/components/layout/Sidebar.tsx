import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  LineChart,
  ArrowRightLeft,
  Target,
  Wallet,
  Settings as SettingsIcon,
  ChevronLeft,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useStore, getTotalBalance } from '../../store/useStore';
import { MoneyText } from '../ui/MoneyText';
import { useI18n } from '../../i18n/useI18n';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de, it, zhCN, ja } from 'date-fns/locale';
import { firebaseLogout } from '../../lib/firebase';

const NAV = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', key: 'nav.transactions', icon: Receipt },
  { to: '/analytics', key: 'nav.analytics', icon: LineChart },
  { to: '/cashflow', key: 'nav.cashflow', icon: ArrowRightLeft },
  { to: '/budgets', key: 'nav.budgets', icon: Target },
  { to: '/accounts', key: 'nav.accounts', icon: Wallet },
  { to: '/settings', key: 'nav.settings', icon: SettingsIcon },
] as const;

const LOCALE_MAP: Record<string, Locale> = {
  'pt-BR': ptBR as any,
  'en-US': enUS as any,
  es: es as any,
  fr: fr as any,
  de: de as any,
  it: it as any,
  zh: zhCN as any,
  ja: ja as any,
};

export function Sidebar() {
  const { t, lang } = useI18n();
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const pushToast = useStore((s) => s.pushToast);

  const total = getTotalBalance(accounts, transactions);
  const locale = LOCALE_MAP[lang] || ptBR;
  const monthLabel = format(new Date(), 'MMMM yyyy', { locale });

  async function handleLogout() {
    await firebaseLogout();
    setUser(null);
    pushToast({ type: 'info', message: t('toast.loggedOut') });
  }

  const width = collapsed ? 'w-[60px]' : 'w-[240px]';

  return (
    <aside
      className={`${width} flex-shrink-0 bg-surface border-r border-border flex flex-col transition-[width] duration-200 ease-out sticky top-0 h-screen`}
    >
      {/* Logo / collapse */}
      <div className="flex items-center justify-between px-3 h-14 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-pos-soft flex items-center justify-center flex-shrink-0">
              <Wallet size={18} className="text-pos" />
            </div>
            <span className="font-semibold text-[15px] truncate">Finance OS</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-pos-soft flex items-center justify-center mx-auto">
            <Wallet size={18} className="text-pos" />
          </div>
        )}
        {!collapsed && (
          <button
            className="btn-icon"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={(item as any).end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-pos-soft text-pos'
                    : 'text-muted hover:text-text hover:bg-surface-hover'
                }`
              }
              title={collapsed ? t(item.key as any) : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.key as any)}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          className="btn-icon mx-auto mb-2"
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
        >
          <ChevronLeft size={18} className="rotate-180" />
        </button>
      )}

      {/* Bottom: user & balance */}
      <div className="border-t border-border p-3 space-y-3">
        {!collapsed ? (
          <>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                {monthLabel}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-muted">{t('common.balance')}</span>
                <MoneyText value={total} size="sm" className="font-semibold" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pos-soft flex items-center justify-center flex-shrink-0">
                      <UserIcon size={14} className="text-pos" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-muted truncate">
                      {user.provider === 'local' ? t('settings.localModeActive') : user.email}
                    </div>
                  </div>
                  <button
                    className="btn-icon"
                    onClick={handleLogout}
                    aria-label={t('app.logout')}
                    title={t('app.logout')}
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <div className="text-xs text-muted">{t('settings.notLoggedIn')}</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pos-soft flex items-center justify-center">
                <UserIcon size={14} className="text-pos" />
              </div>
            )}
            {user && (
              <button
                className="btn-icon"
                onClick={handleLogout}
                aria-label={t('app.logout')}
                title={t('app.logout')}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
