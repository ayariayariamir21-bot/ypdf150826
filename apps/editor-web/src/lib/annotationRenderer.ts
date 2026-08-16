import type { Annotation } from '@/types';

const DEFAULT_HIGHLIGHT = '#ffeb3b';
const DEFAULT_NOTE = '#f59e0b';
const INK_COLOR = '#1f2937';
const MAX_NOTE_CHARS = 60;

function resolveColor(color: string | undefined, fallback: string): string {
  return color && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
}

function decodeDrawingPoints(content: string): readonly (readonly [number, number])[] {
  const segments = content.trim().split(/\s+/);
  const points: [number, number][] = [];
  for (const segment of segments) {
    const [rawX, rawY] = segment.split(',');
    points.push([Number(rawX ?? 0), Number(rawY ?? 0)]);
  }
  return points;
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  color: string,
  width: number,
  height: number
): void {
  if (points.length < 2) {
    return;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, width * 0.008);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const [firstX, firstY] = points[0] ?? [0, 0];
  ctx.moveTo(firstX * width, firstY * height);
  for (let index = 1; index < points.length; index += 1) {
    const [pointX, pointY] = points[index] ?? [0, 0];
    ctx.lineTo(pointX * width, pointY * height);
  }
  ctx.stroke();
}

export function drawAnnotationsOnContext(
  ctx: CanvasRenderingContext2D,
  annotations: readonly Annotation[],
  page: number,
  width: number,
  height: number
): void {
  for (const annotation of annotations) {
    if (annotation.page !== page) {
      continue;
    }
    const x = annotation.bbox.x * width;
    const y = annotation.bbox.y * height;
    const w = annotation.bbox.w * width;
    const h = annotation.bbox.h * height;

    switch (annotation.type) {
      case 'highlight': {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = resolveColor(annotation.color, DEFAULT_HIGHLIGHT);
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        break;
      }
      case 'redaction': {
        ctx.fillStyle = annotation.color ?? '#000000';
        ctx.fillRect(x, y, w, h);
        break;
      }
      case 'underline': {
        ctx.strokeStyle = resolveColor(annotation.color, INK_COLOR);
        ctx.lineWidth = Math.max(1.5, width * 0.002);
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        break;
      }
      case 'strike': {
        ctx.strokeStyle = resolveColor(annotation.color, INK_COLOR);
        ctx.lineWidth = Math.max(1.5, width * 0.002);
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();
        break;
      }
      case 'drawing':
      case 'signature': {
        const points = decodeDrawingPoints(annotation.content ?? '');
        drawStroke(
          ctx,
          points,
          resolveColor(annotation.color ?? INK_COLOR, INK_COLOR),
          w,
          h
        );
        break;
      }
      case 'note': {
        const markerSize = Math.min(w, h, 14);
        ctx.fillStyle = resolveColor(annotation.color, DEFAULT_NOTE);
        ctx.fillRect(x, y, markerSize, markerSize);
        const text = (annotation.content ?? '').slice(0, MAX_NOTE_CHARS);
        if (text) {
          const size = 12;
          ctx.font = `${size}px sans-serif`;
          ctx.fillStyle = INK_COLOR;
          ctx.textBaseline = 'top';
          const maxWidth = Math.max(0, width - (x + markerSize + 4));
          let clipped = text;
          while (clipped.length > 1 && ctx.measureText(clipped).width > maxWidth) {
            clipped = clipped.slice(0, -1);
          }
          ctx.fillText(clipped, x + markerSize + 4, y + 2, maxWidth);
          ctx.textBaseline = 'alphabetic';
        }
        break;
      }
      case 'stamp': {
        const content = annotation.content?.trim();
        const color = resolveColor(annotation.color ?? INK_COLOR, INK_COLOR);
        if (content) {
          ctx.font = `${Math.min(w, h, 48)}px sans-serif`;
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(content, x + w / 2, y + h / 2);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        } else {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = color;
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Stamp', x + w / 2, y + h / 2);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        }
        break;
      }
    }
  }
}
