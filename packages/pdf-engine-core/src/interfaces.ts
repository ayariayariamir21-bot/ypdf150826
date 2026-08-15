import type {
  PdfDocumentAction,
  PdfDocumentId,
  PdfDocumentInfo,
  PdfEngineEvent,
  PdfEngineEventMap,
  PdfEngineId,
  PdfExportOptions,
  PdfExportResult,
  PdfPageInfo,
  PdfRenderOptions,
  PdfRenderResult,
  PdfSource,
  PdfTextExtractionOptions,
  PdfTextItem,
} from './types';

export interface PdfEngineInitOptions {
  workerUrl?: string;
  maxRenderScale?: number;
  useWasm?: boolean;
}

export type PdfEngineListener<E extends PdfEngineEvent> = (payload: PdfEngineEventMap[E]) => void;

export interface PdfEngine {
  readonly id: PdfEngineId;
  readonly name: string;
  readonly version: string;

  load(source: PdfSource, name?: string): Promise<PdfDocumentInfo>;
  close(documentId: PdfDocumentId): Promise<void>;

  getDocumentInfo(documentId: PdfDocumentId): Promise<PdfDocumentInfo>;
  listPages(documentId: PdfDocumentId): Promise<readonly PdfPageInfo[]>;

  renderPage(
    documentId: PdfDocumentId,
    pageIndex: number,
    options: PdfRenderOptions
  ): Promise<PdfRenderResult>;

  exportDocument(documentId: PdfDocumentId, options: PdfExportOptions): Promise<PdfExportResult>;

  extractText(
    documentId: PdfDocumentId,
    options?: PdfTextExtractionOptions
  ): Promise<readonly PdfTextItem[]>;

  applyAction(documentId: PdfDocumentId, action: PdfDocumentAction): Promise<PdfDocumentInfo>;

  splitDocument(
    documentId: PdfDocumentId,
    pageIndexes: readonly number[]
  ): Promise<readonly PdfDocumentId[]>;

  mergeDocuments(documentIds: readonly PdfDocumentId[]): Promise<PdfDocumentId>;

  on<E extends PdfEngineEvent>(event: E, listener: PdfEngineListener<E>): () => void;
}

export interface PdfEngineFactory {
  readonly id: PdfEngineId;
  readonly name: string;
  create(options?: PdfEngineInitOptions): Promise<PdfEngine>;
}
