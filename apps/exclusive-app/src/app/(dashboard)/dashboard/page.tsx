'use client';

import * as React from 'react';
import { ComplianceWidget } from '@/components/dashboard/ComplianceWidget';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { StatGrid } from '@/components/dashboard/StatGrid';
import { IconRefreshCw } from '@/components/icons';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage(): React.ReactElement {
  const { refetch, isFetching, data } = useDashboard();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Workspace Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {data ? 'Live view of your document intelligence platform' : 'Loading workspace…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="btn-secondary h-9"
        >
          <IconRefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} />
          Refresh
        </button>
      </div>

      <StatGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <PipelineOverview />
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <ComplianceWidget />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
