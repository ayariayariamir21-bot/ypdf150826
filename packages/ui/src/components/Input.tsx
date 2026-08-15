import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, startAdornment, endAdornment, disabled, ...props },
  ref
) {
  const hasStart = startAdornment !== undefined;
  const hasEnd = endAdornment !== undefined;

  return (
    <div className={cn('relative w-full', disabled && 'cursor-not-allowed')}>
      {hasStart ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
          {startAdornment}
        </span>
      ) : null}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500',
          invalid
            ? 'border-danger-600 focus-visible:border-danger-600 focus-visible:ring-danger-500 dark:border-danger-500'
            : 'focus-visible:border-brand-500 focus-visible:ring-brand-500 border-slate-200 dark:border-slate-700',
          hasStart && 'pl-9',
          hasEnd && 'pr-9',
          className
        )}
        {...props}
      />
      {hasEnd ? (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
          {endAdornment}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
