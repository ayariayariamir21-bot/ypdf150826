'use client';

import * as React from 'react';
import { AuditTable } from '@/components/audit/AuditTable';
import { ExportControls } from '@/components/audit/ExportControls';
import { FilterBar } from '@/components/audit/FilterBar';
import { IconX } from '@/components/icons';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AUDIT_ACTION_LABELS, AUDIT_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, safeJsonStringify } from '@/lib/utils';
import type {
  AuditFilter,
  AuditLogEntry,
  AuditPageSize,
  AuditSort,
} from '@/types';

const INITIAL_FILTER: AuditFilter = {
  search: '',
  action: 'all',
  status: 'all',
  from: null,
  to: null,
};

export default function AuditPage(): React.ReactElement {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<AuditPageSize>(50);
  const [sort, setSort] = React.useState<AuditSort>({ key: 'timestamp', direction: 'desc' });
  const [filter, setFilter] = React.useState<AuditFilter>(INITIAL_FILTER);
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = React.useState<AuditLogEntry | null>(null);

  const { data, isLoading, isFetching } = useAuditLogs({ page, pageSize, sort, filter });

  const entries = data?.items ?? [];
  const total = data?.total ?? 0;

  function handleFilterChange(next: AuditFilter): void {
    setFilter(next);
    setPage(1);
  }

  function toggleSelect(id: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll(): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = entries.length > 0 && entries.every((entry) => next.has(entry.id));
      for (const entry of entries) {
        if (allSelected) {
          next.delete(entry.id);
        } else {
          next.add(entry.id);
        }
      }
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="min-w-0 flex-1 space-y-4 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">Audit Trail</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Immutable record of user and system activity
            </p>
          </div>
          <ExportControls
            selected={entries.filter((entry) => selectedIds.has(entry.id))}
            allEntries={entries}
            total={total}
          />
        </div>

        <div className="rounded-lg border border-dark-border bg-dark-bg p-3">
          <FilterBar filter={filter} onChange={handleFilterChange} total={total} />
        </div>

        <AuditTable
          entries={entries}
          total={total}
          page={page}
          pageSize={pageSize}
          sort={sort}
          selectedIds={selectedIds}
          loading={isLoading || isFetching}
          onSortChange={(nextSort) => setSort(nextSort)}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onSelect={setSelectedEntry}
        />
      </div>

      {selectedEntry ? (
        <AuditDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      ) : null}
    </div>
  );
}

function AuditDetail({
  entry,
  onClose,
}: {
  entry: AuditLogEntry;
  onClose: () => void;
}): React.ReactElement {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-dark-border bg-dark-bg-secondary">
      <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
        <p className="text-sm font-medium text-slate-100">Record details</p>
        <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0" aria-label="Close details">
          <IconX size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 text-sm">
        <dl className="space-y-3">
          <DetailRow label="Timestamp" value={formatDateTime(entry.timestamp)} mono />
          <DetailRow label="User" value={entry.user} />
          <DetailRow label="Action" value={AUDIT_ACTION_LABELS[entry.action]} />
          <DetailRow label="Resource" value={entry.resource} mono />
          <DetailRow label="IP address" value={entry.ip} mono />
          <DetailRow label="Status" value={AUDIT_STATUS_LABELS[entry.status]} />
          <DetailRow label="Record ID" value={entry.id} mono />
        </dl>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Metadata
          </p>
          <pre className="max-h-64 overflow-auto rounded-md border border-dark-border bg-dark-bg p-3 font-mono text-[11px] leading-5 text-slate-300">
            {safeJsonStringify(entry.metadata)}
          </pre>
        </div>
      </div>
    </aside>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={mono ? 'break-all font-mono text-xs text-slate-200' : 'text-slate-200'}>
        {value}
      </dd>
    </div>
  );
}
