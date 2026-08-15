import * as React from 'react';
import type { PdfPageInfo } from '@pdfplatform/pdf-engine-core';
import { CircularProgress } from '@pdfplatform/ui';
import {
  BLANK_PAGE_HEIGHT,
  BLANK_PAGE_WIDTH,
  FIT_PADDING,
  MAX_SCALE,
  MIN_SCALE,
} from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { getActiveEngine } from '@/lib/pdfLib';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useEditorStore } from '@/stores/editorStore';
import { PdfPage } from './PdfPage';

export function PdfCanvas(): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const { document } = usePdfDocument();
  const pageOrder = useEditorStore((state) => state.pageOrder);
  const currentPage = useEditorStore((state) => state.currentPage);
  const scale = useEditorStore((state) => state.scale);
  const fitMode = useEditorStore((state) => state.fitMode);
  const scrollToken = useEditorStore((state) => state.scrollToken);
  const pendingScrollSlot = useEditorStore((state) => state.pendingScrollSlot);
  const applyFitScale = useEditorStore((state) => state.applyFitScale);
  const setCurrentPage = useEditorStore((state) => state.setCurrentPage);
  const resetPages = useEditorStore((state) => state.resetPages);

  const [pageInfos, setPageInfos] = React.useState<readonly PdfPageInfo[]>([]);
  const [viewportSize, setViewportSize] = React.useState({ width: 0, height: 0 });

  const documentId = document?.documentId ?? null;

  React.useEffect(() => {
    if (!documentId) {
      setPageInfos([]);
      resetPages(0);
      return;
    }
    let cancelled = false;
    const engine = getActiveEngine();
    if (!engine) {
      return;
    }
    void engine.listPages(documentId).then((infos) => {
      if (!cancelled) {
        setPageInfos(infos);
        resetPages(infos.length);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [documentId, resetPages]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const update = (): void => {
      setViewportSize({ width: container.clientWidth, height: container.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const infosByIndex = React.useMemo(() => {
    const map = new Map<number, PdfPageInfo>();
    for (const info of pageInfos) {
      map.set(info.index, info);
    }
    return map;
  }, [pageInfos]);

  const currentInfo = currentPage >= 0 ? infosByIndex.get(currentPage) : null;
  const currentWidthPt = currentInfo?.widthPt ?? BLANK_PAGE_WIDTH;
  const currentHeightPt = currentInfo?.heightPt ?? BLANK_PAGE_HEIGHT;

  React.useEffect(() => {
    if (!fitMode || !documentId) {
      return;
    }
    const target =
      fitMode === 'width'
        ? (viewportSize.width - FIT_PADDING) / currentWidthPt
        : Math.min(
            (viewportSize.width - FIT_PADDING) / currentWidthPt,
            (viewportSize.height - FIT_PADDING) / currentHeightPt
          );
    const next = clamp(target, MIN_SCALE, MAX_SCALE);
    if (Math.abs(next - scale) > 0.001) {
      applyFitScale(fitMode, next);
    }
  }, [fitMode, scale, viewportSize, currentWidthPt, currentHeightPt, documentId, applyFitScale]);

  React.useEffect(() => {
    if (scrollToken === 0 || pendingScrollSlot === null) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const element = container.querySelector<HTMLElement>(
      `[data-page-slot="${pendingScrollSlot}"]`
    );
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollToken, pendingScrollSlot]);

  const handleScroll = (): void => {
    if (rafRef.current !== null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const pages = container.querySelectorAll<HTMLElement>('[data-page-slot]');
      let best: { slot: number; distance: number } | null = null;
      for (const page of pages) {
        const slot = Number(page.getAttribute('data-page-slot'));
        const top = page.getBoundingClientRect().top - containerRect.top + container.scrollTop;
        const distance = Math.abs(top - container.scrollTop);
        if (best === null || distance < best.distance) {
          best = { slot, distance };
        }
      }
      if (best !== null) {
        setCurrentPage(best.slot);
      }
    });
  };

  if (document && pageInfos.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-100 dark:bg-slate-950">
        <CircularProgress ariaLabel="Loading document" size={40} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-auto bg-slate-100 dark:bg-slate-950"
    >
      <div className="flex flex-col items-center gap-6 px-6 py-8">
        {pageOrder.map((slot) => {
          const isBlank = slot < 0;
          const info = isBlank ? null : infosByIndex.get(slot);
          if (!isBlank && !info) {
            return null;
          }
          const widthPt = info?.widthPt ?? BLANK_PAGE_WIDTH;
          const heightPt = info?.heightPt ?? BLANK_PAGE_HEIGHT;
          return (
            <PdfPage
              key={slot}
              slot={slot}
              pageIndex={isBlank ? null : slot}
              scale={scale}
              widthPt={widthPt}
              heightPt={heightPt}
            />
          );
        })}
      </div>
    </div>
  );
}
