import { useCallback } from 'react';
import { MAX_SCALE, MIN_SCALE } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { useEditorStore } from '@/stores/editorStore';

export function useZoom() {
  const scale = useEditorStore((state) => state.scale);
  const fitMode = useEditorStore((state) => state.fitMode);
  const setScale = useEditorStore((state) => state.setScale);
  const setFitMode = useEditorStore((state) => state.setFitMode);
  const applyFitScale = useEditorStore((state) => state.applyFitScale);

  const zoomIn = useCallback(() => {
    setScale(clamp(Math.round(scale * 1.25 * 100) / 100, MIN_SCALE, MAX_SCALE));
  }, [scale, setScale]);

  const zoomOut = useCallback(() => {
    setScale(clamp(Math.round(scale * 0.8 * 100) / 100, MIN_SCALE, MAX_SCALE));
  }, [scale, setScale]);

  const zoomTo = useCallback(
    (value: number) => {
      setScale(clamp(value, MIN_SCALE, MAX_SCALE));
    },
    [setScale]
  );

  const fitWidth = useCallback(() => {
    setFitMode('width');
  }, [setFitMode]);

  const fitPage = useCallback(() => {
    setFitMode('page');
  }, [setFitMode]);

  return { scale, fitMode, zoomIn, zoomOut, zoomTo, fitWidth, fitPage, applyFitScale };
}
