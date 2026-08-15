import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva(
  'focus:ring-brand-500 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border-transparent',
        slate:
          'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success:
          'bg-success-50 text-success-600 dark:bg-success-950/40 dark:text-success-500 border-transparent',
        warning:
          'bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-500 border-transparent',
        danger:
          'bg-danger-50 text-danger-600 dark:bg-danger-950/40 dark:text-danger-500 border-transparent',
        premium:
          'bg-premium-50 text-premium-600 dark:bg-premium-950/40 dark:text-premium-300 border-transparent',
        exclusive:
          'bg-exclusive-50 text-exclusive-600 dark:bg-exclusive-950/40 dark:text-exclusive-300 border-transparent',
        outline: 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps): React.ReactElement {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
