export interface PdfRecentDocument {
  id: string;
  name: string;
  sizeBytes: number;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
}
