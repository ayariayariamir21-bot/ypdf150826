'use client';

import * as React from 'react';
import { IconFilter, IconSearch, IconX } from '@/components/icons';
import { AUDIT_ACTION_LABELS, AUDIT_STATUS_LABELS } from '@/lib/constants';
import type { AuditAction, AuditFilter, AuditStatus } from '@/types';

const ACTIONS: readonly AuditAction[] = [
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'export',
  'run_pipeline',
  'deploy_model',
  'download',
  'share',
];

const STATUSES: readonly AuditStatus[] = ['success', 'warning', 'blocked'];

interface FilterBarProps {
  filter: AuditFilter;
  onChange: (next: AuditFilter) => void;
  total: number;
}

export function FilterBar({ filter, onChange, total }: FilterBarProps): React.ReactElement {
  const hasActiveFilters =
    filter.action !== 'all' ||
    filter.status !== 'all' ||
    filter.search !== '' ||
    filter.from !== null ||
    filter.to !== null;

  function update(patch: Partial<AuditFilter>): void {
    onChange({ ...filter, ...patch });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <IconSearch
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={filter.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search user, resource, IP…"
          className="input h-8 w-56 pl-8"
          aria-label="Search audit log"
        />
      </div>

      <select
        value={filter.action}
        onChange={(event) => update({ action: event.target.value as AuditAction | 'all' })}
        className="input h-8 w-40"
        aria-label="Filter by action"
      >
        <option value="all">All actions</option>
        {ACTIONS.map((action) => (
          <option key={action} value={action}>
            {AUDIT_ACTION_LABELS[action]}
          </option>
        ))}
      </select>

      <select
        value={filter.status}
        onChange={(event) => update({ status: event.target.value as AuditStatus | 'all' })}
        className="input h-8 w-32"
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {AUDIT_STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        From
        <input
          type="date"
          value={filter.from ?? ''}
          onChange={(event) => update({ from: event.target.value || null })}
          className="input h-8 w-36"
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        To
        <input
          type="date"
          value={filter.to ?? ''}
          onChange={(event) => update({ to: event.target.value || null })}
          className="input h-8 w-36"
        />
      </label>

      <span className="hidden text-xs text-slate-500 sm:inline">{total.toLocaleString()} records</span>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => onChange({ search: '', action: 'all', status: 'all', from: null, to: null })}
          className="btn-ghost h-8 gap-1 text-xs"
        >
          <IconX size={12} />
          Clear
        </button>
      ) : null}

      <span className="flex items-center gap-1 rounded-md border border-dark-border bg-dark-bg px-2 py-1 text-[11px] text-slate-500">
        <IconFilter size={11} />
        Filtered
      </span>
    </div>
  );
}
