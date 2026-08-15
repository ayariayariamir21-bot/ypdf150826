import * as React from 'react';
import type { RenderTask } from 'pdfjs-dist';
import { Button } from '@pdfplatform/ui';
import { IconFilePlus, IconPlus, IconTrash } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getActivePageProxy } from '@/lib/pdfLib';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useEditorStore } from '@/stores/editorStore';

function Thumbnail({
  pageIndex,
  active,
  label,
}: {
  pageIndex: number;
  active: boolean;
  label: string;
}): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let task: RenderTask | null = null;
    const draw = async (): Promise<void> => {
      const proxy = await getActivePageProxy(pageIndex);
      if (cancelled) {
        return;
      }
      const base = proxy.getViewport({ scale: 1 });
      const thumbScale = Math.min(96 / base.width, 0.2);
      const viewport = proxy.getViewport({ scale: thumbScale });
      setSize({ width: Math.floor(viewport.width), height: Math.floor(viewport.height) });
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }
      task = proxy.render({ canvasContext: context, viewport });
      try {
        await task.promise;
      } catch {
        // render cancelled
      }
    };
    void draw();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pageIndex]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border bg-white',
        active
          ? 'border-brand-500 ring-2 ring-brand-500/30'
          : 'border-slate-200 dark:border-slate-700'
      )}
    >
      <div
        className="mx-1.5 my-1.5 overflow-hidden"
        style={{ width: size?.width ?? 96, height: size?.height ?? 128 }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <div className="absolute bottom-1 right-1 rounded bg-slate-900/70 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white">
        {label}
      </div>
    </div>
  );
}

function BlankThumbnail(): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900">
      <div className="mx-1.5 my-1.5 flex items-center justify-center" style={{ width: 96, height: 128 }}>
        <span className="text-[10px] text-slate-400">Blank</span>
      </div>
    </div>
  );
}

export function ThumbnailStrip(): React.ReactElement {
  const { document } = usePdfDocument();
  const pageOrder = useEditorStore((state) => state.pageOrder);
  const currentPage = useEditorStore((state) => state.currentPage);
  const goToPage = useEditorStore((state) => state.goToPage);
  const deletePage = useEditorStore((state) => state.deletePage);
  const insertBlankPage = useEditorStore((state) => state.insertBlankPage);
  const movePage = useEditorStore((state) => state.movePage);
  const [dragSlot, setDragSlot] = React.useState<number | null>(null);

  const lastSlot = pageOrder.length > 0 ? pageOrder[pageOrder.length - 1] ?? null : null;

  if (!document) {
    return <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No document</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {pageOrder.map((slot) => {
        const isBlank = slot < 0;
        const active = slot === currentPage;
        return (
          <div
            key={slot}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', String(slot));
              setDragSlot(slot);
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const source = dragSlot ?? Number(event.dataTransfer.getData('text/plain'));
              if (source !== slot && Number.isFinite(source)) {
                movePage(source, slot);
              }
              setDragSlot(null);
            }}
            onDragEnd={() => {
              setDragSlot(null);
            }}
            className="group relative"
          >
            {isBlank ? (
              <button
                type="button"
                className="block w-full"
                onClick={() => {
                  goToPage(slot);
                }}
                aria-label={`Go to blank page ${pageOrder.indexOf(slot) + 1}`}
              >
                <BlankThumbnail />
              </button>
            ) : (
              <button
                type="button"
                className="block w-full"
                onClick={() => {
                  goToPage(slot);
                }}
                aria-label={`Go to page ${slot + 1}`}
              >
                <Thumbnail pageIndex={slot} active={active} label={String(slot + 1)} />
              </button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute -right-2 -top-2 hidden rounded-full bg-white shadow-card group-hover:inline-flex dark:bg-slate-800"
              onClick={() => {
                deletePage(slot);
              }}
              aria-label={`Delete page ${pageOrder.indexOf(slot) + 1}`}
            >
              <IconTrash />
            </Button>
          </div>
        );
      })}
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
        onClick={() => {
          insertBlankPage(lastSlot ?? 0);
        }}
      >
        <IconPlus />
        New blank page
      </button>
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <IconFilePlus />
        Drag thumbnails to reorder
      </div>
    </div>
  );
}
