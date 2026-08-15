import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, LinearProgress } from '@pdfplatform/ui';
import { usagePercent } from '@pdfplatform/entitlements';
import {
  IconChevronRight,
  IconFilePlus,
  IconFileText,
  IconUpload,
} from '@/components/icons';
import { DEMO_USAGE } from '@/lib/constants';
import { cn, errorMessage, fileToBytes, formatBytes, formatDate } from '@/lib/utils';
import { createBlankDocument, openDocument, reopenDocument } from '@/lib/pdfLib';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { AppHeader } from '@/components/layout/AppHeader';

export function Dashboard(): React.ReactElement {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const { recentDocuments } = usePdfDocument();
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');
  const showToast = useToastStore((state) => state.showToast);

  const openFile = async (file: File | undefined): Promise<void> => {
    if (!file) {
      return;
    }
    try {
      const bytes = await fileToBytes(file);
      const info = await openDocument({ type: 'bytes', data: bytes }, file.name);
      navigate(`/view?d=${encodeURIComponent(info.id)}`);
    } catch (cause) {
      showToast('error', errorMessage(cause));
    }
  };

  const openRecent = async (id: string): Promise<void> => {
    try {
      await reopenDocument(id);
      navigate(`/view?d=${encodeURIComponent(id)}`);
    } catch (cause) {
      showToast('error', errorMessage(cause));
    }
  };

  const newBlank = async (): Promise<void> => {
    try {
      const id = await createBlankDocument();
      navigate(`/view?d=${encodeURIComponent(id)}`);
    } catch (cause) {
      showToast('error', errorMessage(cause));
    }
  };

  const storagePercent = usagePercent(tier, 'storage:mb', DEMO_USAGE.storageUsedMb);
  const documentsPercent = usagePercent(tier, 'documents:monthly', DEMO_USAGE.documentsUsed);
  const aiPercent = usagePercent(tier, 'ai:requests:monthly', DEMO_USAGE.aiRequestsUsed);

  const usageCards = [
    {
      label: 'Storage used',
      value: `${formatBytes(DEMO_USAGE.storageUsedMb * 1024 * 1024)} of ${formatBytes(DEMO_USAGE.storageTotalMb * 1024 * 1024)}`,
      percent: storagePercent,
    },
    {
      label: 'Documents this month',
      value: `${DEMO_USAGE.documentsUsed} of ${DEMO_USAGE.documentsTotal}`,
      percent: documentsPercent,
    },
    {
      label: 'AI requests this month',
      value: `${DEMO_USAGE.aiRequestsUsed} of ${DEMO_USAGE.aiRequestsTotal}`,
      percent: aiPercent,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Your documents
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Open a PDF, edit pages and export your work.
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void openFile(event.dataTransfer.files[0]);
            }}
            className={cn(
              'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
              dragging
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                : 'border-slate-300 hover:border-brand-400 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-900'
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
              <IconUpload />
            </span>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Drop a PDF here or browse
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Drag and drop, or click to select a file
              </p>
            </div>
          </div>

          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <IconFilePlus />
            </span>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Start from a blank page</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Create a new document and add pages
              </p>
            </div>
            <button
              type="button"
              onClick={() => void newBlank()}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              New blank document
            </button>
          </div>
        </section>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            void openFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Recent documents
          </h2>
          {recentDocuments.length > 0 ? (
            <Card>
              <CardContent className="p-2">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentDocuments.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => void openRecent(doc.id)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                          <IconFileText />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {doc.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {formatBytes(doc.sizeBytes)} · {doc.pageCount} pages ·{' '}
                            {formatDate(doc.lastOpenedAt)}
                          </span>
                        </span>
                        <IconChevronRight className="shrink-0 text-slate-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No recent documents</CardTitle>
                <CardDescription>
                  Upload a PDF to start editing. Your recently opened files will appear here.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
            Usage overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {usageCards.map((card) => (
              <Card key={card.label}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="mb-2 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {card.value}
                  </p>
                  <LinearProgress value={card.percent} ariaLabel={card.label} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
