import { beforeEach, describe, expect, it } from 'vitest';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import type { Annotation } from '@/types';

function seed(): Annotation[] {
  return [
    {
      id: 'a-1',
      type: 'highlight',
      page: 0,
      bbox: { x: 0.1, y: 0.1, w: 0.5, h: 0.2 },
      color: '#f59e0b',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'a-2',
      type: 'note',
      page: 1,
      bbox: { x: 0.2, y: 0.3, w: 0.1, h: 0.1 },
      content: 'review this',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
}

function reset(): void {
  useAnnotationsStore.setState({
    annotations: [],
    selectedId: null,
    canUndo: false,
    canRedo: false,
    undoStack: [],
    redoStack: [],
  });
}

beforeEach(reset);

describe('annotationsStore CRUD', () => {
  it('adds an annotation and selects it', () => {
    const id = useAnnotationsStore.getState().addAnnotation({
      type: 'highlight',
      page: 0,
      bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
    });
    const state = useAnnotationsStore.getState();
    expect(state.annotations).toHaveLength(1);
    expect(state.annotations[0]).toMatchObject({ id, type: 'highlight', page: 0 });
    expect(state.selectedId).toBe(id);
    expect(state.canUndo).toBe(true);
  });

  it('updates an annotation in place', () => {
    useAnnotationsStore.setState({ annotations: seed() });
    useAnnotationsStore.getState().updateAnnotation('a-1', { content: 'edited' });
    const annotation = useAnnotationsStore.getState().annotations.find((item) => item.id === 'a-1');
    expect(annotation?.content).toBe('edited');
  });

  it('removes an annotation and clears selection', () => {
    useAnnotationsStore.setState({ annotations: seed(), selectedId: 'a-1' });
    useAnnotationsStore.getState().removeAnnotation('a-1');
    const state = useAnnotationsStore.getState();
    expect(state.annotations).toHaveLength(1);
    expect(state.annotations[0]?.id).toBe('a-2');
    expect(state.selectedId).toBeNull();
  });

  it('clears a single page and everything', () => {
    useAnnotationsStore.setState({ annotations: seed() });
    useAnnotationsStore.getState().clearPage(0);
    expect(useAnnotationsStore.getState().annotations).toHaveLength(1);
    useAnnotationsStore.getState().clearAll();
    expect(useAnnotationsStore.getState().annotations).toHaveLength(0);
  });

  it('replaces the whole set without history', () => {
    useAnnotationsStore.setState({ annotations: seed() });
    useAnnotationsStore.getState().replaceAll([]);
    expect(useAnnotationsStore.getState().canUndo).toBe(false);
  });
});

describe('annotationsStore undo/redo', () => {
  it('undoes and redoes mutations', () => {
    const store = useAnnotationsStore;
    store.getState().addAnnotation({
      type: 'highlight',
      page: 0,
      bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
    });
    store.getState().addAnnotation({
      type: 'redaction',
      page: 0,
      bbox: { x: 0.3, y: 0.3, w: 0.2, h: 0.2 },
    });
    expect(store.getState().annotations).toHaveLength(2);

    store.getState().undo();
    expect(store.getState().annotations).toHaveLength(1);
    expect(store.getState().canUndo).toBe(true);
    expect(store.getState().canRedo).toBe(true);

    store.getState().undo();
    expect(store.getState().annotations).toHaveLength(0);
    expect(store.getState().canUndo).toBe(false);

    store.getState().redo();
    expect(store.getState().annotations).toHaveLength(1);
    expect(store.getState().annotations[0]?.type).toBe('highlight');
  });

  it('clears the redo stack on a new mutation', () => {
    const store = useAnnotationsStore;
    store.getState().addAnnotation({
      type: 'note',
      page: 0,
      bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
    });
    store.getState().undo();
    expect(store.getState().canRedo).toBe(true);
    store.getState().addAnnotation({
      type: 'stamp',
      page: 0,
      bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
    });
    expect(store.getState().canRedo).toBe(false);
  });
});
