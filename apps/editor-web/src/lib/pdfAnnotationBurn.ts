import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Annotation } from '@/types';

const DEFAULT_HIGHLIGHT: readonly [number, number, number] = [1, 0.92, 0.23];
const DEFAULT_NOTE: readonly [number, number, number] = [0.96, 0.62, 0.04];
const INK_COLOR: readonly [number, number, number] = [0.122, 0.161, 0.216];
const REDACTION_COLOR: readonly [number, number, number] = [0, 0, 0];
const MAX_NOTE_CHARS = 60;

function parseColor(
  hex: string | undefined,
  fallback: readonly [number, number, number]
): [number, number, number] {
  const value = hex?.trim().replace('#', '');
  if (value && /^[0-9a-fA-F]{6}$/.test(value)) {
    const parsed = parseInt(value, 16);
    return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
  }
  return [fallback[0], fallback[1], fallback[2]];
}

function isEncodableText(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if (code > 0xff) {
      return false;
    }
    if (code >= 0x20 && code <= 0x7e) {
      continue;
    }
    if (code >= 0xa0) {
      continue;
    }
    return false;
  }
  return true;
}

function fitText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function strokeWidth(page: PDFPage): number {
  return Math.max(1.5, page.getWidth() * 0.002);
}

function pagePoints(
  page: PDFPage,
  annotation: Annotation
): { x: number; y: number; w: number; h: number } {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const x = annotation.bbox.x * pageWidth;
  const w = annotation.bbox.w * pageWidth;
  const h = annotation.bbox.h * pageHeight;
  const y = pageHeight - (annotation.bbox.y + annotation.bbox.h) * pageHeight;
  return { x, y, w, h };
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

function drawAnnotation(page: PDFPage, annotation: Annotation, helvetica: PDFFont): void {
  const { x, y, w, h } = pagePoints(page, annotation);
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  switch (annotation.type) {
    case 'highlight': {
      const [r, g, b] = parseColor(annotation.color, DEFAULT_HIGHLIGHT);
      page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b), opacity: 0.35 });
      break;
    }
    case 'redaction': {
      // Visual redaction only: an opaque rectangle is drawn on top of the
      // content stream. The underlying text objects are NOT removed and could
      // still be extracted. This is not guaranteed content removal.
      const [r, g, b] = parseColor(annotation.color, REDACTION_COLOR);
      page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b), opacity: 1 });
      break;
    }
    case 'underline': {
      const [r, g, b] = parseColor(annotation.color, INK_COLOR);
      page.drawLine({
        start: { x, y },
        end: { x: x + w, y },
        thickness: strokeWidth(page),
        color: rgb(r, g, b),
      });
      break;
    }
    case 'strike': {
      const [r, g, b] = parseColor(annotation.color, INK_COLOR);
      page.drawLine({
        start: { x, y: y + h / 2 },
        end: { x: x + w, y: y + h / 2 },
        thickness: strokeWidth(page),
        color: rgb(r, g, b),
      });
      break;
    }
    case 'drawing':
    case 'signature': {
      const [r, g, b] = parseColor(annotation.color, INK_COLOR);
      const points = decodeDrawingPoints(annotation.content ?? '');
      const bboxLeft = annotation.bbox.x * pageWidth;
      const bboxTop = annotation.bbox.y * pageHeight;
      const bboxWidth = annotation.bbox.w * pageWidth;
      const bboxHeight = annotation.bbox.h * pageHeight;
      const pagePointsList = points.map(([relativeX, relativeY]) => ({
        x: bboxLeft + relativeX * bboxWidth,
        y: pageHeight - (bboxTop + relativeY * bboxHeight),
      }));
      for (let index = 1; index < pagePointsList.length; index += 1) {
        const start = pagePointsList[index - 1];
        const end = pagePointsList[index];
        if (start && end) {
          page.drawLine({
            start,
            end,
            thickness: strokeWidth(page),
            color: rgb(r, g, b),
          });
        }
      }
      break;
    }
    case 'note': {
      const [r, g, b] = parseColor(annotation.color, DEFAULT_NOTE);
      const markerSize = Math.min(w, h, 12);
      page.drawRectangle({ x, y, width: markerSize, height: markerSize, color: rgb(r, g, b) });
      const content = annotation.content?.trim() || 'Note';
      const text = content.slice(0, MAX_NOTE_CHARS);
      if (isEncodableText(text)) {
        const size = Math.max(6, Math.min(12, h * 0.5));
        const textX = x + markerSize + 4;
        const maxChars = Math.max(1, Math.floor((pageWidth - textX) / (size * 0.5)));
        page.drawText(fitText(text, maxChars), {
          x: textX,
          y: y + markerSize - 2,
          size,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
      }
      break;
    }
    case 'stamp': {
      const content = annotation.content?.trim();
      if (content && isEncodableText(content)) {
        const size = Math.max(8, Math.min(w, h, 24));
        const maxChars = Math.max(1, Math.floor(w / (size * 0.5)));
        const [r, g, b] = parseColor(annotation.color, INK_COLOR);
        page.drawText(fitText(content, maxChars), {
          x,
          y: y + (h - size) / 2,
          size,
          font: helvetica,
          color: rgb(r, g, b),
        });
      } else {
        const [r, g, b] = parseColor(annotation.color, INK_COLOR);
        page.drawRectangle({
          x,
          y,
          width: w,
          height: h,
          borderColor: rgb(r, g, b),
          borderWidth: 1.5,
          color: rgb(1, 1, 1),
        });
        const size = Math.max(6, Math.min(h * 0.5, w * 0.3, 12));
        page.drawText('Stamp', {
          x: x + 4,
          y: y + h / 2 - size / 2,
          size,
          font: helvetica,
          color: rgb(r, g, b),
        });
      }
      break;
    }
  }
}

export async function burnAnnotationsIntoPdf(
  originalBytes: Uint8Array,
  annotations: readonly Annotation[]
): Promise<Uint8Array> {
  if (annotations.length === 0) {
    return originalBytes.slice();
  }
  const bytes = new Uint8Array(originalBytes);
  const doc = await PDFDocument.load(bytes);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const byPage = new Map<number, Annotation[]>();
  for (const annotation of annotations) {
    const list = byPage.get(annotation.page);
    if (list) {
      list.push(annotation);
    } else {
      byPage.set(annotation.page, [annotation]);
    }
  }
  for (const [pageIndex, pageAnnotations] of byPage) {
    const page = pages[pageIndex];
    if (!page) {
      continue;
    }
    for (const annotation of pageAnnotations) {
      drawAnnotation(page, annotation, helvetica);
    }
  }
  return doc.save();
}
