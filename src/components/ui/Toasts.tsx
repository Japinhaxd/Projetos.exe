import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
            ? AlertCircle
            : t.type === 'warn'
            ? AlertTriangle
            : Info;
        const color =
          t.type === 'success'
            ? 'text-pos'
            : t.type === 'error'
            ? 'text-neg'
            : t.type === 'warn'
            ? 'text-warn'
            : 'text-pos';
        return (
          <div
            key={t.id}
            className="card pointer-events-auto min-w-[260px] max-w-sm flex items-start gap-3 p-3 animate-slide-up"
          >
            <Icon size={18} className={color + ' mt-0.5 flex-shrink-0'} />
            <div className="flex-1 text-sm">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="btn-icon -mr-1 -mt-1"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
