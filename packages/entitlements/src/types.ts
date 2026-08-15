export const TIER_IDS = ['free', 'premium', 'exclusive'] as const;
export type Tier = (typeof TIER_IDS)[number];

export const FEATURES = {
  AI_EDIT: 'ai:edit',
  AI_SUMMARIZE: 'ai:summarize',
  AI_TRANSLATE: 'ai:translate',
  AI_PROOFREAD: 'ai:proofread',
  OCR: 'ocr',
  BATCH_EXPORT: 'batch:export',
  DIGITAL_SIGNATURE: 'digital:signature',
  CUSTOM_WATERMARK: 'watermark:custom',
  COLLABORATION: 'collaboration',
  PRIORITY_PROCESSING: 'priority:processing',
  API_ACCESS: 'api:access',
  EXCLUSIVE_ASSETS: 'exclusive:assets',
  EARLY_ACCESS: 'early:access',
  ADVANCED_ANALYTICS: 'advanced:analytics',
} as const;

export type FeatureId = (typeof FEATURES)[keyof typeof FEATURES];

export const QUOTA_KEYS = {
  DOCUMENTS_MONTHLY: 'documents:monthly',
  AI_REQUESTS_MONTHLY: 'ai:requests:monthly',
  OCR_PAGES_MONTHLY: 'ocr:pages:monthly',
  STORAGE_MB: 'storage:mb',
} as const;

export type QuotaKey = (typeof QUOTA_KEYS)[keyof typeof QUOTA_KEYS];

export const LIMIT_KEYS = {
  MAX_PAGE_COUNT: 'pages:max',
  MAX_FILE_SIZE_MB: 'file:size:mb',
  MAX_BATCH_DOCUMENTS: 'batch:documents',
  EXPORT_FORMATS: 'export:formats',
} as const;

export type LimitKey = (typeof LIMIT_KEYS)[keyof typeof LIMIT_KEYS];

export const EXPORT_FORMAT_IDS = ['pdf', 'png', 'jpeg', 'txt', 'docx', 'pptx'] as const;
export type ExportFormat = (typeof EXPORT_FORMAT_IDS)[number];

export type QuotaMap = Partial<Record<QuotaKey, number>>;
export type LimitMap = Partial<Record<LimitKey, number>>;

export interface TierDefinition {
  id: Tier;
  name: string;
  tagline: string;
  priceMonthlyCents: number;
  highlighted: boolean;
  sortOrder: number;
  features: readonly FeatureId[];
  quotas: QuotaMap;
  limits: LimitMap;
  allowedExportFormats: readonly ExportFormat[];
}

export interface FeatureDescription {
  id: FeatureId;
  label: string;
  description: string;
}
