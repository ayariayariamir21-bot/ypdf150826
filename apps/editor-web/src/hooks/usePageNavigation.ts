import { useCallback, useMemo } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { usePdfDocument } from './usePdfDocument';

export function usePageNavigation() {
  const document = usePdfDocument().document;
  const pageOrder = useEditorStore((state) => state.pageOrder);
  const currentPage = useEditorStore((state) => state.currentPage);
  const goToPage = useEditorStore((state) => state.goToPage);
  const requestScrollToPage = useEditorStore((state) => state.requestScrollToPage);

  const pageCount = document?.pageCount ?? 0;
  const position = pageOrder.indexOf(currentPage);

  const nextSlot = useMemo(
    () => (position !== -1 && position < pageOrder.length - 1 ? pageOrder[position + 1] ?? null : null),
    [position, pageOrder]
  );
  const previousSlot = useMemo(
    () => (position > 0 ? pageOrder[position - 1] ?? null : null),
    [position, pageOrder]
  );

  const goToNext = useCallback(() => {
    if (nextSlot !== null) {
      goToPage(nextSlot);
    }
  }, [nextSlot, goToPage]);

  const goToPrevious = useCallback(() => {
    if (previousSlot !== null) {
      goToPage(previousSlot);
    }
  }, [previousSlot, goToPage]);

  const goToPageIndex = useCallback(
    (slot: number) => {
      goToPage(slot);
    },
    [goToPage]
  );

  const scrollToPage = useCallback(
    (slot: number) => {
      requestScrollToPage(slot);
    },
    [requestScrollToPage]
  );

  return {
    pageCount,
    currentPage,
    currentDisplayIndex: position === -1 ? 1 : position + 1,
    totalSlots: pageOrder.length,
    nextSlot,
    previousSlot,
    goToNext,
    goToPrevious,
    goToPageIndex,
    scrollToPage,
  };
}
