import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'pos' | 'neg' | 'none';
  onClick?: () => void;
  id?: string;
}

export function Card({ children, className, glow = 'none', onClick, id }: CardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={clsx(
        'bg-surface border border-border rounded-xl p-5 transition-all duration-200',
        glow === 'pos' && 'card-glow-pos',
        glow === 'neg' && 'card-glow-neg',
        glow === 'none' && 'card-glow',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
