import { beforeEach, describe, expect, it } from 'vitest';
import { getDocument, GlobalWorkerOptions, OPS, type PDFDocumentProxy } from 'pdfjs-dist';
import { burnAnnotationsIntoPdf } from '@/lib/pdfAnnotationBurn';
import { buildSamplePdf } from '../helpers/sample-pdf';

beforeEach(() => {
  GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs';
});

async function loadPdf(data: Uint8Array): Promise<PDFDocumentProxy> {
  const task = getDocument({ data });
  return task.promise;
}

function annotation(
  type: 'highlight' | 'redaction' | 'note' | 'drawing',
  page: number,
  bbox: { x: number; y: number; w: number; h: number },
  extra: Partial<{ content: string; color: string }> = {}
) {
  return {
    id: `${type}-${page}`,
    type,
    page,
    bbox,
    createdAt: new Date(0).toISOString(),
    ...extra,
  };
}

async function pageText(document: PDFDocumentProxy, pageIndex: number): Promise<string> {
  const page = await document.getPage(pageIndex + 1);
  const content = await page.getTextContent();
  return content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .trim();
}

describe('burnAnnotationsIntoPdf', () => {
  it('produces bytes that differ from the input when redacting', async () => {
    const input = buildSamplePdf(['Sensitive text']);
    const burned = await burnAnnotationsIntoPdf(input, [
      annotation('redaction', 0, { x: 0.05, y: 0.1, w: 0.5, h: 0.12 }),
    ]);
    expect(burned.byteLength).not.toBe(input.byteLength);
    let identical = burned.byteLength === input.byteLength;
    for (let index = 0; identical && index < burned.byteLength; index += 1) {
      identical = burned[index] === input[index];
    }
    expect(identical).toBe(false);
  });

  it('keeps the page count unchanged after burning', async () => {
    const input = buildSamplePdf(['Two pages'], 2);
    const burned = await burnAnnotationsIntoPdf(input, [
      annotation('highlight', 0, { x: 0.1, y: 0.1, w: 0.3, h: 0.08 }),
    ]);
    const before = await loadPdf(input);
    const after = await loadPdf(burned);
    expect(after.numPages).toBe(before.numPages);
    await before.destroy();
    await after.destroy();
  });

  it('leaves unannotated pages untouched', async () => {
    const input = buildSamplePdf(['Shared line'], 2);
    const burned = await burnAnnotationsIntoPdf(input, [
      annotation('redaction', 0, { x: 0.05, y: 0.1, w: 0.5, h: 0.12 }),
    ]);
    const before = await loadPdf(input);
    const after = await loadPdf(burned);
    expect(await pageText(before, 1)).toBe('Page 2 Shared line');
    expect(await pageText(after, 1)).toBe('Page 2 Shared line');
    await before.destroy();
    await after.destroy();
  });

  it('returns the same bytes when there are no annotations', async () => {
    const input = buildSamplePdf(['No edits']);
    const burned = await burnAnnotationsIntoPdf(input, []);
    expect(burned.byteLength).toBe(input.byteLength);
    for (let index = 0; index < input.byteLength; index += 1) {
      expect(burned[index]).toBe(input[index]);
    }
  });

  it('draws highlight and redaction as distinct fill operations', async () => {
    const input = buildSamplePdf(['Highlight me'], 1);
    const burned = await burnAnnotationsIntoPdf(input, [
      annotation('highlight', 0, { x: 0.1, y: 0.1, w: 0.4, h: 0.1 }),
      annotation('redaction', 0, { x: 0.1, y: 0.3, w: 0.4, h: 0.1 }),
    ]);
    const document = await loadPdf(burned);
    const page = await document.getPage(1);
    const operatorList = await page.getOperatorList();
    const colors = new Set<string>();
    let fillCount = 0;
    for (let index = 0; index < operatorList.fnArray.length; index += 1) {
      const op = operatorList.fnArray[index];
      if (op === OPS.setFillRGBColor) {
        colors.add(String(operatorList.argsArray[index]));
      } else if (op === OPS.fill) {
        fillCount += 1;
      }
    }
    expect(fillCount).toBeGreaterThanOrEqual(2);
    expect(colors.size).toBeGreaterThanOrEqual(2);
    await document.destroy();
  });

  it('decodes drawing annotations into the burned content', async () => {
    const input = buildSamplePdf(['Drawing'], 1);
    const burned = await burnAnnotationsIntoPdf(input, [
      annotation('drawing', 0, { x: 0.2, y: 0.2, w: 0.4, h: 0.4 }, { content: '0,0 1,1 1,0' }),
    ]);
    const document = await loadPdf(burned);
    const page = await document.getPage(1);
    const operatorList = await page.getOperatorList();
    let paths = 0;
    let strokes = 0;
    for (const op of operatorList.fnArray) {
      if (op === OPS.constructPath) {
        paths += 1;
      } else if (op === OPS.stroke) {
        strokes += 1;
      }
    }
    expect(paths).toBeGreaterThanOrEqual(1);
    expect(strokes).toBeGreaterThanOrEqual(1);
    await document.destroy();
  });
});
