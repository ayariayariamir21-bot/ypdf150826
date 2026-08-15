'use client';

import * as React from 'react';
import { IconCheck, IconSave, IconZap } from '@/components/icons';
import { ENDPOINT_REGIONS, ENDPOINT_SKUS } from '@/lib/constants';
import { formatCompact } from '@/lib/utils';
import type { EndpointConfigPatch, MLModel } from '@/types';

interface EndpointConfigProps {
  model: MLModel;
  onSave: (patch: EndpointConfigPatch) => void;
  saving: boolean;
  error: string | null;
}

export function EndpointConfig({ model, onSave, saving, error }: EndpointConfigProps): React.ReactElement {
  const initial = model.endpoint;
  const [region, setRegion] = React.useState(initial?.region ?? 'eu-west-1');
  const [sku, setSku] = React.useState(initial?.sku ?? 'Standard');
  const [capacityTpm, setCapacityTpm] = React.useState(initial?.capacityTpm ?? 120_000);
  const [autoscaling, setAutoscaling] = React.useState(initial?.autoscaling ?? true);
  const [minInstances, setMinInstances] = React.useState(initial?.minInstances ?? 1);
  const [maxInstances, setMaxInstances] = React.useState(initial?.maxInstances ?? 4);
  const [touched, setTouched] = React.useState(false);

  const capacityInput = capacityTpm.toString();

  React.useEffect(() => {
    setTouched(false);
    setRegion(initial?.region ?? 'eu-west-1');
    setSku(initial?.sku ?? 'Standard');
    setCapacityTpm(initial?.capacityTpm ?? 120_000);
    setAutoscaling(initial?.autoscaling ?? true);
    setMinInstances(initial?.minInstances ?? 1);
    setMaxInstances(initial?.maxInstances ?? 4);
  }, [initial]);

  function markTouched(): void {
    setTouched(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSave({ region, sku, capacityTpm, autoscaling, minInstances, maxInstances });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Endpoint configuration
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Deployment targets for <span className="text-slate-300">{model.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-slate-400">Region</span>
          <select
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              markTouched();
            }}
            className="input w-full"
          >
            {ENDPOINT_REGIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-400">SKU</span>
          <select
            value={sku}
            onChange={(event) => {
              setSku(event.target.value);
              markTouched();
            }}
            className="input w-full"
          >
            {ENDPOINT_SKUS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">
          Capacity <span className="text-slate-500">(TPM)</span>
        </span>
        <div className="relative">
          <input
            type="number"
            min={1000}
            step={1000}
            value={capacityInput}
            onChange={(event) => {
              setCapacityTpm(Number(event.target.value));
              markTouched();
            }}
            className="input w-full pr-12 font-mono"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {formatCompact(capacityTpm)} TPM
          </span>
        </div>
      </label>

      <div className="flex items-center justify-between rounded-md border border-dark-border bg-dark-bg px-3 py-2.5">
        <div>
          <p className="text-sm text-slate-200">Autoscaling</p>
          <p className="text-xs text-slate-500">Scale between {minInstances}–{maxInstances} instances</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoscaling}
          onClick={() => {
            setAutoscaling((value) => !value);
            markTouched();
          }}
          className={autoscaling ? 'bg-brand-600' : 'bg-dark-border-hover'}
          style={{ width: 36, height: 20, borderRadius: 9999 }}
        >
          <span
            className="block h-4 w-4 rounded-full bg-white transition-transform"
            style={{ transform: autoscaling ? 'translateX(16px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-slate-400">Min instances</span>
          <input
            type="number"
            min={1}
            value={minInstances}
            disabled={!autoscaling}
            onChange={(event) => {
              setMinInstances(Number(event.target.value));
              markTouched();
            }}
            className="input w-full font-mono"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-400">Max instances</span>
          <input
            type="number"
            min={1}
            value={maxInstances}
            disabled={!autoscaling}
            onChange={(event) => {
              setMaxInstances(Number(event.target.value));
              markTouched();
            }}
            className="input w-full font-mono"
          />
        </label>
      </div>

      {initial ? (
        <div className="flex items-center gap-2 rounded-md border border-success-500/30 bg-success-500/5 px-3 py-2 text-xs text-success-500">
          <IconZap size={13} />
          ${initial.costPerMillion.toFixed(2)} per 1M tokens
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-danger-500/30 bg-danger-500/5 px-3 py-2 text-xs text-danger-500" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving || !touched} className="btn-primary h-8">
          {saving ? <IconSave size={13} className="animate-pulse" /> : <IconCheck size={13} />}
          Save configuration
        </button>
        {touched ? <span className="text-xs text-slate-500">Unsaved changes</span> : null}
      </div>
    </form>
  );
}
