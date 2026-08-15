import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const snapshot = {
  document: { documentId: 'doc-1', name: 'test.pdf', pageCount: 3, sizeBytes: 10 },
  loading: false,
  error: null,
  recentDocuments: [],
};

vi.mock('@/lib/pdfLib', () => ({
  getPdfLibSnapshot: () => snapshot,
  subscribeToPdfLib: () => () => {},
}));

import { useZoom } from '@/hooks/useZoom';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useEditorStore } from '@/stores/editorStore';

const initial = {
  tool: 'select' as const,
  scale: 1,
  fitMode: null as null,
  pageOrder: [] as number[],
  currentPage: 0,
  nextBlankId: 0,
  pendingScrollSlot: null as number | null,
  scrollToken: 0,
  undoStack: [] as Array<{ pageOrder: number[]; currentPage: number }>,
  redoStack: [] as Array<{ pageOrder: number[]; currentPage: number }>,
  canUndo: false,
  canRedo: false,
};

beforeEach(() => {
  useEditorStore.setState(initial);
});

describe('useZoom', () => {
  it('zooms in and out in steps', () => {
    const { result } = renderHook(() => useZoom());
    act(() => result.current.zoomIn());
    expect(result.current.scale).toBe(1.25);
    act(() => result.current.zoomOut());
    expect(result.current.scale).toBe(1);
  });

  it('clamps zoom to the configured range', () => {
    const { result } = renderHook(() => useZoom());
    act(() => result.current.zoomTo(100));
    expect(result.current.scale).toBe(4);
    act(() => result.current.zoomTo(0.01));
    expect(result.current.scale).toBe(0.5);
  });

  it('selects fit modes', () => {
    const { result } = renderHook(() => useZoom());
    act(() => result.current.fitWidth());
    expect(result.current.fitMode).toBe('width');
    act(() => result.current.fitPage());
    expect(result.current.fitMode).toBe('page');
  });
});

describe('usePageNavigation', () => {
  it('derives position, neighbours and bounds', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().goToPage(1);
    const { result } = renderHook(() => usePageNavigation());
    expect(result.current.pageCount).toBe(3);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.currentDisplayIndex).toBe(2);
    expect(result.current.totalSlots).toBe(3);
    expect(result.current.previousSlot).toBe(0);
    expect(result.current.nextSlot).toBe(2);
  });

  it('navigates to next and previous pages', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().goToPage(0);
    const { result } = renderHook(() => usePageNavigation());
    expect(result.current.previousSlot).toBeNull();
    act(() => result.current.goToNext());
    expect(useEditorStore.getState().currentPage).toBe(1);
    act(() => result.current.goToNext());
    act(() => result.current.goToNext());
    expect(useEditorStore.getState().currentPage).toBe(2);
    expect(result.current.nextSlot).toBeNull();
  });

  it('scrolls to a page', () => {
    useEditorStore.getState().resetPages(3);
    const { result } = renderHook(() => usePageNavigation());
    const before = useEditorStore.getState().scrollToken;
    act(() => result.current.scrollToPage(2));
    const state = useEditorStore.getState();
    expect(state.pendingScrollSlot).toBe(2);
    expect(state.scrollToken).toBeGreaterThan(before);
  });
});
