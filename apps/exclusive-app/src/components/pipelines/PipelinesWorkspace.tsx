'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconCheck,
  IconChevronDown,
  IconPause,
  IconPlay,
  IconRefreshCw,
  IconSave,
  IconSquare,
  IconTerminal,
} from '@/components/icons';
import { PIPELINE_STATUS_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSaveWorkflow, useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowStore } from '@/stores/workflowStore';
import { ExecutionLog } from './ExecutionLog';
import { PipelineCanvas } from './PipelineCanvas';
import { NodePalette } from './NodePalette';

export function PipelinesWorkspace(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('workflow');

  const { data: workflows, isLoading } = useWorkflows();
  const workflow = React.useMemo(() => {
    if (!workflows) {
      return null;
    }
    return workflows.find((item) => item.id === requestedId) ?? workflows[0] ?? null;
  }, [workflows, requestedId]);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const isRunning = useWorkflowStore((state) => state.isRunning);
  const isPaused = useWorkflowStore((state) => state.isPaused);
  const isDirty = useWorkflowStore((state) => state.isDirty);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const validationIssues = useWorkflowStore((state) => state.validationIssues);

  const run = useWorkflowStore((state) => state.run);
  const pause = useWorkflowStore((state) => state.pause);
  const resume = useWorkflowStore((state) => state.resume);
  const stop = useWorkflowStore((state) => state.stop);
  const validate = useWorkflowStore((state) => state.validate);
  const setSaving = useWorkflowStore((state) => state.setSaving);
  const markSaved = useWorkflowStore((state) => state.markSaved);

  const saveMutation = useSaveWorkflow();
  const [logOpen, setLogOpen] = React.useState(false);

  const currentNodes = workflow ? (nodes.length > 0 ? nodes : workflow.nodes) : [];
  const currentEdges = workflow ? (edges.length > 0 ? edges : workflow.edges) : [];

  React.useEffect(() => {
    if (isRunning) {
      setLogOpen(true);
    }
  }, [isRunning]);

  function handleSave(): void {
    if (!workflow) {
      return;
    }
    setSaving(true);
    saveMutation.mutate(
      { id: workflow.id, nodes: currentNodes, edges: currentEdges },
      {
        onSuccess: () => markSaved(),
        onSettled: () => setSaving(false),
      }
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-dark-border bg-dark-bg px-3">
        <div className="relative">
          <select
            value={workflow?.id ?? ''}
            disabled={isLoading}
            onChange={(event) => {
              router.replace(`/pipelines?workflow=${event.target.value}`);
            }}
            className="input h-8 w-56 appearance-none pr-8 text-sm font-medium"
            aria-label="Select workflow"
          >
            {isLoading ? (
              <option value="">Loading workflows…</option>
            ) : (
              workflows?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))
            )}
          </select>
          <IconChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>

        {workflow ? (
          <span
            className={cn(
              'rounded px-2 py-0.5 text-[11px] font-medium',
              workflow.status === 'active'
                ? 'bg-success-500/10 text-success-500'
                : workflow.status === 'paused'
                  ? 'bg-warning-500/10 text-warning-500'
                  : 'bg-dark-bg-secondary text-slate-500'
            )}
          >
            {PIPELINE_STATUS_LABELS[workflow.status]}
          </span>
        ) : null}

        {workflow ? (
          <span className="text-xs text-slate-500">v{workflow.version}</span>
        ) : null}

        {isDirty ? (
          <span className="flex items-center gap-1.5 text-xs text-warning-500">
            <span className="h-1.5 w-1.5 rounded-full bg-warning-500" />
            Unsaved changes
          </span>
        ) : null}

        {validationIssues.length > 0 ? (
          <span className="text-xs text-danger-500">{validationIssues.length} issue(s)</span>
        ) : null}

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={run}
            disabled={isRunning || !workflow}
            className="btn-primary h-8"
          >
            <IconPlay size={13} />
            Run
          </button>
          {isRunning && !isPaused ? (
            <button type="button" onClick={pause} className="btn-secondary h-8">
              <IconPause size={13} />
              Pause
            </button>
          ) : null}
          {isRunning && isPaused ? (
            <button type="button" onClick={resume} className="btn-secondary h-8">
              <IconPlay size={13} />
              Resume
            </button>
          ) : null}
          {isRunning ? (
            <button type="button" onClick={stop} className="btn-danger h-8">
              <IconSquare size={13} />
              Stop
            </button>
          ) : null}
          <button
            type="button"
            onClick={validate}
            disabled={isRunning || !workflow}
            className="btn-ghost h-8"
            title="Validate the workflow graph"
          >
            <IconCheck size={13} />
            Validate
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !isDirty || !workflow || isRunning}
            className="btn-secondary h-8"
          >
            {isSaving ? <IconRefreshCw size={13} className="animate-spin" /> : <IconSave size={13} />}
            Save
          </button>
          <span className="mx-1 h-5 w-px bg-dark-border" />
          <button
            type="button"
            onClick={() => setLogOpen((value) => !value)}
            className={cn('btn-ghost h-8', logOpen && 'bg-dark-bg-elevated text-slate-200')}
            aria-pressed={logOpen}
            aria-label="Toggle execution log"
          >
            <IconTerminal size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <NodePalette />
        {isLoading || !workflow ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Loading workspace…
          </div>
        ) : (
          <PipelineCanvas
            workflowId={workflow.id}
            nodes={currentNodes}
            edges={currentEdges}
          />
        )}
      </div>

      {logOpen ? <ExecutionLog onClose={() => setLogOpen(false)} /> : null}
    </div>
  );
}
