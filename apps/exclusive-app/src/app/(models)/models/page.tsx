'use client';

import * as React from 'react';
import {
  IconCpu,
  IconPlus,
  IconRefreshCw,
  IconTestTube,
  IconTrash,
  IconX,
} from '@/components/icons';
import { EndpointConfig } from '@/components/models/EndpointConfig';
import { ModelCard } from '@/components/models/ModelCard';
import { TrainingProgress } from '@/components/models/TrainingProgress';
import {
  useDeleteModel,
  useModels,
  useTestModel,
  useUpdateEndpoint,
} from '@/hooks/useModels';
import { MODEL_STATUS_LABELS, MODEL_TYPE_LABELS } from '@/lib/constants';
import { formatMilliseconds, formatPercent } from '@/lib/utils';
import type { EndpointConfigPatch, MLModel } from '@/types';

export default function ModelsPage(): React.ReactElement {
  const { data: models, isLoading, refetch, isFetching } = useModels();
  const updateEndpoint = useUpdateEndpoint();
  const testModel = useTestModel();
  const deleteModel = useDeleteModel();

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<Record<string, { ok: boolean; latencyMs: number }>>({});
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  const selected = models?.find((model) => model.id === selectedId) ?? null;

  function handleTest(model: MLModel): void {
    testModel.mutate(model.id, {
      onSuccess: (result) => setTestResult((prev) => ({ ...prev, [model.id]: result })),
    });
  }

  function handleDelete(model: MLModel): void {
    if (confirmDeleteId !== model.id) {
      setConfirmDeleteId(model.id);
      return;
    }
    deleteModel.mutate(model.id, {
      onSuccess: () => {
        setConfirmDeleteId(null);
        if (selectedId === model.id) {
          setSelectedId(null);
        }
      },
    });
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="min-w-0 flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">Models</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {models ? `${models.length} fine-tuned models` : 'Loading models…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="btn-secondary h-9"
            >
              <IconRefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} />
              Refresh
            </button>
            <button type="button" className="btn-primary h-9">
              <IconPlus size={14} />
              New model
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {isLoading || !models ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="panel h-56 animate-pulse" />
            ))
          ) : (
            models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                selected={selectedId === model.id}
                onSelect={(item) => setSelectedId(item.id)}
                onTest={handleTest}
                onDelete={handleDelete}
                testing={testModel.isPending && testModel.variables === model.id}
                deleting={deleteModel.isPending && confirmDeleteId === model.id}
              />
            ))
          )}
        </div>
      </div>

      {selected ? (
        <ModelDetail
          model={selected}
          testResult={testResult[selected.id]}
          testing={testModel.isPending && testModel.variables === selected.id}
          savingEndpoint={updateEndpoint.isPending}
          endpointError={updateEndpoint.isError ? 'Could not save endpoint configuration.' : null}
          onClose={() => setSelectedId(null)}
          onTest={() => handleTest(selected)}
          onDelete={() => handleDelete(selected)}
          onSaveEndpoint={(patch) =>
            updateEndpoint.mutate({ id: selected.id, patch }, {})
          }
        />
      ) : null}
    </div>
  );
}

interface ModelDetailProps {
  model: MLModel;
  testResult?: { ok: boolean; latencyMs: number };
  testing: boolean;
  savingEndpoint: boolean;
  endpointError: string | null;
  onClose: () => void;
  onTest: () => void;
  onDelete: () => void;
  onSaveEndpoint: (patch: EndpointConfigPatch) => void;
}

function ModelDetail({
  model,
  testResult,
  testing,
  savingEndpoint,
  endpointError,
  onClose,
  onTest,
  onDelete,
  onSaveEndpoint,
}: ModelDetailProps): React.ReactElement {
  return (
    <aside className="flex w-[380px] shrink-0 flex-col border-l border-dark-border bg-dark-bg-secondary">
      <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-600/15 text-brand-400">
            <IconCpu size={15} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-100">{model.name}</p>
            <p className="font-mono text-[10px] text-slate-500">{model.version}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0" aria-label="Close model details">
          <IconX size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <p className="text-xs text-slate-400">{model.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-dark-border bg-dark-bg p-3">
            <dt className="text-[11px] text-slate-500">Type</dt>
            <dd className="mt-0.5 text-sm text-slate-200">{MODEL_TYPE_LABELS[model.type]}</dd>
          </div>
          <div className="rounded-md border border-dark-border bg-dark-bg p-3">
            <dt className="text-[11px] text-slate-500">Status</dt>
            <dd className="mt-0.5 text-sm text-slate-200">{MODEL_STATUS_LABELS[model.status]}</dd>
          </div>
          <div className="rounded-md border border-dark-border bg-dark-bg p-3">
            <dt className="text-[11px] text-slate-500">Accuracy</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-200">
              {model.status === 'deployed' ? formatPercent(model.accuracy, 1) : '—'}
            </dd>
          </div>
          <div className="rounded-md border border-dark-border bg-dark-bg p-3">
            <dt className="text-[11px] text-slate-500">Latency</dt>
            <dd className="mt-0.5 font-mono text-sm text-slate-200">
              {model.status === 'deployed' ? formatMilliseconds(model.latencyMs) : '—'}
            </dd>
          </div>
        </dl>

        {model.training ? (
          <section className="rounded-md border border-dark-border bg-dark-bg p-3">
            <TrainingProgress training={model.training} />
          </section>
        ) : null}

        {testResult ? (
          <section
            className={testResult.ok ? 'rounded-md border border-success-500/30 bg-success-500/5 p-3 text-success-500' : 'rounded-md border border-danger-500/30 bg-danger-500/5 p-3 text-danger-500'}
            role="status"
          >
            <p className="text-sm font-medium">{testResult.ok ? 'Test passed' : 'Test failed'}</p>
            <p className="mt-0.5 text-xs opacity-80">
              {testResult.ok ? `Responded in ${formatMilliseconds(testResult.latencyMs)}` : 'Model did not respond correctly.'}
            </p>
          </section>
        ) : null}

        <section className="rounded-md border border-dark-border bg-dark-bg p-3">
          <EndpointConfig model={model} onSave={onSaveEndpoint} saving={savingEndpoint} error={endpointError} />
        </section>
      </div>

      <div className="flex items-center gap-2 border-t border-dark-border px-4 py-3">
        <button type="button" onClick={onTest} disabled={testing} className="btn-secondary h-8">
          <IconTestTube size={13} />
          {testing ? 'Testing…' : 'Test model'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={testing}
          className="btn-ghost ml-auto h-8 gap-1 text-danger-500 hover:bg-danger-500/10 hover:text-danger-500"
        >
          <IconTrash size={13} />
          Delete
        </button>
      </div>
    </aside>
  );
}
