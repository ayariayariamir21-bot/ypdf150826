'use client';

import * as React from 'react';
import { IconActivity } from '@/components/icons';
import { useDashboard } from '@/hooks/useDashboard';
import type { RecentActivityItem } from '@/lib/apiClient';
import { cn, formatRelativeTime } from '@/lib/utils';

const STATUS_DOT: Readonly<Record<RecentActivityItem['status'], string>> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-danger-500',
};

export function RecentActivity(): React.ReactElement {
  const { data, isLoading } = useDashboard();

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest events across your workspace</p>
        </div>
        <IconActivity size={16} className="text-slate-500" />
      </div>

      {isLoading || !data ? (
        <ul className="divide-y divide-dark-border" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="px-5 py-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-dark-bg-elevated" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-dark-border">
          {data.recentActivity.map((activity) => (
            <li key={activity.id} className="flex gap-3 px-5 py-3.5">
              <span className="relative mt-1.5">
                <span className={cn('block h-2 w-2 rounded-full', STATUS_DOT[activity.status])} />
                <span className="mt-2 ml-1 block h-full w-px bg-dark-border" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-200">{activity.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatRelativeTime(activity.time)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {activity.metadata}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
