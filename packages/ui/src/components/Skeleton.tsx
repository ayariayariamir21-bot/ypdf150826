import * as React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pulse' | 'shimmer';
}

export function Skeleton({
  className,
  variant = 'pulse',
  ...props
}: SkeletonProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-md bg-slate-200 dark:bg-slate-800',
        variant === 'pulse' && 'animate-pulse',
        variant === 'shimmer' &&
          'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
        className
      )}
      {...props}
    />
  );
}
