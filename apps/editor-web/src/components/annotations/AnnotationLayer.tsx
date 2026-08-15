import * as React from 'react';
import { FEATURES, hasFeature, isTierAtLeast } from '@pdfplatform/entitlements';
import { useAnnotationsByPage } from '@/hooks/useAnnotations';
import { ANNOTATION_COLORS } from '@/lib/constants';
import { clamp } from '@/lib/utils';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useAuthStore } from '@/stores/authStore';
import { ANNOTATION_TOOL_IDS, useEditorStore, type ToolId } from '@/stores/editorStore';
import type { Annotation, AnnotationBBox, AnnotationType } from '@/types';
import { DrawingCanvas, normalizeStroke, type Point } from './DrawingCanvas';
import { HighlightOverlay } from './HighlightOverlay';
import { NotePin } from './NotePin';
import { RedactionOverlay } from './RedactionOverlay';

const MIN_SIZE = 0.015;
const DEFAULT_COLOR = ANNOTATION_COLORS[0] ?? '#f59e0b';
const INK_COLOR = '#1f2937';
const STAMP_EMOJI = '📌';
const STAMP_OPTIONS = ['📌', '✅', '❌', '⚠️', '★', '✓', '💡', '🔵'] as const;

interface AnnotationLayerProps {
  slot: number;
  scale: number;
  widthPt: number;
  heightPt: number;
}

type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se';

function isAnnotationTool(tool: ToolId): boolean {
  return (ANNOTATION_TOOL_IDS as readonly string[]).includes(tool);
}

function isRectTool(tool: ToolId): boolean {
  return tool === 'highlight' || tool === 'underline' || tool === 'strike' || tool === 'redaction';
}

function isPathTool(tool: ToolId): boolean {
  return tool === 'draw' || tool === 'sign';
}

function rectFromPoints(a: Point, b: Point): AnnotationBBox {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function moveBBox(original: AnnotationBBox, dx: number, dy: number): AnnotationBBox {
  return {
    x: clamp(original.x + dx, 0, 1 - original.w),
    y: clamp(original.y + dy, 0, 1 - original.h),
    w: original.w,
    h: original.h,
  };
}

function resizeBBox(
  original: AnnotationBBox,
  corner: ResizeCorner,
  dx: number,
  dy: number
): AnnotationBBox {
  let x = original.x;
  let y = original.y;
  let w = original.w;
  let h = original.h;
  switch (corner) {
    case 'nw':
      x = original.x + dx;
      y = original.y + dy;
      w = original.w - dx;
      h = original.h - dy;
      break;
    case 'ne':
      y = original.y + dy;
      w = original.w + dx;
      h = original.h - dy;
      break;
    case 'sw':
      x = original.x + dx;
      w = original.w - dx;
      h = original.h + dy;
      break;
    case 'se':
      w = original.w + dx;
      h = original.h + dy;
      break;
  }
  x = clamp(x, 0, 1 - MIN_SIZE);
  y = clamp(y, 0, 1 - MIN_SIZE);
  w = clamp(w, MIN_SIZE, 1 - x);
  h = clamp(h, MIN_SIZE, 1 - y);
  return { x, y, w, h };
}

interface Interaction {
  id: string;
  mode: 'move' | 'resize';
  corner?: ResizeCorner;
  startX: number;
  startY: number;
  original: AnnotationBBox;
}

interface StampPickerProps {
  annotation: Annotation;
  left: number;
  top: number;
  onChange: (emoji: string) => void;
}

function StampPicker({ annotation, left, top, onChange }: StampPickerProps): React.ReactElement {
  const flipLeft = left > 300 ? left - 232 : left;
  return (
    <div
      className="absolute z-10 grid grid-cols-4 gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
      style={{ left: flipLeft, top: top + 12 }}
      role="toolbar"
      aria-label="Choose stamp"
    >
      {STAMP_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`Stamp ${emoji}`}
          onClick={(event) => {
            event.stopPropagation();
            onChange(emoji);
          }}
          className={`flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800 ${
            annotation.content === emoji ? 'bg-brand-100 ring-1 ring-brand-400 dark:bg-brand-900/40' : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function AnnotationLayer({
  slot,
  scale,
  widthPt,
  heightPt,
}: AnnotationLayerProps): React.ReactElement {
  const layerRef = React.useRef<HTMLDivElement>(null);

  const tool = useEditorStore((state) => state.tool);
  const setTool = useEditorStore((state) => state.setTool);
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');

  const selectedId = useAnnotationsStore((state) => state.selectedId);
  const setSelectedId = useAnnotationsStore((state) => state.setSelectedId);
  const addAnnotation = useAnnotationsStore((state) => state.addAnnotation);
  const updateAnnotation = useAnnotationsStore((state) => state.updateAnnotation);
  const removeAnnotation = useAnnotationsStore((state) => state.removeAnnotation);

  const pageAnnotations = useAnnotationsByPage(slot);

  const redactionLocked = !isTierAtLeast(tier, 'premium');
  const signLocked = !hasFeature(tier, FEATURES.DIGITAL_SIGNATURE);

  const width = widthPt * scale;
  const height = heightPt * scale;

  const [draftRect, setDraftRect] = React.useState<AnnotationBBox | null>(null);
  const [draftPath, setDraftPath] = React.useState<readonly Point[]>([]);
  const [liveBbox, setLiveBbox] = React.useState<Readonly<Record<string, AnnotationBBox>>>({});

  const startPointRef = React.useRef<Point | null>(null);
  const interactionRef = React.useRef<Interaction | null>(null);

  const normalizedPoint = (event: React.PointerEvent): Point | null => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return null;
    }
    return {
      x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (tool === 'select') {
      setSelectedId(null);
      return;
    }
    if (!isAnnotationTool(tool)) {
      return;
    }
    const point = normalizedPoint(event);
    if (!point) {
      return;
    }
    startPointRef.current = point;
    if (isRectTool(tool)) {
      setDraftRect({ x: point.x, y: point.y, w: 0, h: 0 });
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    if (isPathTool(tool)) {
      setDraftPath([point]);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (tool === 'select') {
      const interaction = interactionRef.current;
      if (!interaction) {
        return;
      }
      const rect = layerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        return;
      }
      const dx = (event.clientX - interaction.startX) / rect.width;
      const dy = (event.clientY - interaction.startY) / rect.height;
      const next =
        interaction.mode === 'move'
          ? moveBBox(interaction.original, dx, dy)
          : resizeBBox(interaction.original, interaction.corner ?? 'se', dx, dy);
      setLiveBbox((current) => ({ ...current, [interaction.id]: next }));
      return;
    }
    if (tool === 'note' || tool === 'stamp') {
      return;
    }
    const point = normalizedPoint(event);
    if (!point) {
      return;
    }
    if (isRectTool(tool) && draftRect) {
      const start = startPointRef.current;
      if (start) {
        setDraftRect(rectFromPoints(start, point));
      }
      return;
    }
    if (isPathTool(tool) && draftPath.length > 0) {
      const last = draftPath[draftPath.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) > 0.002) {
        setDraftPath((current) => [...current, point]);
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (tool === 'select') {
      const interaction = interactionRef.current;
      if (interaction) {
        const bbox = liveBbox[interaction.id] ?? interaction.original;
        updateAnnotation(interaction.id, { bbox });
        interactionRef.current = null;
        setLiveBbox((current) => {
          const next = { ...current };
          delete next[interaction.id];
          return next;
        });
      }
      return;
    }
    if (tool === 'note' || tool === 'stamp') {
      const start = startPointRef.current;
      const end = normalizedPoint(event);
      if (!start || !end) {
        return;
      }
      if (Math.hypot(end.x - start.x, end.y - start.y) < 0.03) {
        if (tool === 'note') {
          addAnnotation({
            type: 'note',
            page: slot,
            bbox: { x: start.x, y: start.y, w: 0.06, h: 0.06 },
            color: DEFAULT_COLOR,
            content: '',
          });
          setTool('select');
        } else {
          addAnnotation({
            type: 'stamp',
            page: slot,
            bbox: {
              x: clamp(start.x - 0.06, 0, 1),
              y: clamp(start.y - 0.06, 0, 1),
              w: 0.12,
              h: 0.12,
            },
            content: STAMP_EMOJI,
          });
          setTool('select');
        }
      }
      startPointRef.current = null;
      return;
    }
    const point = normalizedPoint(event);
    startPointRef.current = null;
    if (isRectTool(tool) && draftRect && point) {
      const bbox = draftRect;
      setDraftRect(null);
      if (bbox.w < MIN_SIZE && bbox.h < MIN_SIZE) {
        return;
      }
      if (tool === 'redaction' && redactionLocked) {
        return;
      }
      addAnnotation({
        type: tool as AnnotationType,
        page: slot,
        bbox,
        color: tool === 'redaction' ? '#111827' : DEFAULT_COLOR,
      });
      return;
    }
    if (isPathTool(tool)) {
      const path = draftPath;
      setDraftPath([]);
      if (path.length < 2) {
        return;
      }
      if (tool === 'sign' && signLocked) {
        return;
      }
      const normalized = normalizeStroke(path);
      addAnnotation({
        type: tool === 'sign' ? 'signature' : 'drawing',
        page: slot,
        bbox: normalized.bbox,
        content: normalized.content,
        color: INK_COLOR,
      });
    }
  };

  React.useEffect(() => {
    if (tool !== 'select' || !selectedId) {
      return;
    }
    const handler = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        removeAnnotation(selectedId);
      } else if (event.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tool, selectedId, removeAnnotation, setSelectedId]);

  const beginMove = (event: React.PointerEvent, annotation: Annotation): void => {
    if (tool !== 'select') {
      return;
    }
    event.stopPropagation();
    setSelectedId(annotation.id);
    interactionRef.current = {
      id: annotation.id,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      original: annotation.bbox,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const beginResize = (
    event: React.PointerEvent,
    annotation: Annotation,
    corner: ResizeCorner
  ): void => {
    if (tool !== 'select') {
      return;
    }
    event.stopPropagation();
    setSelectedId(annotation.id);
    interactionRef.current = {
      id: annotation.id,
      mode: 'resize',
      corner,
      startX: event.clientX,
      startY: event.clientY,
      original: annotation.bbox,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const cursorClass =
    tool === 'select'
      ? 'cursor-default'
      : tool === 'note' || tool === 'stamp' || isRectTool(tool) || isPathTool(tool)
        ? 'cursor-crosshair'
        : '';

  const interactive = tool === 'select';
  const touchAction = tool === 'select' || tool === 'text' || tool === 'pan' ? 'auto' : 'none';

  return (
    <div
      ref={layerRef}
      className={`absolute inset-0 ${cursorClass}`}
      style={{
        width,
        height,
        touchAction,
        pointerEvents: tool === 'text' || tool === 'pan' ? 'none' : 'auto',
        zIndex: 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {pageAnnotations.map((annotation) => {
        const bbox = liveBbox[annotation.id] ?? annotation.bbox;
        const left = bbox.x * width;
        const top = bbox.y * height;
        const w = bbox.w * width;
        const h = bbox.h * height;
        const selected = interactive && selectedId === annotation.id;
        let content: React.ReactNode = null;

        switch (annotation.type) {
          case 'highlight':
          case 'underline':
          case 'strike':
            content = (
              <HighlightOverlay
                annotation={annotation}
                left={left}
                top={top}
                width={w}
                height={h}
              />
            );
            break;
          case 'note':
            content = (
              <NotePin
                annotation={annotation}
                selected={selected}
                onSelect={() => setSelectedId(annotation.id)}
                onUpdate={(noteContent) => updateAnnotation(annotation.id, { content: noteContent })}
                onRemove={() => removeAnnotation(annotation.id)}
                pinLeft={left}
                pinTop={top}
              />
            );
            break;
          case 'drawing':
          case 'signature':
            content = (
              <DrawingCanvas
                content={annotation.content ?? ''}
                color={annotation.color ?? INK_COLOR}
              />
            );
            break;
          case 'stamp':
            content = (
              <div
                aria-hidden="true"
                className="flex size-full items-center justify-center text-2xl leading-none"
              >
                {annotation.content || STAMP_EMOJI}
              </div>
            );
            break;
          case 'redaction':
            content = (
              <RedactionOverlay
                annotation={annotation}
                left={left}
                top={top}
                width={w}
                height={h}
              />
            );
            break;
        }

        return (
          <div
            key={annotation.id}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : -1}
            aria-label={
              interactive
                ? `Annotation: ${annotation.type}${annotation.content ? `, ${annotation.content}` : ''}`
                : undefined
            }
            aria-selected={selected}
            className={`absolute ${interactive ? 'cursor-move' : 'pointer-events-none'}`}
            style={{ left, top, width: w, height: h }}
            onPointerDown={(event) => beginMove(event, annotation)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedId(annotation.id);
              }
            }}
          >
            {content}
            {selected ? (
              <div className="absolute -inset-[3px] rounded-sm border border-brand-500/80 pointer-events-none" />
            ) : null}
            {selected && annotation.type === 'stamp' ? (
              <StampPicker
                annotation={annotation}
                left={left}
                top={top}
                onChange={(emoji) => updateAnnotation(annotation.id, { content: emoji })}
              />
            ) : null}
            {selected && annotation.type !== 'note' ? (
              <>
                <ResizeHandle
                  corner="nw"
                  onPointerDown={(event) => beginResize(event, annotation, 'nw')}
                />
                <ResizeHandle
                  corner="ne"
                  onPointerDown={(event) => beginResize(event, annotation, 'ne')}
                />
                <ResizeHandle
                  corner="sw"
                  onPointerDown={(event) => beginResize(event, annotation, 'sw')}
                />
                <ResizeHandle
                  corner="se"
                  onPointerDown={(event) => beginResize(event, annotation, 'se')}
                />
              </>
            ) : null}
          </div>
        );
      })}

      {draftRect ? (
        <div
          aria-hidden="true"
          className={
            tool === 'redaction' && redactionLocked
              ? 'pointer-events-none absolute flex items-center justify-center rounded-[2px] border-2 border-dashed border-danger-500/70 bg-black/5'
              : 'pointer-events-none absolute rounded-[2px] border border-brand-500/70'
          }
          style={{
            left: draftRect.x * width,
            top: draftRect.y * height,
            width: draftRect.w * width,
            height: draftRect.h * height,
          }}
        >
          {tool === 'redaction' && redactionLocked ? <span className="text-base">🔒</span> : null}
        </div>
      ) : null}

      {isPathTool(tool) && draftPath.length >= 2 ? (
        <DraftStroke points={draftPath} width={width} height={height} />
      ) : null}
    </div>
  );
}

function DraftStroke({
  points,
  width,
  height,
}: {
  points: readonly Point[];
  width: number;
  height: number;
}): React.ReactElement {
  const normalized = normalizeStroke(points);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        left: normalized.bbox.x * width,
        top: normalized.bbox.y * height,
        width: normalized.bbox.w * width,
        height: normalized.bbox.h * height,
      }}
    >
      <DrawingCanvas content={normalized.content} color={INK_COLOR} />
    </div>
  );
}

function ResizeHandle({
  corner,
  onPointerDown,
}: {
  corner: ResizeCorner;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}): React.ReactElement {
  const cursorClass =
    corner === 'nw' || corner === 'se'
      ? 'cursor-nwse-resize'
      : corner === 'ne' || corner === 'sw'
        ? 'cursor-nesw-resize'
        : 'cursor-default';
  const positionClass =
    corner === 'nw'
      ? '-left-1 -top-1'
      : corner === 'ne'
        ? '-right-1 -top-1'
        : corner === 'sw'
          ? '-left-1 -bottom-1'
          : '-right-1 -bottom-1';
  return (
    <div
      aria-hidden="true"
      className={`absolute size-2 rounded-sm border border-white bg-brand-500 ${cursorClass} ${positionClass}`}
      onPointerDown={onPointerDown}
    />
  );
}
