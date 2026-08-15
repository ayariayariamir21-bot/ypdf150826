import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { registerPdfEngine } from '@pdfplatform/pdf-engine-core';
import { pdfJsEngineFactory } from '@/lib/pdfjsEngine';
import {
  closeActiveDocument,
  createBlankDocument,
  getActivePageProxy,
  getPdfLibSnapshot,
  openDocument,
  reopenDocument,
} from '@/lib/pdfLib';
import { buildSamplePdf } from '../helpers/sample-pdf';

beforeEach(() => {
  GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs';
  registerPdfEngine(pdfJsEngineFactory);
  localStorage.clear();
});

describe('pdfLib', () => {
  it('opens a real PDF and publishes a snapshot', async () => {
    const info = await openDocument({ type: 'bytes', data: buildSamplePdf(['Lib test']) }, 'lib.pdf');
    expect(info.name).toBe('lib.pdf');
    const snapshot = getPdfLibSnapshot();
    expect(snapshot.loading).toBe(false);
    expect(snapshot.error).toBeNull();
    expect(snapshot.document).toMatchObject({ documentId: info.id, name: 'lib.pdf', pageCount: 1 });
    expect(snapshot.recentDocuments.some((item) => item.id === info.id)).toBe(true);
    await closeActiveDocument();
  });

  it('exposes an active page proxy for rendering', async () => {
    const info = await openDocument({ type: 'bytes', data: buildSamplePdf(['Proxy']) }, 'proxy.pdf');
    const proxy = await getActivePageProxy(0);
    const viewport = proxy.getViewport({ scale: 1 });
    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
    expect(info.pageCount).toBe(1);
    await closeActiveDocument();
  });

  it('reopens a cached document after closing it', async () => {
    const info = await openDocument({ type: 'bytes', data: buildSamplePdf(['Reopen']) }, 'reopen.pdf');
    const id = info.id;
    await closeActiveDocument();
    expect(getPdfLibSnapshot().document).toBeNull();
    await reopenDocument(id);
    expect(getPdfLibSnapshot().document).toMatchObject({ name: 'reopen.pdf', pageCount: 1 });
    expect(getPdfLibSnapshot().document?.documentId).not.toBe(id);
    await closeActiveDocument();
  });

  it('creates a blank PDF document', async () => {
    const id = await createBlankDocument();
    const snapshot = getPdfLibSnapshot();
    expect(snapshot.document?.documentId).toBe(id);
    expect(snapshot.document?.pageCount).toBe(1);
    expect(snapshot.document?.name).toBe('Blank.pdf');
    await closeActiveDocument();
  });

  it('reports errors from failed loads', async () => {
    await expect(
      openDocument({ type: 'bytes', data: new Uint8Array(8) }, 'bad.pdf')
    ).rejects.toThrow();
    const snapshot = getPdfLibSnapshot();
    expect(snapshot.document).toBeNull();
    expect(snapshot.error).not.toBeNull();
  });
});
