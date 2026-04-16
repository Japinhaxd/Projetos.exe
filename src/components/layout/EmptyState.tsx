import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-full bg-surface-hover border border-border flex items-center justify-center mb-4 text-muted">
        {icon || <Inbox size={24} />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
