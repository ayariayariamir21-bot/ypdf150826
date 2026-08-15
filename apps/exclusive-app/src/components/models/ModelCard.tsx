'use client';

import * as React from 'react';
import {
  IconCpu,
  IconLoader,
  IconSettings,
  IconTestTube,
  IconTrash,
} from '@/components/icons';
import { MODEL_STATUS_LABELS, MODEL_TYPE_LABELS } from '@/lib/constants';
import { cn, formatDate, formatMilliseconds, formatPercent } from '@/lib/utils';
import type { MLModel, ModelStatus } from '@/types';
import { TrainingProgress } from './TrainingProgress';

const STATUS_STYLES: Readonly<Record<ModelStatus, string>> = {
  deployed: 'bg-success-500/10 text-success-500',
  training: 'bg-brand-500/10 text-brand-400',
  failed: 'bg-danger-500/10 text-danger-500',
  queued: 'bg-warning-500/10 text-warning-500',
};

interface ModelCardProps {
  model: MLModel;
  selected: boolean;
  onSelect: (model: MLModel) => void;
  onTest: (model: MLModel) => void;
  onDelete: (model: MLModel) => void;
  testing: boolean;
  deleting: boolean;
}

export function ModelCard({
  model,
  selected,
  onSelect,
  onTest,
  onDelete,
  testing,
  deleting,
}: ModelCardProps): React.ReactElement {
  const isTraining = model.status === 'training' || model.status === 'queued';

  return (
    <article
      className={cn(
        'panel cursor-pointer p-4 transition-colors',
        selected ? 'border-brand-500 ring-2 ring-brand-500/40' : 'hover:border-dark-border-hover'
      )}
      onClick={() => onSelect(model)}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg border',
            isTraining ? 'border-brand-500/40 text-brand-400' : 'border-dark-border text-slate-400'
          )}
        >
          {isTraining ? <IconLoader size={17} className="animate-spin" /> : <IconCpu size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-slate-100">{model.name}</h3>
            <span className="shrink-0 font-mono text-[10px] text-slate-500">{model.version}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {MODEL_TYPE_LABELS[model.type]} · updated {formatDate(model.updatedAt)}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded px-2 py-0.5 text-[11px] font-medium',
            STATUS_STYLES[model.status]
          )}
        >
          {MODEL_STATUS_LABELS[model.status]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dark-border pt-3">
        <div>
          <p className="text-[11px] text-slate-500">Accuracy</p>
          <p className="font-mono text-sm text-slate-200">
            {model.status === 'deployed' ? formatPercent(model.accuracy, 1) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Latency</p>
          <p className="font-mono text-sm text-slate-200">
            {model.status === 'deployed' ? formatMilliseconds(model.latencyMs) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Owner</p>
          <p className="truncate text-sm text-slate-300">{model.owner}</p>
        </div>
      </div>

      {model.training ? (
        <div className="mt-3 border-t border-dark-border pt-3">
          <TrainingProgress training={model.training} />
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5 border-t border-dark-border pt-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(model);
          }}
          className="btn-ghost h-7 gap-1 text-xs"
          aria-label={`Configure ${model.name}`}
        >
          <IconSettings size={12} />
          Configure
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onTest(model);
          }}
          disabled={testing || deleting || !isTraining}
          className="btn-ghost h-7 gap-1 text-xs"
          aria-label={`Test ${model.name}`}
        >
          <IconTestTube size={12} />
          {testing ? 'Testing…' : 'Test'}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(model);
          }}
          disabled={testing || deleting}
          className="btn-ghost ml-auto h-7 gap-1 text-xs text-danger-500 hover:bg-danger-500/10 hover:text-danger-500"
          aria-label={`Delete ${model.name}`}
        >
          <IconTrash size={12} />
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  );
}
