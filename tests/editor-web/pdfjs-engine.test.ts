import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { registerPdfEngine } from '@pdfplatform/pdf-engine-core';
import { PdfJsEngine, pdfJsEngineFactory } from '@/lib/pdfjsEngine';
import { buildSamplePdf } from '../helpers/sample-pdf';

beforeEach(() => {
  GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs';
  registerPdfEngine(pdfJsEngineFactory);
});

describe('PdfJsEngine', () => {
  it('reports engine metadata', () => {
    expect(new PdfJsEngine().id).toBe('pdfjs');
    expect(new PdfJsEngine().version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('loads a real PDF and reads document info', async () => {
    const engine = new PdfJsEngine();
    const info = await engine.load({ type: 'bytes', data: buildSamplePdf() }, 'sample.pdf');
    expect(info.id).toBeTruthy();
    expect(info.name).toBe('sample.pdf');
    expect(info.pageCount).toBe(1);
    expect(info.sizeBytes).toBeGreaterThan(0);
    expect(info.metadata.title).toBeNull();
    await engine.close(info.id);
  });

  it('lists pages with geometry', async () => {
    const engine = new PdfJsEngine();
    const info = await engine.load({ type: 'bytes', data: buildSamplePdf([], 2) }, 'two.pdf');
    const pages = await engine.listPages(info.id);
    expect(pages).toHaveLength(2);
    expect(pages[0]?.index).toBe(0);
    expect(pages[0]?.widthPt).toBeGreaterThan(0);
    expect(pages[0]?.heightPt).toBeGreaterThan(0);
    expect(pages[0]?.rotationDeg).toBe(0);
    await engine.close(info.id);
  });

  it('extracts text from a real PDF', async () => {
    const engine = new PdfJsEngine();
    const info = await engine.load(
      { type: 'bytes', data: buildSamplePdf(['Hello PDF.js', 'Second line']) },
      'text.pdf'
    );
    const items = await engine.extractText(info.id);
    const text = items.map((item) => item.text).join(' ');
    expect(text).toContain('Hello PDF.js');
    expect(text).toContain('Second line');
    const itemsPageOne = await engine.extractText(info.id, { pageIndexes: [0] });
    expect(itemsPageOne.length).toBeGreaterThan(0);
    expect(itemsPageOne.every((item) => item.pageIndex === 0)).toBe(true);
    await engine.close(info.id);
  });

  it('exports the document as PDF and txt', async () => {
    const engine = new PdfJsEngine();
    const info = await engine.load({ type: 'bytes', data: buildSamplePdf(['Export me']) }, 'export.pdf');
    const pdf = await engine.exportDocument(info.id, { format: 'pdf' });
    expect(pdf.mimeType).toBe('application/pdf');
    expect(pdf.sizeBytes).toBeGreaterThan(0);
    expect(pdf.data.byteLength).toBe(info.sizeBytes);

    const txt = await engine.exportDocument(info.id, { format: 'txt' });
    expect(txt.mimeType).toBe('text/plain');
    expect(txt.name).toBe('export.txt');
    const decoded = new TextDecoder().decode(txt.data);
    expect(decoded).toContain('Export me');
    await engine.close(info.id);
  });

  it('throws for unsupported actions', async () => {
    const engine = new PdfJsEngine();
    const info = await engine.load({ type: 'bytes', data: buildSamplePdf() }, 'a.pdf');
    await expect(engine.splitDocument(info.id, [0])).rejects.toThrow(/not supported/);
    await engine.close(info.id);
  });

  it('fails gracefully for invalid bytes', async () => {
    const engine = new PdfJsEngine();
    await expect(engine.load({ type: 'bytes', data: new Uint8Array(64) }, 'broken.pdf')).rejects.toThrow();
  });
});
