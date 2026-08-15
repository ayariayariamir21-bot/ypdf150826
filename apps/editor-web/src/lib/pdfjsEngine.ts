import {
  getDocument,
  GlobalWorkerOptions,
  version as pdfjsVersion,
  type PDFDocumentProxy,
  type PDFPageProxy,
} from 'pdfjs-dist';
import type {
  PdfDocumentAction,
  PdfDocumentId,
  PdfDocumentInfo,
  PdfEngine,
  PdfEngineEvent,
  PdfEngineFactory,
  PdfEngineInitOptions,
  PdfEngineListener,
  PdfExportOptions,
  PdfExportResult,
  PdfMetadata,
  PdfPageInfo,
  PdfPageRotation,
  PdfRenderOptions,
  PdfRenderResult,
  PdfSource,
  PdfTextExtractionOptions,
  PdfTextItem,
} from '@pdfplatform/pdf-engine-core';
import { uid } from './utils';

const WORKER_URL = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

GlobalWorkerOptions.workerSrc = WORKER_URL;

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function dateValue(value: unknown): Date | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const match = value.match(/^D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const year = match[1] ?? '0';
  const month = match[2] ?? '1';
  const day = match[3] ?? '1';
  const hour = match[4] ?? '0';
  const minute = match[5] ?? '0';
  const second = match[6] ?? '0';
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  date.setUTCHours(Number(hour), Number(minute), Number(second), 0);
  return date;
}

function toKeywords(value: unknown): readonly string[] | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  const keywords = value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
  return keywords.length > 0 ? keywords : null;
}

function toMetadata(info: Record<string, unknown>): PdfMetadata {
  return {
    title: stringValue(info.Title),
    author: stringValue(info.Author),
    subject: stringValue(info.Subject),
    keywords: toKeywords(info.Keywords),
    creator: stringValue(info.Creator),
    producer: stringValue(info.Producer),
    createdAt: dateValue(info.CreationDate),
    modifiedAt: dateValue(info.ModDate),
    encrypted: false,
  };
}

function normalizeRotation(rotation: number): PdfPageRotation {
  const normalized = rotation % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }
  return 0;
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
}

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sourceToBytes(source: PdfSource): Promise<Uint8Array> {
  if (source.type === 'bytes') {
    return source.data.slice();
  }
  if (source.type === 'base64') {
    const binary = atob(source.data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export class PdfJsEngine implements PdfEngine {
  readonly id = 'pdfjs' as const;
  readonly name = 'PDF.js';
  readonly version = pdfjsVersion;

  private readonly maxRenderScale: number;
  private readonly documents = new Map<PdfDocumentId, PDFDocumentProxy>();
  private readonly infos = new Map<PdfDocumentId, PdfDocumentInfo>();
  private readonly pageCache = new Map<string, Promise<PDFPageProxy>>();
  private readonly listeners = new Map<
    PdfEngineEvent,
    Set<PdfEngineListener<PdfEngineEvent>>
  >();

  constructor(options?: PdfEngineInitOptions) {
    this.maxRenderScale = options?.maxRenderScale ?? 8;
  }

  async load(source: PdfSource, name = 'document.pdf'): Promise<PdfDocumentInfo> {
    const data = await sourceToBytes(source);
    const pdf = await getDocument({ data }).promise;
    const id = uid();
    const rawInfo = await pdf.getMetadata().catch(() => null);
    const documentInfo: PdfDocumentInfo = {
      id,
      name,
      pageCount: pdf.numPages,
      sizeBytes: data.byteLength,
      metadata: toMetadata((rawInfo?.info as Record<string, unknown> | undefined) ?? {}),
      source,
      loadedAt: new Date(),
    };
    this.documents.set(id, pdf);
    this.infos.set(id, documentInfo);
    return documentInfo;
  }

  async close(documentId: PdfDocumentId): Promise<void> {
    const pdf = this.documents.get(documentId);
    if (pdf) {
      await pdf.destroy().catch(() => undefined);
    }
    this.documents.delete(documentId);
    this.infos.delete(documentId);
    const prefix = `${documentId}:`;
    for (const key of this.pageCache.keys()) {
      if (key.startsWith(prefix)) {
        this.pageCache.delete(key);
      }
    }
  }

  async getDocumentInfo(documentId: PdfDocumentId): Promise<PdfDocumentInfo> {
    return this.requireInfo(documentId);
  }

  async listPages(documentId: PdfDocumentId): Promise<readonly PdfPageInfo[]> {
    const pdf = this.requireDocument(documentId);
    const pages: PdfPageInfo[] = [];
    for (let index = 0; index < pdf.numPages; index += 1) {
      const page = await this.getPageProxy(documentId, index);
      const viewport = page.getViewport({ scale: 1 });
      pages.push({
        index,
        widthPt: viewport.width,
        heightPt: viewport.height,
        rotationDeg: normalizeRotation(page.rotate),
      });
    }
    return pages;
  }

  async renderPage(
    documentId: PdfDocumentId,
    pageIndex: number,
    options: PdfRenderOptions
  ): Promise<PdfRenderResult> {
    const scale = Math.min(options.scale, this.maxRenderScale);
    const page = await this.getPageProxy(documentId, pageIndex);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const width = Math.floor(viewport.width);
    const height = Math.floor(viewport.height);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context is unavailable');
    }
    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, width, height);
    }
    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL(`image/${options.format}`, options.quality ?? 0.92);
    canvas.width = 0;
    canvas.height = 0;
    return { pageIndex, dataUrl, width, height, format: options.format };
  }

  async exportDocument(
    documentId: PdfDocumentId,
    options: PdfExportOptions
  ): Promise<PdfExportResult> {
    const pdf = this.requireDocument(documentId);
    const info = this.requireInfo(documentId);
    const pageIndexes =
      options.pageIndexes && options.pageIndexes.length > 0 ? [...options.pageIndexes] : null;

    if (options.format === 'pdf') {
      const data = await pdf.getData();
      return { name: info.name, data, mimeType: 'application/pdf', sizeBytes: data.byteLength };
    }

    if (options.format === 'txt') {
      const items = await this.extractText(documentId, { pageIndexes: pageIndexes ?? undefined });
      const linesByPage = new Map<number, string[]>();
      for (const item of items) {
        const lines = linesByPage.get(item.pageIndex) ?? [];
        lines.push(item.text);
        linesByPage.set(item.pageIndex, lines);
      }
      const targetPages = pageIndexes ?? range(pdf.numPages);
      const parts = targetPages.map(
        (pageIndex) => `Page ${pageIndex + 1}\n${(linesByPage.get(pageIndex) ?? []).join(' ')}`
      );
      const text = parts.join('\n\n');
      const data = new TextEncoder().encode(text);
      return {
        name: `${stripExtension(info.name)}.txt`,
        data,
        mimeType: 'text/plain',
        sizeBytes: data.byteLength,
      };
    }

    const targetPages = pageIndexes ?? [0];
    const pageIndex = targetPages[0] ?? 0;
    const rendered = await this.renderPage(documentId, pageIndex, {
      scale: options.scale ?? 2,
      format: options.format,
      quality: options.quality,
    });
    const data = dataUrlToBytes(rendered.dataUrl);
    const extension = options.format === 'png' ? 'png' : 'jpg';
    return {
      name: `${stripExtension(info.name)}-p${pageIndex + 1}.${extension}`,
      data,
      mimeType: options.format === 'png' ? 'image/png' : 'image/jpeg',
      sizeBytes: data.byteLength,
    };
  }

  async extractText(
    documentId: PdfDocumentId,
    options?: PdfTextExtractionOptions
  ): Promise<readonly PdfTextItem[]> {
    const pdf = this.requireDocument(documentId);
    const pageIndexes =
      options?.pageIndexes && options.pageIndexes.length > 0
        ? [...options.pageIndexes]
        : range(pdf.numPages);
    const items: PdfTextItem[] = [];
    for (const pageIndex of pageIndexes) {
      const page = await this.getPageProxy(documentId, pageIndex);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if (!('str' in item)) {
          continue;
        }
        const transform = item.transform ?? [];
        const x = transform[4] ?? 0;
        const y = transform[5] ?? 0;
        const fontHeight = Math.hypot(transform[2] ?? 0, transform[3] ?? 0);
        items.push({
          pageIndex,
          text: item.str,
          x,
          y,
          width: item.width ?? fontHeight,
          height: fontHeight,
        });
      }
    }
    return items;
  }

  async applyAction(
    documentId: PdfDocumentId,
    action: PdfDocumentAction
  ): Promise<PdfDocumentInfo> {
    const info = this.requireInfo(documentId);
    if (action.type !== 'setMetadata') {
      throw new Error(`Action "${action.type}" is not supported by the PDF.js engine`);
    }
    const updated: PdfDocumentInfo = {
      ...info,
      metadata: { ...info.metadata, ...action.metadata },
    };
    this.infos.set(documentId, updated);
    return updated;
  }

  async splitDocument(
    documentId: PdfDocumentId,
    pageIndexes: readonly number[]
  ): Promise<readonly PdfDocumentId[]> {
    void documentId;
    void pageIndexes;
    throw new Error('Split document is not supported by the PDF.js engine');
  }

  async mergeDocuments(documentIds: readonly PdfDocumentId[]): Promise<PdfDocumentId> {
    void documentIds;
    throw new Error('Merge documents is not supported by the PDF.js engine');
  }

  on<E extends PdfEngineEvent>(event: E, listener: PdfEngineListener<E>): () => void {
    let handlers = this.listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this.listeners.set(event, handlers);
    }
    const set = handlers as Set<PdfEngineListener<PdfEngineEvent>>;
    set.add(listener as PdfEngineListener<PdfEngineEvent>);
    return () => {
      set.delete(listener as PdfEngineListener<PdfEngineEvent>);
    };
  }

  getPageProxy(documentId: PdfDocumentId, pageIndex: number): Promise<PDFPageProxy> {
    const key = `${documentId}:${pageIndex}`;
    let promise = this.pageCache.get(key);
    if (!promise) {
      promise = this.requireDocument(documentId).getPage(pageIndex + 1);
      this.pageCache.set(key, promise);
    }
    return promise;
  }

  private requireDocument(documentId: PdfDocumentId): PDFDocumentProxy {
    const pdf = this.documents.get(documentId);
    if (!pdf) {
      throw new Error(`Document "${documentId}" is not loaded`);
    }
    return pdf;
  }

  private requireInfo(documentId: PdfDocumentId): PdfDocumentInfo {
    const info = this.infos.get(documentId);
    if (!info) {
      throw new Error(`Document "${documentId}" is not loaded`);
    }
    return info;
  }
}

export const pdfJsEngineFactory: PdfEngineFactory = {
  id: 'pdfjs',
  name: 'PDF.js',
  async create(options?: PdfEngineInitOptions): Promise<PdfEngine> {
    if (options?.workerUrl) {
      GlobalWorkerOptions.workerSrc = options.workerUrl;
    }
    return new PdfJsEngine(options);
  },
};
