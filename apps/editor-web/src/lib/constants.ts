import type { PdfExportFormat } from '@pdfplatform/pdf-engine-core';
import type { Collaborator, UsageSummary } from '@/types';

export const APP_NAME = 'PDF Studio';

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 4;
export const FIT_PADDING = 48;

export const BLANK_PAGE_WIDTH = 595;
export const BLANK_PAGE_HEIGHT = 842;

export const MAX_HISTORY = 100;

export const ZOOM_PERCENTAGES: readonly number[] = [50, 75, 100, 125, 150, 200, 300, 400];

export const SUPPORTED_EXPORT_FORMATS: readonly PdfExportFormat[] = ['pdf', 'png', 'jpeg', 'txt'];

export const EXPORT_FORMAT_LABELS: Readonly<Record<PdfExportFormat, string>> = {
  pdf: 'PDF',
  png: 'PNG',
  jpeg: 'JPEG',
  txt: 'Plain Text',
};

export const ANNOTATION_COLORS: readonly string[] = [
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
];

export const DEMO_COLLABORATORS: readonly Collaborator[] = [
  {
    id: 'u-1',
    name: 'Alice Martin',
    email: 'alice@example.com',
    avatarUrl: null,
    role: 'editor',
    status: 'active',
    lastActiveAt: new Date('2026-08-10T09:24:00Z'),
  },
  {
    id: 'u-2',
    name: 'Bruno Silva',
    email: 'bruno@example.com',
    avatarUrl: null,
    role: 'viewer',
    status: 'active',
    lastActiveAt: new Date('2026-08-12T14:05:00Z'),
  },
  {
    id: 'u-3',
    name: 'Claire Dubois',
    email: 'claire@example.com',
    avatarUrl: null,
    role: 'owner',
    status: 'active',
    lastActiveAt: new Date('2026-08-13T18:41:00Z'),
  },
  {
    id: 'u-4',
    name: 'David Chen',
    email: 'david@example.com',
    avatarUrl: null,
    role: 'editor',
    status: 'invited',
    lastActiveAt: new Date('2026-08-11T11:30:00Z'),
  },
];

export const DEMO_USAGE: UsageSummary = {
  documentsUsed: 143,
  documentsTotal: 500,
  storageUsedMb: 612,
  storageTotalMb: 5120,
  aiRequestsUsed: 517,
  aiRequestsTotal: 2000,
};
