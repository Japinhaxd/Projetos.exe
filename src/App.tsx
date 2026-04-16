import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Toasts } from './components/ui/Toasts';
import { TransactionDrawer } from './components/TransactionDrawer';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { CashFlow } from './pages/CashFlow';
import { Budgets } from './pages/Budgets';
import { Accounts } from './pages/Accounts';
import { Settings } from './pages/Settings';

export default function App() {
  const ensureSeed = useStore(s => s.ensureSeed);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    ensureSeed();
  }, [ensureSeed]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (isTyping) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickOpen(true);
      }
      if (e.key === 'f' || e.key === 'F') {
        const input = document.getElementById('global-search') as HTMLInputElement | null;
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard onNewTx={() => setQuickOpen(true)} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/cash-flow" element={<CashFlow />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
      <TransactionDrawer open={quickOpen} onClose={() => setQuickOpen(false)} />
      <Toasts />
    </div>
  );
}
