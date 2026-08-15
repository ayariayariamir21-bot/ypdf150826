'use client';

import * as React from 'react';
import { IconArrowUpDown, IconChevronLeft, IconChevronRight } from '@/components/icons';
import { AUDIT_ACTION_LABELS, AUDIT_PAGE_SIZES, AUDIT_STATUS_LABELS } from '@/lib/constants';
import { cn, formatDateTime } from '@/lib/utils';
import type { AuditLogEntry, AuditPageSize, AuditSort, AuditSortKey, AuditStatus } from '@/types';

const STATUS_BADGE: Readonly<Record<AuditStatus, string>> = {
  success: 'bg-success-500/10 text-success-500',
  warning: 'bg-warning-500/10 text-warning-500',
  blocked: 'bg-danger-500/10 text-danger-500',
};

const COLUMNS: readonly { key: AuditSortKey; label: string; className?: string }[] = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User' },
  { key: 'action', label: 'Action' },
  { key: 'resource', label: 'Resource', className: 'hidden md:table-cell' },
  { key: 'ip', label: 'IP address', className: 'hidden lg:table-cell' },
  { key: 'status', label: 'Status' },
];

interface AuditTableProps {
  entries: readonly AuditLogEntry[];
  total: number;
  page: number;
  pageSize: AuditPageSize;
  sort: AuditSort;
  selectedIds: ReadonlySet<string>;
  loading: boolean;
  onSortChange: (sort: AuditSort) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: AuditPageSize) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelect: (entry: AuditLogEntry) => void;
}

function pageItems(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  if (page > 3) {
    pages.push('ellipsis');
  }
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  for (let value = start; value <= end; value += 1) {
    pages.push(value);
  }
  if (page < pageCount - 2) {
    pages.push('ellipsis');
  }
  pages.push(pageCount);
  return pages;
}

export function AuditTable({
  entries,
  total,
  page,
  pageSize,
  sort,
  selectedIds,
  loading,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onToggleSelect,
  onToggleSelectAll,
  onSelect,
}: AuditTableProps): React.ReactElement {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const allVisibleSelected = entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-dark-border bg-dark-bg-secondary">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onToggleSelectAll}
                  className="h-3.5 w-3.5 cursor-pointer accent-brand-600"
                  aria-label="Select all visible rows"
                />
              </th>
              {COLUMNS.map((column) => {
                const isActive = sort.key === column.key;
                return (
                  <th key={column.key} className={cn('px-3 py-2.5 font-medium', column.className)}>
                    <button
                      type="button"
                      onClick={() =>
                        onSortChange({
                          key: column.key,
                          direction:
                            isActive && sort.direction === 'asc' ? 'desc' : 'asc',
                        })
                      }
                      className={cn(
                        'flex items-center gap-1 text-xs uppercase tracking-wide transition-colors',
                        isActive ? 'text-brand-300' : 'text-slate-500 hover:text-slate-300'
                      )}
                    >
                      {column.label}
                      <IconArrowUpDown
                        size={11}
                        className={cn(
                          isActive && (sort.direction === 'asc' ? 'rotate-180' : undefined)
                        )}
                      />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500" aria-busy="true">
                  Loading audit records…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const selected = selectedIds.has(entry.id);
                return (
                  <tr
                    key={entry.id}
                    onClick={() => onSelect(entry)}
                    className={cn(
                      'cursor-pointer border-b border-dark-border transition-colors last:border-0',
                      selected ? 'bg-brand-600/10' : 'hover:bg-dark-bg'
                    )}
                  >
                    <td
                      className="px-3 py-2.5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(entry.id)}
                        className="h-3.5 w-3.5 cursor-pointer accent-brand-600"
                        aria-label={`Select record ${entry.id}`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-300">
                      {formatDateTime(entry.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dark-bg-elevated text-[10px] font-bold text-slate-400">
                          {entry.user.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-slate-200">{entry.user}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-300">
                      {AUDIT_ACTION_LABELS[entry.action]}
                    </td>
                    <td className={cn('max-w-56 truncate px-3 py-2.5 font-mono text-xs text-slate-400', 'hidden md:table-cell')}>
                      {entry.resource}
                    </td>
                    <td className={cn('whitespace-nowrap px-3 py-2.5 font-mono text-xs text-slate-400', 'hidden lg:table-cell')}>
                      {entry.ip}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-medium',
                          STATUS_BADGE[entry.status]
                        )}
                      >
                        {AUDIT_STATUS_LABELS[entry.status]}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dark-border bg-dark-bg-secondary px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            Showing {start}–{end} of {total}
          </span>
          <span className="text-dark-border-hover">|</span>
          <label className="flex items-center gap-1.5">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value) as AuditPageSize)}
              className="input h-7 w-16 px-2"
              aria-label="Rows per page"
            >
              {AUDIT_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="btn-ghost h-7 w-7 p-0"
            aria-label="Previous page"
          >
            <IconChevronLeft size={14} />
          </button>
          {pageItems(page, pageCount).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`e${index}`} className="px-1 text-xs text-slate-600">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={loading}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'h-7 min-w-7 rounded-md px-1.5 text-xs font-medium transition-colors',
                  item === page
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-dark-bg-elevated hover:text-slate-200'
                )}
              >
                {item}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount || loading}
            className="btn-ghost h-7 w-7 p-0"
            aria-label="Next page"
          >
            <IconChevronRight size={14} />
          </button>
        </nav>
      </div>
    </div>
  );
}
