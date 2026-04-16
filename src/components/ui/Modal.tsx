import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, footer, maxWidth = '480px' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-surface border border-border rounded-2xl w-full pointer-events-auto shadow-2xl animate-slide-up flex flex-col max-h-[90vh]"
          style={{ maxWidth }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
        </div>
      </div>
    </>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function Confirm({
  open,
  title,
  message,
  confirmText = 'Confirm',
  danger = true,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 animate-slide-up shadow-2xl">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted mb-5">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg bg-surface-hover border border-border hover:border-border-strong"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm rounded-lg text-white font-medium ${
                danger ? 'bg-neg hover:bg-red-600' : 'bg-pos hover:bg-blue-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
