import clsx from 'clsx';
import {
  Activity,
  ArrowLeftRight,
  ChevronLeft,
  LayoutDashboard,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  Wallet,
  Landmark,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Money } from '../ui/Money';
import { getTotalBalance, isSameMonth, signedAmount } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp, end: false },
  { to: '/cash-flow', label: 'Cash Flow', icon: Activity, end: false },
  { to: '/budgets', label: 'Budgets', icon: Target, end: false },
  { to: '/accounts', label: 'Accounts', icon: Landmark, end: false },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
];

export function Sidebar() {
  const collapsed = useStore(s => s.sidebarCollapsed);
  const toggle = useStore(s => s.toggleSidebar);
  const accounts = useStore(s => s.accounts);
  const transactions = useStore(s => s.transactions);

  const today = new Date();
  const monthLabel = format(today, 'MMMM yyyy');
  const netMonth = transactions
    .filter(t => isSameMonth(t.date, today))
    .reduce((s, t) => s + signedAmount(t), 0);

  const totalBalance = getTotalBalance(accounts, transactions);

  return (
    <aside
      className={clsx(
        'bg-surface border-r border-border flex flex-col transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center border-b border-border h-16 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pos to-blue-600 flex items-center justify-center flex-shrink-0">
            <Wallet size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Finance OS</div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Personal</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1 text-muted hover:text-text rounded-md hover:bg-surface-hover"
            title="Collapse"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={toggle}
          className="mx-auto mt-2 p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-hover"
          title="Expand"
        >
          <ChevronLeft size={16} className="rotate-180" />
        </button>
      )}

      {/* Nav */}
      <nav id="main-nav" className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg text-sm transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                  isActive
                    ? 'bg-pos-soft text-pos font-medium'
                    : 'text-muted hover:text-text hover:bg-surface-hover'
                )
              }
              title={collapsed ? item.label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted">
              {monthLabel}
            </div>
            <div className="text-[10px] text-muted mt-0.5">Net this month</div>
            <div className="mt-1">
              <Money value={netMonth} className="text-base font-semibold" forceSign />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted">Total balance</div>
            <div className="mt-0.5">
              <Money value={totalBalance} className="text-sm font-semibold" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
