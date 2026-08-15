'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconChevronRight } from '@/components/icons';
import { useWorkflows } from '@/hooks/useWorkflows';
import { PIPELINE_STATUS_LABELS } from '@/lib/constants';
import { cn, formatRelativeTime, formatPercent } from '@/lib/utils';
import type { WorkflowStatus } from '@/types';

const OVERVIEW_STEPS = [
  'Trigger',
  'OCR',
  'Classify',
  'Extract',
  'Redact',
  'Approval',
  'Archive',
] as const;

const STATUS_STYLES: Readonly<Record<WorkflowStatus, string>> = {
  active: 'bg-success-500',
  paused: 'bg-warning-500',
  draft: 'bg-slate-500',
  archived: 'bg-dark-border-hover',
};

export function PipelineOverview(): React.ReactElement {
  const { data: workflows, isLoading } = useWorkflows();
  const router = useRouter();

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Pipeline Overview</h2>
          <p className="mt-0.5 text-xs text-slate-500">Master intake flow and pipeline health</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/pipelines')}
          className="btn-ghost h-8 gap-1 text-xs"
        >
          Open editor
          <IconChevronRight size={13} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 overflow-x-auto px-5 py-4">
        {OVERVIEW_STEPS.map((step, index) => (
          <React.Fragment key={step}>
            <span className="flex items-center gap-2 rounded-md border border-dark-border bg-dark-bg px-3 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {step}
            </span>
            {index < OVERVIEW_STEPS.length - 1 ? (
              <IconChevronRight size={14} className="mx-1 shrink-0 text-slate-600" />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <ul className="divide-y divide-dark-border border-t border-dark-border">
        {isLoading || !workflows ? (
          <li className="px-5 py-4 text-sm text-slate-500">Loading pipelines…</li>
        ) : (
          workflows.map((workflow) => (
            <li key={workflow.id}>
              <button
                type="button"
                onClick={() => router.push(`/pipelines?workflow=${workflow.id}`)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-dark-bg"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_STYLES[workflow.status])}
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm font-medium text-slate-200">
                      {workflow.name}
                    </span>
                  </span>
                  <span className="mt-0.5 truncate text-xs text-slate-500">
                    {workflow.description}
                  </span>
                </span>

                <span className="hidden w-28 shrink-0 text-right md:block">
                  <span className="block text-xs text-slate-500">Last run</span>
                  <span className="block text-xs text-slate-300">
                    {workflow.lastRunAt ? formatRelativeTime(workflow.lastRunAt) : 'Never'}
                  </span>
                </span>

                <span className="hidden w-24 shrink-0 text-right md:block">
                  <span className="block text-xs text-slate-500">Success</span>
                  <span
                    className={cn(
                      'block text-xs font-medium',
                      workflow.successRate >= 95
                        ? 'text-success-500'
                        : workflow.successRate >= 80
                          ? 'text-warning-500'
                          : 'text-danger-500'
                    )}
                  >
                    {formatPercent(workflow.successRate)}
                  </span>
                </span>

                <span className="hidden w-20 shrink-0 text-right sm:block">
                  <span className="block text-xs text-slate-500">Queued</span>
                  <span className="block text-xs text-slate-300">
                    {workflow.queuedDocuments} docs
                  </span>
                </span>

                <span
                  className={cn(
                    'w-16 shrink-0 rounded px-2 py-0.5 text-center text-[11px] font-medium',
                    workflow.status === 'active'
                      ? 'bg-success-500/10 text-success-500'
                      : workflow.status === 'paused'
                        ? 'bg-warning-500/10 text-warning-500'
                        : 'bg-dark-bg-secondary text-slate-500'
                  )}
                >
                  {PIPELINE_STATUS_LABELS[workflow.status]}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
