import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

function LoadingSpinner(): React.ReactElement {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export const buttonVariants = cva(
  'focus-visible:ring-brand-500 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:focus-visible:ring-offset-slate-950 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-600 dark:active:bg-brand-700 text-white shadow-sm',
        secondary:
          'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-600',
        outline:
          'border border-slate-200 bg-transparent text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:active:bg-slate-700',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:active:bg-slate-700',
        destructive:
          'bg-danger-600 hover:bg-danger-500 active:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-600 dark:active:bg-danger-700 text-white shadow-sm',
        premium:
          'from-brand-600 to-premium-600 hover:from-brand-700 hover:to-premium-700 active:from-brand-800 active:to-premium-800 dark:from-brand-500 dark:to-premium-500 dark:hover:from-brand-600 dark:hover:to-premium-600 dark:active:from-brand-700 dark:active:to-premium-700 bg-gradient-to-r text-white shadow-sm',
        exclusive:
          'from-premium-600 to-exclusive-600 hover:from-premium-700 hover:to-exclusive-700 active:from-premium-800 active:to-exclusive-800 dark:from-premium-500 dark:to-exclusive-500 dark:hover:from-premium-600 dark:hover:to-exclusive-600 dark:active:from-premium-700 dark:active:to-exclusive-700 bg-gradient-to-r text-white shadow-sm',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), loading && 'cursor-wait', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      {loading ? <LoadingSpinner /> : null}
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';
