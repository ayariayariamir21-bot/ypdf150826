import * as React from 'react';
import { cn } from '../lib/utils';

export interface CircularProgressProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  min = 0,
  max = 100,
  size = 48,
  strokeWidth = 5,
  showLabel = false,
  ariaLabel = 'Progress',
  className,
}: CircularProgressProps): React.ReactElement {
  const isDeterminate = value !== undefined;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = isDeterminate ? Math.min(Math.max(value, min), max) : 0;
  const percent = isDeterminate ? ((clampedValue - min) / (max - min)) * 100 : 0;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={isDeterminate ? clampedValue : undefined}
        aria-label={ariaLabel}
        className={cn(!isDeterminate && 'animate-spin')}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isDeterminate ? offset : circumference * 0.25}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn(
            'stroke-brand-600 dark:stroke-brand-500 transition-[stroke-dashoffset] duration-300',
            !isDeterminate && 'opacity-75'
          )}
        />
      </svg>
      {showLabel && isDeterminate ? (
        <span className="absolute text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}
