import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' && 'text-xs px-3 py-1.5',
        size === 'md' && 'text-sm px-4 py-2',
        size === 'lg' && 'text-base px-5 py-3',
        variant === 'primary' &&
          'bg-pos text-white hover:bg-blue-600 shadow-lg shadow-pos/20',
        variant === 'secondary' &&
          'bg-surface border border-border text-text hover:bg-surface-hover hover:border-border-strong',
        variant === 'ghost' &&
          'text-muted hover:text-text hover:bg-surface-hover',
        variant === 'danger' &&
          'bg-neg text-white hover:bg-red-600 shadow-lg shadow-neg/20',
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}
