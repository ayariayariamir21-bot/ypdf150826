'use client';

import * as React from 'react';
import { IconCheck, IconDownload } from '@/components/icons';
import { useExportAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLogEntry } from '@/types';

interface ExportControlsProps {
  selected: readonly AuditLogEntry[];
  allEntries: readonly AuditLogEntry[];
  total: number;
}

export function ExportControls({ selected, allEntries, total }: ExportControlsProps): React.ReactElement {
  const exportMutation = useExportAuditLogs();
  const [format, setFormat] = React.useState<'csv' | 'json'>('csv');

  const entriesToExport = selected.length > 0 ? selected : allEntries;

  function handleExport(): void {
    exportMutation.mutate(entriesToExport, {
      onSuccess: (content) => {
        const blob =
          format === 'csv'
            ? new Blob([content], { type: 'text/csv;charset=utf-8' })
            : new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement('a');
        anchor.href = url;
        anchor.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.${format}`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(event) => setFormat(event.target.value as 'csv' | 'json')}
        className="input h-8 w-24"
        aria-label="Export format"
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={entriesToExport.length === 0 || exportMutation.isPending}
        className="btn-secondary h-8 gap-1.5"
        title={selected.length > 0 ? `Export ${selected.length} selected records` : `Export ${allEntries.length} filtered records`}
      >
        {exportMutation.isPending ? (
          <IconCheck size={13} className="animate-pulse" />
        ) : (
          <IconDownload size={13} />
        )}
        Export {selected.length > 0 ? `(${selected.length})` : ''}
      </button>
      {selected.length > 0 ? (
        <span className="text-xs text-slate-500">
          {selected.length} of {total} selected
        </span>
      ) : null}
    </div>
  );
}
