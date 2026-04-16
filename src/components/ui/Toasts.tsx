import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function Toasts() {
  const toasts = useStore(s => s.toasts);
  const dismiss = useStore(s => s.dismissToast);

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto bg-surface border border-border rounded-lg p-3 flex items-start gap-2.5 shadow-xl animate-slide-up"
        >
          {t.type === 'success' && <CheckCircle2 size={18} className="text-pos flex-shrink-0 mt-0.5" />}
          {t.type === 'error' && <XCircle size={18} className="text-neg flex-shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info size={18} className="text-muted flex-shrink-0 mt-0.5" />}
          <span className="text-sm flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted hover:text-text"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
