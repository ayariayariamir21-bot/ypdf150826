import { Button } from '@pdfplatform/ui';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';
import { usePageNavigation } from '@/hooks/usePageNavigation';

export function PageNavigation(): React.ReactElement {
  const { currentDisplayIndex, totalSlots, goToNext, goToPrevious } = usePageNavigation();
  const hasPrevious = totalSlots > 0 && currentDisplayIndex > 1;
  const hasNext = currentDisplayIndex < totalSlots;

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-elevated dark:border-slate-700 dark:bg-slate-900/95">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={goToPrevious}
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        <IconChevronLeft />
      </Button>
      <span className="min-w-16 px-2 text-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
        {totalSlots > 0 ? `${currentDisplayIndex} / ${totalSlots}` : '0 / 0'}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={goToNext}
        disabled={!hasNext}
        aria-label="Next page"
      >
        <IconChevronRight />
      </Button>
    </div>
  );
}
