import * as React from 'react';
import type { Annotation } from '@/types';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { usePdfDocument } from './usePdfDocument';

const STORAGE_PREFIX = 'pdfstudio:annotations:';

function storageKey(documentId: string): string {
  return `${STORAGE_PREFIX}${documentId}`;
}

function isAnnotation(value: unknown): value is Annotation {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    typeof item.page === 'number' &&
    typeof item.bbox === 'object' &&
    item.bbox !== null
  );
}

function loadAnnotations(documentId: string): readonly Annotation[] | null {
  try {
    const raw = localStorage.getItem(storageKey(documentId));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter(isAnnotation);
  } catch {
    return null;
  }
}

function saveAnnotations(documentId: string, annotations: readonly Annotation[]): void {
  try {
    localStorage.setItem(storageKey(documentId), JSON.stringify(annotations));
  } catch {
    // storage may be unavailable
  }
}

export function useAnnotations() {
  const { document } = usePdfDocument();
  const documentId = document?.documentId ?? null;
  const previousId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (documentId === previousId.current) {
      return;
    }
    previousId.current = documentId;
    const annotations = documentId ? loadAnnotations(documentId) : null;
    useAnnotationsStore.getState().replaceAll(annotations ?? []);
  }, [documentId]);

  React.useEffect(() => {
    if (!documentId) {
      return;
    }
    return useAnnotationsStore.subscribe((state, previous) => {
      if (state.annotations !== previous.annotations) {
        saveAnnotations(documentId, state.annotations);
      }
    });
  }, [documentId]);

  const store = useAnnotationsStore();

  return {
    annotations: store.annotations,
    selectedId: store.selectedId,
    canUndo: store.canUndo,
    canRedo: store.canRedo,
    add: store.addAnnotation,
    update: store.updateAnnotation,
    remove: store.removeAnnotation,
    clearPage: store.clearPage,
    clearAll: store.clearAll,
    setSelectedId: store.setSelectedId,
    undo: store.undo,
    redo: store.redo,
  };
}

export function useAnnotationsByPage(page: number): readonly Annotation[] {
  const annotations = useAnnotationsStore((state) => state.annotations);
  return React.useMemo(
    () => annotations.filter((annotation) => annotation.page === page),
    [annotations, page]
  );
}
