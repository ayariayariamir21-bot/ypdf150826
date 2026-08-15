'use client';

import * as React from 'react';
import { cn, formatPercent } from '@/lib/utils';
import type { TrainingProgressInfo } from '@/types';

export function TrainingProgress({ training }: { training: TrainingProgressInfo }): React.ReactElement {
  const progress = Math.min(100, Math.max(0, training.progress));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Training progress</span>
        <span className="font-mono text-slate-200">{formatPercent(progress)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-dark-bg">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-[width] duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-dark-border bg-dark-bg px-2 py-1.5">
          <p className="text-slate-500">Epoch</p>
          <p className="font-mono text-slate-200">
            {training.currentEpoch} / {training.epochs}
          </p>
        </div>
        <div className="rounded-md border border-dark-border bg-dark-bg px-2 py-1.5">
          <p className="text-slate-500">Loss</p>
          <p className="font-mono text-slate-200">{training.loss.toFixed(4)}</p>
        </div>
        <div className="rounded-md border border-dark-border bg-dark-bg px-2 py-1.5">
          <p className="text-slate-500">Val. acc</p>
          <p className={cn('font-mono', training.accuracy > 0 ? 'text-success-500' : 'text-slate-500')}>
            {training.accuracy > 0 ? formatPercent(training.accuracy, 1) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
