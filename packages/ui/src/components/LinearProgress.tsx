import * as React from 'react';
import { cn } from '../lib/utils';

export interface LinearProgressProps {
  value?: number;
  min?: number;
  max?: number;
  showLabel?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function LinearProgress({
  value,
  min = 0,
  max = 100,
  showLabel = false,
  ariaLabel = 'Progress',
  className,
}: LinearProgressProps): React.ReactElement {
  const isDeterminate = value !== undefined;
  const clampedValue = isDeterminate ? Math.min(Math.max(value, min), max) : 0;
  const percent = isDeterminate ? ((clampedValue - min) / (max - min)) * 100 : 0;

  return (
    <div className={cn('flex w-full items-center gap-3', className)}>
      <div
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={isDeterminate ? clampedValue : undefined}
        aria-label={ariaLabel}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        {isDeterminate ? (
          <div
            className="bg-brand-600 dark:bg-brand-500 absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        ) : (
          <div className="animate-indeterminate bg-brand-600 dark:bg-brand-500 absolute inset-y-0 left-0 w-1/3 rounded-full" />
        )}
      </div>
      {showLabel && isDeterminate ? (
        <span className="min-w-10 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}
