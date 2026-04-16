import clsx from 'clsx';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'pos' | 'neg' | 'warn' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
        variant === 'default' && 'bg-surface-hover text-text border border-border',
        variant === 'pos' && 'bg-pos-soft text-pos border border-pos/20',
        variant === 'neg' && 'bg-neg-soft text-neg border border-neg/20',
        variant === 'warn' && 'bg-warn/10 text-warn border border-warn/20',
        variant === 'muted' && 'bg-surface-hover text-muted border border-border',
        className
      )}
    >
      {children}
    </span>
  );
}
