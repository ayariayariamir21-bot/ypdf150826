export const PDF_ENGINE_IDS = ['pdfjs', 'pdf-lib', 'custom'] as const;
export type PdfEngineId = (typeof PDF_ENGINE_IDS)[number];

export type PdfEngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PdfSource =
  | { type: 'bytes'; data: Uint8Array }
  | { type: 'url'; url: string }
  | { type: 'base64'; data: string };

export type PdfDocumentId = string;

export interface PdfMetadata {
  title: string | null;
  author: string | null;
  subject: string | null;
  keywords: readonly string[] | null;
  creator: string | null;
  producer: string | null;
  createdAt: Date | null;
  modifiedAt: Date | null;
  encrypted: boolean;
}

export interface PdfDocumentInfo {
  id: PdfDocumentId;
  name: string;
  pageCount: number;
  sizeBytes: number;
  metadata: PdfMetadata;
  source: PdfSource;
  loadedAt: Date;
}

export type PdfPageRotation = 0 | 90 | 180 | 270;

export interface PdfPageInfo {
  index: number;
  widthPt: number;
  heightPt: number;
  rotationDeg: PdfPageRotation;
}

export interface PdfRenderOptions {
  scale: number;
  format: 'png' | 'jpeg';
  quality?: number;
  backgroundColor?: string;
}

export interface PdfRenderResult {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}

export const PDF_EXPORT_FORMATS = ['pdf', 'png', 'jpeg', 'txt'] as const;
export type PdfExportFormat = (typeof PDF_EXPORT_FORMATS)[number];

export interface PdfExportOptions {
  format: PdfExportFormat;
  pageIndexes?: readonly number[];
  scale?: number;
  quality?: number;
}

export interface PdfExportResult {
  name: string;
  data: Uint8Array;
  mimeType: string;
  sizeBytes: number;
}

export interface PdfTextExtractionOptions {
  pageIndexes?: readonly number[];
  includeCoordinates?: boolean;
}

export interface PdfTextItem {
  pageIndex: number;
  text: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type PdfDocumentAction =
  | { type: 'rotate'; pageIndexes: readonly number[]; rotation: PdfPageRotation }
  | { type: 'delete'; pageIndexes: readonly number[] }
  | { type: 'reorder'; order: readonly number[] }
  | { type: 'insertBlank'; afterPageIndex: number; count: number }
  | { type: 'setMetadata'; metadata: Partial<PdfMetadata> };

export type PdfEngineEvent = 'progress' | 'status' | 'error';

export interface PdfProgressEvent {
  jobId: string;
  loaded: number;
  total: number;
  percent: number;
}

export interface PdfStatusEvent {
  status: PdfEngineStatus;
}

export interface PdfErrorEvent {
  message: string;
  cause?: unknown;
}

export interface PdfEngineEventMap {
  progress: PdfProgressEvent;
  status: PdfStatusEvent;
  error: PdfErrorEvent;
}
