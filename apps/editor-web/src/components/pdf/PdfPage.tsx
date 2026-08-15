import * as React from 'react';
import { TextLayer, type RenderTask } from 'pdfjs-dist';
import { ANNOTATION_COLORS } from '@/lib/constants';
import { cn, clamp } from '@/lib/utils';
import { getActivePageProxy } from '@/lib/pdfLib';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useEditorStore, type ToolId } from '@/stores/editorStore';
import { AnnotationLayer } from '@/components/annotations/AnnotationLayer';

interface PdfPageProps {
  slot: number;
  pageIndex: number | null;
  scale: number;
  widthPt: number;
  heightPt: number;
}

const DEFAULT_COLOR = ANNOTATION_COLORS[0] ?? '#f59e0b';

function isAnnotationTool(tool: ToolId): boolean {
  return (
    tool === 'highlight' ||
    tool === 'underline' ||
    tool === 'strike' ||
    tool === 'note' ||
    tool === 'draw' ||
    tool === 'sign' ||
    tool === 'stamp' ||
    tool === 'redaction'
  );
}

export function PdfPage({ slot, pageIndex, scale, widthPt, heightPt }: PdfPageProps): React.ReactElement {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const textLayerRef = React.useRef<HTMLDivElement>(null);
  const renderTaskRef = React.useRef<RenderTask | null>(null);

  const tool = useEditorStore((state) => state.tool);

  const width = widthPt * scale;
  const height = heightPt * scale;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    let cancelled = false;
    const draw = async () => {
      if (pageIndex === null) {
        const context = canvas.getContext('2d');
        context?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const proxy = await getActivePageProxy(pageIndex);
      if (cancelled) {
        return;
      }
      const viewport = proxy.getViewport({ scale });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      const task = proxy.render({ canvasContext: context, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch {
        // render cancelled
      }
    };
    void draw();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [pageIndex, scale]);

  React.useEffect(() => {
    if (pageIndex === null) {
      return;
    }
    const container = textLayerRef.current;
    if (!container) {
      return;
    }
    let cancelled = false;
    let layer: TextLayer | null = null;
    const setup = async () => {
      const proxy = await getActivePageProxy(pageIndex);
      if (cancelled) {
        return;
      }
      const viewport = proxy.getViewport({ scale });
      layer = new TextLayer({
        textContentSource: proxy.streamTextContent(),
        container,
        viewport,
      });
      if (cancelled) {
        layer.cancel();
        return;
      }
      await layer.render();
    };
    void setup();
    return () => {
      cancelled = true;
      layer?.cancel();
    };
  }, [pageIndex, scale]);

  const handleTextSelection = (): void => {
    if (tool !== 'text' || pageIndex === null) {
      return;
    }
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range || range.collapsed) {
      return;
    }
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return;
    }
    const bounds = range.getBoundingClientRect();
    const x = clamp((bounds.left - rect.left) / rect.width, 0, 1);
    const y = clamp((bounds.top - rect.top) / rect.height, 0, 1);
    const w = clamp(bounds.width / rect.width, 0, 1 - x);
    const h = clamp(bounds.height / rect.height, 0, 1 - y);
    useAnnotationsStore.getState().addAnnotation({
      type: 'highlight',
      page: pageIndex,
      bbox: { x, y, w, h },
      color: DEFAULT_COLOR,
    });
    selection?.removeAllRanges();
  };

  const cursorClass =
    tool === 'pan'
      ? 'cursor-grab'
      : tool === 'text'
        ? 'cursor-text'
        : 'cursor-default';

  return (
    <div
      data-page-slot={slot}
      className="relative rounded-sm bg-white shadow-card"
      style={{ width, height, touchAction: isAnnotationTool(tool) ? 'none' : undefined }}
    >
      <div
        ref={wrapperRef}
        className={cn('absolute inset-0 overflow-hidden', cursorClass)}
        onMouseUp={handleTextSelection}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div ref={textLayerRef} className="textLayer" style={{ width, height }} />
        {pageIndex === null ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-slate-400">Blank page</span>
          </div>
        ) : null}
        <AnnotationLayer slot={slot} scale={scale} widthPt={widthPt} heightPt={heightPt} />
      </div>
    </div>
  );
}
