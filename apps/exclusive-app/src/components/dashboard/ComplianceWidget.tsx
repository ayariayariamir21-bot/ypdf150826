'use client';

import * as React from 'react';
import { IconShield } from '@/components/icons';
import { useDashboard } from '@/hooks/useDashboard';
import type { ComplianceProgress } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ value, size = 56, strokeWidth = 5 }: CircularProgressProps): React.ReactElement {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  const tone = value >= 90 ? 'stroke-success-500' : value >= 75 ? 'stroke-warning-500' : 'stroke-danger-500';

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-dark-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-[stroke-dashoffset] duration-700', tone)}
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold text-slate-200">
        {Math.round(value)}%
      </span>
    </div>
  );
}

export function ComplianceWidget(): React.ReactElement {
  const { data, isLoading } = useDashboard();

  const requirements: readonly ComplianceProgress[] =
    data?.compliance ??
    [
      { id: 'soc2', label: 'SOC 2', progress: 96, description: 'Loading…' },
      { id: 'gdpr', label: 'GDPR', progress: 88, description: 'Loading…' },
      { id: 'hipaa', label: 'HIPAA', progress: 74, description: 'Loading…' },
    ];

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Compliance</h2>
          <p className="mt-0.5 text-xs text-slate-500">Certification progress</p>
        </div>
        <IconShield size={16} className="text-slate-500" />
      </div>
      <ul className={cn('divide-y divide-dark-border', isLoading && 'animate-pulse')}>
        {requirements.map((requirement) => (
          <li key={requirement.id} className="flex items-center gap-4 px-5 py-4">
            <CircularProgress value={requirement.progress} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200">{requirement.label}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{requirement.description}</p>
            </div>
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[11px] font-medium',
                requirement.progress >= 90
                  ? 'bg-success-500/10 text-success-500'
                  : requirement.progress >= 75
                    ? 'bg-warning-500/10 text-warning-500'
                    : 'bg-danger-500/10 text-danger-500'
              )}
            >
              {requirement.progress >= 90 ? 'Certified' : requirement.progress >= 75 ? 'In progress' : 'At risk'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
