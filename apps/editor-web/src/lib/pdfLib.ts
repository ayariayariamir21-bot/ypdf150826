import {
  createEngine,
  type PdfDocumentInfo,
  type PdfEngine,
  type PdfExportFormat,
  type PdfSource,
} from '@pdfplatform/pdf-engine-core';
import type { PDFPageProxy } from 'pdfjs-dist';
import type { PdfRecentDocument } from '@/types';
import type { Annotation } from '@/types';
import { BLANK_PAGE_HEIGHT, BLANK_PAGE_WIDTH, MAX_HISTORY } from './constants';
import { downloadBlob, errorMessage, uid } from './utils';
import { PdfJsEngine } from './pdfjsEngine';
import { burnAnnotationsIntoPdf } from './pdfAnnotationBurn';
import { drawAnnotationsOnContext } from './annotationRenderer';

export interface PdfLibDocument {
  documentId: string;
  name: string;
  pageCount: number;
  sizeBytes: number;
}

export interface PdfLibSnapshot {
  document: PdfLibDocument | null;
  loading: boolean;
  error: string | null;
  recentDocuments: readonly PdfRecentDocument[];
}

interface CachedSource {
  name: string;
  source: PdfSource;
}

const RECENT_KEY = 'pdfstudio:recent';

const listeners = new Set<() => void>();
const documentCache = new Map<string, CachedSource>();

let activeEngine: PdfEngine | null = null;
let activeDocument: PdfLibDocument | null = null;
let loading = false;
let error: string | null = null;
let recentDocuments: readonly PdfRecentDocument[] = loadRecents();

function buildSnapshot(): PdfLibSnapshot {
  return {
    document: activeDocument,
    loading,
    error,
    recentDocuments,
  };
}

let snapshot: PdfLibSnapshot = buildSnapshot();

function emit(): void {
  snapshot = buildSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

function loadRecents(): readonly PdfRecentDocument[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item): item is { id: unknown; name: unknown; sizeBytes: unknown; pageCount: unknown } =>
          typeof item === 'object' && item !== null
      )
      .map((item) => ({
        id: String(item.id ?? ''),
        name: String(item.name ?? ''),
        sizeBytes: Number(item.sizeBytes ?? 0),
        pageCount: Number(item.pageCount ?? 0),
        createdAt: new Date(0),
        updatedAt: new Date(0),
        lastOpenedAt: new Date(0),
      }));
  } catch {
    return [];
  }
}

function saveRecents(items: readonly PdfRecentDocument[]): void {
  try {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          sizeBytes: item.sizeBytes,
          pageCount: item.pageCount,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          lastOpenedAt: item.lastOpenedAt.toISOString(),
        }))
      )
    );
  } catch {
    // storage may be unavailable
  }
}

function addRecentDocument(info: PdfDocumentInfo): void {
  const now = new Date();
  const recent: PdfRecentDocument = {
    id: info.id,
    name: info.name,
    sizeBytes: info.sizeBytes,
    pageCount: info.pageCount,
    createdAt: info.loadedAt,
    updatedAt: now,
    lastOpenedAt: now,
  };
  const next = [recent, ...recentDocuments.filter((item) => item.id !== info.id)].slice(
    0,
    MAX_HISTORY
  );
  recentDocuments = next;
  saveRecents(next);
}

function makeBlankPdfBytes(widthPt: number, heightPt: number): Uint8Array {
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /ProcSet [/PDF /Text] >> /Contents 4 0 R >>\nendobj\n`,
    '4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n',
  ];
  const header = '%PDF-1.4\n';
  const offsets: number[] = [];
  let cursor = header.length;
  for (const object of objects) {
    offsets.push(cursor);
    cursor += object.length;
  }
  const xrefOffset = cursor;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const objectOffset of offsets) {
    xref += `${String(objectOffset).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(header + objects.join('') + xref);
}

export function subscribeToPdfLib(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPdfLibSnapshot(): PdfLibSnapshot {
  return snapshot;
}

export function getActiveEngine(): PdfEngine | null {
  return activeEngine;
}

export async function getActivePageProxy(pageIndex: number): Promise<PDFPageProxy> {
  const engine = activeEngine;
  const document = activeDocument;
  if (!engine || !document) {
    throw new Error('No document is open');
  }
  if (engine instanceof PdfJsEngine) {
    return engine.getPageProxy(document.documentId, pageIndex);
  }
  throw new Error('The active engine does not expose page rendering');
}

export async function openDocument(source: PdfSource, name: string): Promise<PdfDocumentInfo> {
  loading = true;
  error = null;
  emit();
  try {
    if (!activeEngine) {
      activeEngine = await createEngine('pdfjs');
    }
    const info = await activeEngine.load(source, name);
    activeDocument = {
      documentId: info.id,
      name: info.name,
      pageCount: info.pageCount,
      sizeBytes: info.sizeBytes,
    };
    documentCache.set(info.id, { name: info.name, source });
    addRecentDocument(info);
    loading = false;
    emit();
    return info;
  } catch (cause) {
    loading = false;
    error = errorMessage(cause);
    emit();
    throw cause;
  }
}

export async function reopenDocument(id: string): Promise<void> {
  const cached = documentCache.get(id);
  if (!cached) {
    throw new Error('Document source is no longer available');
  }
  await openDocument(cached.source, cached.name);
}

export async function createBlankDocument(): Promise<string> {
  const data = makeBlankPdfBytes(BLANK_PAGE_WIDTH, BLANK_PAGE_HEIGHT);
  const info = await openDocument({ type: 'bytes', data }, 'Blank.pdf');
  return info.id;
}

export async function closeActiveDocument(): Promise<void> {
  const engine = activeEngine;
  const documentId = activeDocument?.documentId;
  activeDocument = null;
  emit();
  if (engine && documentId) {
    await engine.close(documentId);
  }
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

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to render the exported page'));
    image.src = dataUrl;
  });
}

export async function exportActiveDocument(
  format: PdfExportFormat,
  annotations: readonly Annotation[],
  pageIndexes?: readonly number[]
): Promise<void> {
  const engine = activeEngine;
  const document = activeDocument;
  if (!engine || !document) {
    throw new Error('No document is open');
  }
  if (format === 'pdf') {
    const result = await engine.exportDocument(document.documentId, { format, pageIndexes });
    const blobPart = result.data as Uint8Array<ArrayBuffer>;
    if (annotations.length === 0) {
      downloadBlob(new Blob([blobPart], { type: result.mimeType }), result.name);
      return;
    }
    const burned = await burnAnnotationsIntoPdf(result.data, annotations);
    downloadBlob(new Blob([burned as Uint8Array<ArrayBuffer>], { type: result.mimeType }), result.name);
    return;
  }
  if (format === 'txt') {
    const result = await engine.exportDocument(document.documentId, { format, pageIndexes });
    const blobPart = result.data as Uint8Array<ArrayBuffer>;
    downloadBlob(new Blob([blobPart], { type: result.mimeType }), result.name);
    return;
  }
  const targetPages = pageIndexes && pageIndexes.length > 0 ? [...pageIndexes] : [0];
  const pageIndex = targetPages[0] ?? 0;
  const rendered = await engine.renderPage(document.documentId, pageIndex, {
    scale: 2,
    format,
    quality: 0.92,
  });
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = rendered.width;
  canvas.height = rendered.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable');
  }
  const image = await loadImage(rendered.dataUrl);
  context.drawImage(image, 0, 0, rendered.width, rendered.height);
  drawAnnotationsOnContext(context, annotations, pageIndex, rendered.width, rendered.height);
  const dataUrl = canvas.toDataURL(`image/${format}`, 0.92);
  canvas.width = 0;
  canvas.height = 0;
  const data = dataUrlToBytes(dataUrl);
  const extension = format === 'png' ? 'png' : 'jpg';
  const name = `${document.name.replace(/\.pdf$/i, '')}-p${pageIndex + 1}.${extension}`;
  downloadBlob(new Blob([data as Uint8Array<ArrayBuffer>], { type: `image/${format}` }), name);
}

export function makeTemporaryId(): string {
  return uid();
}
