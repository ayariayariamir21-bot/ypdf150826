import { create } from 'zustand';
import { MAX_HISTORY } from '@/lib/constants';

export const TOOL_IDS = [
  'select',
  'pan',
  'text',
  'highlight',
  'underline',
  'strike',
  'note',
  'draw',
  'sign',
  'stamp',
  'redaction',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export const ANNOTATION_TOOL_IDS = [
  'highlight',
  'underline',
  'strike',
  'note',
  'draw',
  'sign',
  'stamp',
  'redaction',
] as const;
export type AnnotationToolId = (typeof ANNOTATION_TOOL_IDS)[number];

export type FitMode = 'width' | 'page' | null;

export interface EditorSnapshot {
  pageOrder: number[];
  currentPage: number;
}

interface EditorState {
  tool: ToolId;
  scale: number;
  fitMode: FitMode;
  pageOrder: number[];
  currentPage: number;
  nextBlankId: number;
  pendingScrollSlot: number | null;
  scrollToken: number;
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  setTool: (tool: ToolId) => void;
  setScale: (scale: number) => void;
  setFitMode: (fitMode: FitMode) => void;
  applyFitScale: (fitMode: FitMode, scale: number) => void;
  resetPages: (pageCount: number) => void;
  deletePage: (slot: number) => void;
  insertBlankPage: (afterSlot: number) => void;
  movePage: (fromSlot: number, toSlot: number) => void;
  goToPage: (slot: number) => void;
  setCurrentPage: (slot: number) => void;
  requestScrollToPage: (slot: number) => void;
  undo: () => void;
  redo: () => void;
}

function snapshotOf(state: EditorState): EditorSnapshot {
  return { pageOrder: state.pageOrder, currentPage: state.currentPage };
}

function historyChange(state: EditorState, next: EditorSnapshot): Partial<EditorState> {
  const undoStack = [...state.undoStack, snapshotOf(state)].slice(-MAX_HISTORY);
  return {
    ...next,
    undoStack,
    redoStack: [],
    canUndo: undoStack.length > 0,
    canRedo: false,
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: 'select',
  scale: 1,
  fitMode: null,
  pageOrder: [],
  currentPage: 0,
  nextBlankId: 0,
  pendingScrollSlot: null,
  scrollToken: 0,
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
  setTool: (tool) => set({ tool }),
  setScale: (scale) => set({ scale, fitMode: null }),
  setFitMode: (fitMode) => set({ fitMode }),
  applyFitScale: (fitMode, scale) => set({ fitMode, scale }),
  resetPages: (pageCount) =>
    set({
      pageOrder: Array.from({ length: pageCount }, (_, index) => index),
      currentPage: 0,
      nextBlankId: 0,
      pendingScrollSlot: null,
      scrollToken: 0,
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    }),
  deletePage: (slot) =>
    set((state) => {
      const pageOrder = state.pageOrder.filter((item) => item !== slot);
      if (pageOrder.length === 0) {
        return state;
      }
      const currentPage = state.currentPage === slot ? pageOrder[0] ?? 0 : state.currentPage;
      return historyChange(state, { pageOrder, currentPage });
    }),
  insertBlankPage: (afterSlot) =>
    set((state) => {
      const blank = state.nextBlankId - 1;
      const pageOrder: number[] = [];
      for (const slot of state.pageOrder) {
        pageOrder.push(slot);
        if (slot === afterSlot) {
          pageOrder.push(blank);
        }
      }
      if (pageOrder.length === state.pageOrder.length) {
        return state;
      }
      return {
        ...historyChange(state, { pageOrder, currentPage: state.currentPage }),
        nextBlankId: state.nextBlankId - 1,
      };
    }),
  movePage: (fromSlot, toSlot) =>
    set((state) => {
      const pageOrder = [...state.pageOrder];
      const fromIndex = pageOrder.indexOf(fromSlot);
      const toIndex = pageOrder.indexOf(toSlot);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return state;
      }
      const moved = pageOrder.splice(fromIndex, 1)[0];
      if (moved === undefined) {
        return state;
      }
      pageOrder.splice(toIndex, 0, moved);
      return historyChange(state, { pageOrder, currentPage: state.currentPage });
    }),
  goToPage: (slot) =>
    set((state) => ({
      currentPage: slot,
      pendingScrollSlot: slot,
      scrollToken: state.scrollToken + 1,
    })),
  setCurrentPage: (slot) => set({ currentPage: slot }),
  requestScrollToPage: (slot) =>
    set((state) => ({
      pendingScrollSlot: slot,
      scrollToken: state.scrollToken + 1,
    })),
  undo: () =>
    set((state) => {
      const previous = state.undoStack[state.undoStack.length - 1];
      if (!previous) {
        return state;
      }
      return {
        pageOrder: previous.pageOrder,
        currentPage: previous.currentPage,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          { pageOrder: state.pageOrder, currentPage: state.currentPage },
        ],
        canUndo: state.undoStack.length - 1 > 0,
        canRedo: true,
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) {
        return state;
      }
      return {
        pageOrder: next.pageOrder,
        currentPage: next.currentPage,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [
          ...state.undoStack,
          { pageOrder: state.pageOrder, currentPage: state.currentPage },
        ],
        canUndo: true,
        canRedo: state.redoStack.length - 1 > 0,
      };
    }),
}));
