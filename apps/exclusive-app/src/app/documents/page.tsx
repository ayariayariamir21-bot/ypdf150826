'use client';

import * as React from 'react';
import {
  IconCheck,
  IconDownload,
  IconFileText,
  IconRefreshCw,
  IconSearch,
  IconUploadCloud,
} from '@/components/icons';
import { useDocuments } from '@/hooks/useDashboard';
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils';
import type { DocumentRecord } from '@/lib/apiClient';

const STATUS_STYLES: Readonly<Record<string, string>> = {
  processed: 'bg-success-500/10 text-success-500',
  processing: 'bg-brand-500/10 text-brand-400',
  queued: 'bg-warning-500/10 text-warning-500',
  failed: 'bg-danger-500/10 text-danger-500',
};

const TYPE_STYLES: Readonly<Record<string, string>> = {
  PDF: 'bg-danger-500/10 text-danger-400',
  DOCX: 'bg-brand-500/10 text-brand-400',
  PNG: 'bg-violet-500/10 text-violet-400',
  XLSX: 'bg-success-500/10 text-success-500',
};

export default function DocumentsPage(): React.ReactElement {
  const { data: initialDocuments, isLoading, refetch, isFetching } = useDocuments();
  const [documents, setDocuments] = React.useState<readonly DocumentRecord[]>([]);
  const [search, setSearch] = React.useState('');
  const [dragOver, setDragOver] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialDocuments) {
      setDocuments(initialDocuments);
    }
  }, [initialDocuments]);

  const visible = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      doc.pipeline.toLowerCase().includes(search.trim().toLowerCase())
  );

  function handleFiles(fileList: FileList | null): void {
    if (!fileList) {
      return;
    }
    const additions: DocumentRecord[] = Array.from(fileList).map((file, index) => ({
      id: `doc-upload-${Date.now()}-${index}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
      sizeBytes: file.size,
      status: 'processing',
      pipeline: 'Master Intake',
      modifiedAt: new Date().toISOString(),
    }));
    setDocuments((current) => [...additions, ...current]);
    setUploaded(`${additions.length} file(s) uploaded and queued for processing`);
    window.setTimeout(() => setUploaded(null), 4000);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">Documents</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {documents.length} files in your workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents…"
              className="input h-9 w-60 pl-8"
              aria-label="Search documents"
            />
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="btn-secondary h-9"
          >
            <IconRefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} />
          </button>
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors',
          dragOver
            ? 'border-brand-500 bg-brand-600/10'
            : 'border-dark-border-hover bg-dark-bg hover:border-brand-500/50'
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600/15 text-brand-400">
          <IconUploadCloud size={18} />
        </span>
        <p className="text-sm text-slate-200">
          Drop files here or{' '}
          <button
            type="button"
            className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
            onClick={() => window.document.getElementById('file-input')?.click()}
          >
            browse
          </button>
        </p>
        <p className="text-xs text-slate-500">PDF, DOCX, PNG, XLSX — up to 100 MB per file</p>
        <input
          id="file-input"
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {uploaded ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md border border-success-500/30 bg-success-500/10 px-3 py-2 text-sm text-success-500"
        >
          <IconCheck size={14} />
          {uploaded}
        </p>
      ) : null}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-bg-secondary">
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="hidden px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 md:table-cell">
                  Size
                </th>
                <th className="hidden px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 sm:table-cell">
                  Pipeline
                </th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="hidden px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 lg:table-cell">
                  Modified
                </th>
                <th className="w-12 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Loading documents…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                visible.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-dark-border transition-colors last:border-0 hover:bg-dark-bg"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-dark-bg-elevated text-slate-400">
                          <IconFileText size={15} />
                        </span>
                        <span className="max-w-64 truncate text-slate-200">{doc.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-medium',
                          TYPE_STYLES[doc.type] ?? 'bg-dark-bg-elevated text-slate-400'
                        )}
                      >
                        {doc.type}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-slate-400 md:table-cell">
                      {formatBytes(doc.sizeBytes)}
                    </td>
                    <td className="hidden max-w-40 truncate px-4 py-3 text-slate-400 sm:table-cell">
                      {doc.pipeline}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-medium capitalize',
                          STATUS_STYLES[doc.status] ?? 'bg-dark-bg-elevated text-slate-400'
                        )}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-slate-400 lg:table-cell">
                      {formatRelativeTime(doc.modifiedAt)}
                    </td>
                    <td className="px-2 py-3">
                      <button type="button" className="btn-ghost h-7 w-7 p-0" aria-label={`Download ${doc.name}`}>
                        <IconDownload size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
