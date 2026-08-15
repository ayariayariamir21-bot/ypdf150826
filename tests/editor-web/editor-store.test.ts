import { beforeEach, describe, expect, it } from 'vitest';
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

describe('editorStore pages', () => {
  it('resets pages from a count', () => {
    useEditorStore.getState().resetPages(3);
    expect(useEditorStore.getState().pageOrder).toEqual([0, 1, 2]);
  });

  it('deletes a page and keeps the order coherent', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().goToPage(1);
    useEditorStore.getState().deletePage(1);
    const state = useEditorStore.getState();
    expect(state.pageOrder).toEqual([0, 2]);
    expect(state.currentPage).toBe(0);
    expect(state.canUndo).toBe(true);
  });

  it('inserts a blank page after a slot', () => {
    useEditorStore.getState().resetPages(2);
    useEditorStore.getState().insertBlankPage(0);
    const state = useEditorStore.getState();
    expect(state.pageOrder).toEqual([0, -1, 1]);
    expect(state.nextBlankId).toBe(-1);
  });

  it('moves a page from one position to another', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().movePage(0, 2);
    expect(useEditorStore.getState().pageOrder).toEqual([1, 2, 0]);
  });

  it('ignores invalid moves', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().movePage(0, 0);
    useEditorStore.getState().movePage(0, 99);
    expect(useEditorStore.getState().pageOrder).toEqual([0, 1, 2]);
  });
});

describe('editorStore navigation', () => {
  it('tracks current page and scroll requests', () => {
    useEditorStore.getState().resetPages(4);
    useEditorStore.getState().goToPage(2);
    const state = useEditorStore.getState();
    expect(state.currentPage).toBe(2);
    expect(state.pendingScrollSlot).toBe(2);
    expect(state.scrollToken).toBe(1);
  });
});

describe('editorStore zoom', () => {
  it('records manual zoom and clears fit mode', () => {
    useEditorStore.getState().setFitMode('width');
    useEditorStore.getState().setScale(1.5);
    expect(useEditorStore.getState().scale).toBe(1.5);
    expect(useEditorStore.getState().fitMode).toBeNull();
  });

  it('stores applied fit scale with its mode', () => {
    useEditorStore.getState().applyFitScale('page', 0.8);
    expect(useEditorStore.getState().fitMode).toBe('page');
    expect(useEditorStore.getState().scale).toBe(0.8);
  });
});

describe('editorStore undo/redo', () => {
  it('undoes page mutations and redoes them', () => {
    useEditorStore.getState().resetPages(3);
    useEditorStore.getState().deletePage(1);
    expect(useEditorStore.getState().pageOrder).toEqual([0, 2]);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().pageOrder).toEqual([0, 1, 2]);
    expect(useEditorStore.getState().canRedo).toBe(true);

    useEditorStore.getState().redo();
    expect(useEditorStore.getState().pageOrder).toEqual([0, 2]);
    expect(useEditorStore.getState().canRedo).toBe(false);
  });
});
