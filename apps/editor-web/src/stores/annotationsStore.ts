import { create } from 'zustand';
import type { Annotation, AnnotationPatch } from '@/types';
import { MAX_HISTORY } from '@/lib/constants';
import { uid } from '@/lib/utils';

interface HistoryEntry {
  annotations: readonly Annotation[];
}

interface AnnotationsState {
  annotations: readonly Annotation[];
  selectedId: string | null;
  canUndo: boolean;
  canRedo: boolean;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => string;
  updateAnnotation: (id: string, patch: AnnotationPatch) => void;
  removeAnnotation: (id: string) => void;
  clearPage: (page: number) => void;
  clearAll: () => void;
  setSelectedId: (id: string | null) => void;
  replaceAll: (annotations: readonly Annotation[]) => void;
  undo: () => void;
  redo: () => void;
}

type HistoryUpdate = Pick<
  AnnotationsState,
  'annotations' | 'undoStack' | 'redoStack' | 'canUndo' | 'canRedo'
>;

function pushHistory(state: AnnotationsState, annotations: readonly Annotation[]): HistoryUpdate {
  const undoStack = [...state.undoStack, { annotations: state.annotations }].slice(-MAX_HISTORY);
  return {
    annotations,
    undoStack,
    redoStack: [],
    canUndo: undoStack.length > 0,
    canRedo: false,
  };
}

export const useAnnotationsStore = create<AnnotationsState>((set) => ({
  annotations: [],
  selectedId: null,
  canUndo: false,
  canRedo: false,
  undoStack: [],
  redoStack: [],
  addAnnotation: (annotation) => {
    const created: Annotation = {
      ...annotation,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      ...pushHistory(state, [...state.annotations, created]),
      selectedId: created.id,
    }));
    return created.id;
  },
  updateAnnotation: (id, patch) =>
    set((state) => {
      const current = state.annotations.find((annotation) => annotation.id === id);
      if (!current) {
        return state;
      }
      const annotations = state.annotations.map((annotation) =>
        annotation.id === id ? { ...annotation, ...patch } : annotation
      );
      return pushHistory(state, annotations);
    }),
  removeAnnotation: (id) =>
    set((state) => {
      if (!state.annotations.some((annotation) => annotation.id === id)) {
        return state;
      }
      return {
        ...pushHistory(
          state,
          state.annotations.filter((annotation) => annotation.id !== id)
        ),
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }),
  clearPage: (page) =>
    set((state) => {
      const annotations = state.annotations.filter((annotation) => annotation.page !== page);
      if (annotations.length === state.annotations.length) {
        return state;
      }
      return {
        ...pushHistory(state, annotations),
        selectedId: null,
      };
    }),
  clearAll: () =>
    set((state) =>
      state.annotations.length === 0
        ? state
        : { ...pushHistory(state, []), selectedId: null }
    ),
  setSelectedId: (selectedId) => set({ selectedId }),
  replaceAll: (annotations) => set({ annotations, selectedId: null }),
  undo: () =>
    set((state) => {
      const previous = state.undoStack[state.undoStack.length - 1];
      if (!previous) {
        return state;
      }
      return {
        annotations: previous.annotations,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { annotations: state.annotations }],
        canUndo: state.undoStack.length - 1 > 0,
        canRedo: true,
        selectedId: null,
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) {
        return state;
      }
      return {
        annotations: next.annotations,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, { annotations: state.annotations }],
        canUndo: true,
        canRedo: state.redoStack.length - 1 > 0,
        selectedId: null,
      };
    }),
}));
