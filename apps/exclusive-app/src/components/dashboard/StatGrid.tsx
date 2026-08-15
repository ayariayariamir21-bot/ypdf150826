'use client';

import * as React from 'react';
import {
  IconActivity,
  IconArrowDown,
  IconArrowUp,
  IconClock,
  IconFileText,
  IconGitBranch,
  IconZap,
  type IconProps,
} from '@/components/icons';
import { useDashboard } from '@/hooks/useDashboard';
import { cn, formatCompact, formatNumber } from '@/lib/utils';

interface StatCardDefinition {
  key: 'documentsProcessed' | 'activePipelines' | 'aiTokensUsed' | 'avgProcessingTimeMs';
  label: string;
  icon: (props: IconProps) => React.ReactElement;
  format: (value: number) => string;
  suffix?: string;
  positiveOnIncrease: boolean;
}

const STAT_CARDS: readonly StatCardDefinition[] = [
  {
    key: 'documentsProcessed',
    label: 'Documents Processed',
    icon: IconFileText,
    format: formatNumber,
    positiveOnIncrease: true,
  },
  {
    key: 'activePipelines',
    label: 'Active Pipelines',
    icon: IconGitBranch,
    format: formatNumber,
    positiveOnIncrease: true,
  },
  {
    key: 'aiTokensUsed',
    label: 'AI Tokens Used',
    icon: IconZap,
    format: formatCompact,
    positiveOnIncrease: true,
  },
  {
    key: 'avgProcessingTimeMs',
    label: 'Avg Processing Time',
    icon: IconClock,
    format: formatNumber,
    suffix: 'ms',
    positiveOnIncrease: false,
  },
];

export function StatGrid(): React.ReactElement {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="panel h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = data.stats;
  const changes = stats.changes;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_CARDS.map((card) => {
        const rawValue = stats[card.key];
        const change = changes[card.key] as number;
        const increase = change >= 0;
        const positive = card.positiveOnIncrease ? increase : !increase;
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className="group panel relative overflow-hidden p-5 transition-colors hover:border-dark-border-hover"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-400">{card.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600/15 text-brand-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon size={17} />
              </span>
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-slate-50">
              {card.format(rawValue)}
              {card.suffix ? <span className="ml-1 text-sm font-normal text-slate-500">{card.suffix}</span> : null}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-medium',
                  positive ? 'bg-success-500/10 text-success-500' : 'bg-danger-500/10 text-danger-500'
                )}
              >
                {increase ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
            <IconActivity
              size={72}
              className="pointer-events-none absolute -bottom-4 -right-4 text-dark-bg-elevated opacity-60 transition-opacity group-hover:opacity-100"
            />
          </article>
        );
      })}
    </div>
  );
}
