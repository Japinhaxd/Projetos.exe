import clsx from 'clsx';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        {...rest}
        className={clsx(
          'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted transition-colors',
          'focus:outline-none focus:border-pos focus:ring-1 focus:ring-pos/30',
          className
        )}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        {...rest}
        className={clsx(
          'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text transition-colors',
          'focus:outline-none focus:border-pos focus:ring-1 focus:ring-pos/30',
          className
        )}
      >
        {children}
      </select>
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        {...rest}
        className={clsx(
          'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted transition-colors resize-none',
          'focus:outline-none focus:border-pos focus:ring-1 focus:ring-pos/30',
          className
        )}
      />
    );
  }
);

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
