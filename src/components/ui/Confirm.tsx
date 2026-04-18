import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { useI18n } from '../../i18n/useI18n';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function Confirm({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-3 mb-5">
        <div className={`p-2 rounded-lg ${danger ? 'bg-neg-soft text-neg' : 'bg-pos-soft text-pos'} flex-shrink-0`}>
          <AlertTriangle size={20} />
        </div>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={onClose}>
          {cancelLabel || t('common.cancel')}
        </button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel || t('common.confirm')}
        </button>
      </div>
    </Modal>
  );
}
