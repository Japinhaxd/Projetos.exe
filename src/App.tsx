import { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { CashFlow } from './pages/CashFlow';
import { Budgets } from './pages/Budgets';
import { Accounts } from './pages/Accounts';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { initFirebase, subscribeAuth } from './lib/firebase';
import { getApiKey, getStoredPluggyItems, syncPluggyItem } from './lib/pluggy';
import { Toasts } from './components/ui/Toasts';

function ProtectedLayout() {
  const user = useStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <AppLayout />;
}

function LoginGate() {
  const user = useStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const seedIfEmpty = useStore((s) => s.seedIfEmpty);
  const theme = useStore((s) => s.theme);
  const lang = useStore((s) => s.lang);
  const firebaseConfig = useStore((s) => s.firebaseConfig);
  const setUser = useStore((s) => s.setUser);

  const bootRef = useRef(false);
  const syncedRef = useRef(false);

  // One-time hydrate
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    hydrate();
    // defer seeding one tick to allow hydrate to settle
    setTimeout(() => {
      seedIfEmpty();
    }, 0);
  }, [hydrate, seedIfEmpty]);

  // Theme: sync DOM class
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Lang: sync document.lang
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Firebase init + listener
  useEffect(() => {
    if (!firebaseConfig) return;
    try {
      initFirebase(firebaseConfig);
      const unsub = subscribeAuth((u) => {
        if (u) setUser(u);
      });
      return unsub;
    } catch (e) {
      console.warn('Firebase init failed', e);
    }
  }, [firebaseConfig, setUser]);

  // Background Pluggy auto-sync (once per session)
  useEffect(() => {
    if (syncedRef.current) return;
    const items = getStoredPluggyItems();
    const creds = useStore.getState().pluggyCreds;
    if (!creds || items.length === 0) return;
    syncedRef.current = true;
    (async () => {
      try {
        const apiKey = await getApiKey(creds);
        for (const item of items) {
          const st = useStore.getState();
          await syncPluggyItem(
            apiKey,
            item.id,
            st.accounts,
            st.transactions,
            st.addAccount,
            st.addTransactionsBatch,
            st.updateAccount,
            item.connectorName,
            item.connectorLogo,
          );
        }
      } catch {
        // silent background failure
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginGate />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {/* Also render toasts on the login route */}
      <Toasts />
    </BrowserRouter>
  );
}
