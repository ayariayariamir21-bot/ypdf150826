import {
  EXPORT_FORMAT_IDS,
  FEATURES,
  LIMIT_KEYS,
  QUOTA_KEYS,
  type ExportFormat,
  type FeatureDescription,
  type Tier,
  type TierDefinition,
} from './types';

export const FEATURE_CATALOG: readonly FeatureDescription[] = [
  {
    id: FEATURES.AI_EDIT,
    label: 'AI Editing',
    description: 'Rewrite, rephrase and fix PDF content with AI.',
  },
  {
    id: FEATURES.AI_SUMMARIZE,
    label: 'AI Summaries',
    description: 'Generate concise summaries of documents.',
  },
  {
    id: FEATURES.AI_TRANSLATE,
    label: 'AI Translation',
    description: 'Translate documents across languages.',
  },
  {
    id: FEATURES.AI_PROOFREAD,
    label: 'AI Proofreading',
    description: 'Detect typos and grammar issues automatically.',
  },
  {
    id: FEATURES.OCR,
    label: 'OCR',
    description: 'Extract text from scanned pages.',
  },
  {
    id: FEATURES.BATCH_EXPORT,
    label: 'Batch Export',
    description: 'Export multiple documents in one pass.',
  },
  {
    id: FEATURES.DIGITAL_SIGNATURE,
    label: 'Digital Signatures',
    description: 'Sign documents electronically.',
  },
  {
    id: FEATURES.CUSTOM_WATERMARK,
    label: 'Custom Watermarks',
    description: 'Apply your own watermarks and branding.',
  },
  {
    id: FEATURES.COLLABORATION,
    label: 'Collaboration',
    description: 'Share and co-edit documents in real time.',
  },
  {
    id: FEATURES.PRIORITY_PROCESSING,
    label: 'Priority Processing',
    description: 'Skip the queue with dedicated compute.',
  },
  {
    id: FEATURES.API_ACCESS,
    label: 'API Access',
    description: 'Drive the platform programmatically.',
  },
  {
    id: FEATURES.EXCLUSIVE_ASSETS,
    label: 'Exclusive Assets',
    description: 'Premium templates and brand kits.',
  },
  {
    id: FEATURES.EARLY_ACCESS,
    label: 'Early Access',
    description: 'Be first to use new features.',
  },
  {
    id: FEATURES.ADVANCED_ANALYTICS,
    label: 'Advanced Analytics',
    description: 'Deep insights into document usage.',
  },
];

export const EXPORT_FORMATS_BY_TIER: Readonly<Record<Tier, readonly ExportFormat[]>> = {
  free: ['pdf'],
  premium: ['pdf', 'png', 'jpeg', 'txt'],
  exclusive: EXPORT_FORMAT_IDS,
};

export const TIERS: readonly TierDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Essential tools for everyday PDF tasks.',
    priceMonthlyCents: 0,
    highlighted: false,
    sortOrder: 0,
    features: [FEATURES.AI_EDIT, FEATURES.OCR],
    quotas: {
      [QUOTA_KEYS.DOCUMENTS_MONTHLY]: 20,
      [QUOTA_KEYS.AI_REQUESTS_MONTHLY]: 50,
      [QUOTA_KEYS.OCR_PAGES_MONTHLY]: 10,
      [QUOTA_KEYS.STORAGE_MB]: 512,
    },
    limits: {
      [LIMIT_KEYS.MAX_PAGE_COUNT]: 50,
      [LIMIT_KEYS.MAX_FILE_SIZE_MB]: 25,
      [LIMIT_KEYS.MAX_BATCH_DOCUMENTS]: 1,
      [LIMIT_KEYS.EXPORT_FORMATS]: 1,
    },
    allowedExportFormats: EXPORT_FORMATS_BY_TIER.free,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Serious PDF tools for professionals.',
    priceMonthlyCents: 1299,
    highlighted: true,
    sortOrder: 1,
    features: [
      FEATURES.AI_EDIT,
      FEATURES.AI_SUMMARIZE,
      FEATURES.AI_TRANSLATE,
      FEATURES.AI_PROOFREAD,
      FEATURES.OCR,
      FEATURES.BATCH_EXPORT,
      FEATURES.DIGITAL_SIGNATURE,
      FEATURES.CUSTOM_WATERMARK,
      FEATURES.COLLABORATION,
      FEATURES.PRIORITY_PROCESSING,
    ],
    quotas: {
      [QUOTA_KEYS.DOCUMENTS_MONTHLY]: 500,
      [QUOTA_KEYS.AI_REQUESTS_MONTHLY]: 2000,
      [QUOTA_KEYS.OCR_PAGES_MONTHLY]: 500,
      [QUOTA_KEYS.STORAGE_MB]: 5120,
    },
    limits: {
      [LIMIT_KEYS.MAX_PAGE_COUNT]: 300,
      [LIMIT_KEYS.MAX_FILE_SIZE_MB]: 100,
      [LIMIT_KEYS.MAX_BATCH_DOCUMENTS]: 10,
      [LIMIT_KEYS.EXPORT_FORMATS]: 4,
    },
    allowedExportFormats: EXPORT_FORMATS_BY_TIER.premium,
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    tagline: 'The complete suite. Built for power users.',
    priceMonthlyCents: 2999,
    highlighted: true,
    sortOrder: 2,
    features: [
      FEATURES.AI_EDIT,
      FEATURES.AI_SUMMARIZE,
      FEATURES.AI_TRANSLATE,
      FEATURES.AI_PROOFREAD,
      FEATURES.OCR,
      FEATURES.BATCH_EXPORT,
      FEATURES.DIGITAL_SIGNATURE,
      FEATURES.CUSTOM_WATERMARK,
      FEATURES.COLLABORATION,
      FEATURES.PRIORITY_PROCESSING,
      FEATURES.API_ACCESS,
      FEATURES.EXCLUSIVE_ASSETS,
      FEATURES.EARLY_ACCESS,
      FEATURES.ADVANCED_ANALYTICS,
    ],
    quotas: {
      [QUOTA_KEYS.DOCUMENTS_MONTHLY]: 5000,
      [QUOTA_KEYS.AI_REQUESTS_MONTHLY]: 20000,
      [QUOTA_KEYS.OCR_PAGES_MONTHLY]: 5000,
      [QUOTA_KEYS.STORAGE_MB]: 51200,
    },
    limits: {
      [LIMIT_KEYS.MAX_PAGE_COUNT]: 2000,
      [LIMIT_KEYS.MAX_FILE_SIZE_MB]: 250,
      [LIMIT_KEYS.MAX_BATCH_DOCUMENTS]: 50,
      [LIMIT_KEYS.EXPORT_FORMATS]: 6,
    },
    allowedExportFormats: EXPORT_FORMATS_BY_TIER.exclusive,
  },
];

export const TIER_MAP: Readonly<Record<Tier, TierDefinition>> = Object.freeze(
  TIERS.reduce(
    (acc, tier) => {
      acc[tier.id] = tier;
      return acc;
    },
    {} as Record<Tier, TierDefinition>
  )
);

export function getTierDefinition(tier: Tier): TierDefinition {
  return TIER_MAP[tier];
}
