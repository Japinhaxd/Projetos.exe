import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Toasts } from '../ui/Toasts';

export function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('financeOS:newTransaction'));
        navigate('/transactions');
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        navigate('/transactions');
        setTimeout(() => {
          const el = document.getElementById('tx-search');
          (el as HTMLInputElement)?.focus();
        }, 120);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-bg text-text">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-6">
          <Outlet />
        </div>
      </main>
      <Toasts />
    </div>
  );
}
