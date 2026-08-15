import { usagePercent } from '@pdfplatform/entitlements';
import { DEMO_USAGE } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useZoom } from '@/hooks/useZoom';
import { useAuthStore } from '@/stores/authStore';
import { useEditorStore } from '@/stores/editorStore';

const TOOL_LABELS: Readonly<Record<string, string>> = {
  select: 'Select',
  pan: 'Pan',
  text: 'Text',
  highlight: 'Highlight',
  underline: 'Underline',
  strike: 'Strike',
  note: 'Note',
  draw: 'Draw',
  sign: 'Sign',
};

export function StatusBar(): React.ReactElement {
  const { document } = usePdfDocument();
  const { currentDisplayIndex, totalSlots } = usePageNavigation();
  const { scale, fitMode } = useZoom();
  const tool = useEditorStore((state) => state.tool);
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');
  const storagePercent = usagePercent(tier, 'storage:mb', DEMO_USAGE.storageUsedMb);
  const percent = Math.round(scale * 100);

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <span className="min-w-0 flex-1 truncate">{document?.name ?? 'No document'}</span>
      <span className="tabular-nums">
        Page {totalSlots > 0 ? currentDisplayIndex : 0} of {totalSlots}
      </span>
      <span className="tabular-nums">
        {percent}%
      </span>
      <span className="capitalize">
        {fitMode ? `Fit ${fitMode === 'width' ? 'width' : 'page'} · ` : ''}
        {TOOL_LABELS[tool] ?? tool}
      </span>
      <span className="hidden tabular-nums sm:inline">
        {document ? formatBytes(document.sizeBytes) : '0 B'} · storage {storagePercent}%
      </span>
    </footer>
  );
}
