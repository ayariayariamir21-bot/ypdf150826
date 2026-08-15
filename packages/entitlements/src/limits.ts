import { TIER_MAP } from './tiers';
import {
  LIMIT_KEYS,
  QUOTA_KEYS,
  type ExportFormat,
  type LimitKey,
  type QuotaKey,
  type Tier,
} from './types';

export function getLimit(tier: Tier, limit: LimitKey): number {
  return TIER_MAP[tier].limits[limit] ?? 0;
}

export function getQuota(tier: Tier, quota: QuotaKey): number {
  return TIER_MAP[tier].quotas[quota] ?? 0;
}

export function maxPageCount(tier: Tier): number {
  return getLimit(tier, LIMIT_KEYS.MAX_PAGE_COUNT);
}

export function maxFileSizeBytes(tier: Tier): number {
  return getLimit(tier, LIMIT_KEYS.MAX_FILE_SIZE_MB) * 1024 * 1024;
}

export function maxBatchDocuments(tier: Tier): number {
  return getLimit(tier, LIMIT_KEYS.MAX_BATCH_DOCUMENTS);
}

export function allowedExportFormats(tier: Tier): readonly ExportFormat[] {
  return TIER_MAP[tier].allowedExportFormats;
}

export function canExportFormat(tier: Tier, format: ExportFormat): boolean {
  return TIER_MAP[tier].allowedExportFormats.includes(format);
}

export function exportFormatLimit(tier: Tier): number {
  return getLimit(tier, LIMIT_KEYS.EXPORT_FORMATS);
}

export function monthlyDocuments(tier: Tier): number {
  return getQuota(tier, QUOTA_KEYS.DOCUMENTS_MONTHLY);
}

export function monthlyAiRequests(tier: Tier): number {
  return getQuota(tier, QUOTA_KEYS.AI_REQUESTS_MONTHLY);
}

export function monthlyOcrPages(tier: Tier): number {
  return getQuota(tier, QUOTA_KEYS.OCR_PAGES_MONTHLY);
}

export function storageMb(tier: Tier): number {
  return getQuota(tier, QUOTA_KEYS.STORAGE_MB);
}

export function quotaRemaining(tier: Tier, quota: QuotaKey, used: number): number {
  return Math.max(0, getQuota(tier, quota) - used);
}

export function quotaExceeded(tier: Tier, quota: QuotaKey, used: number): boolean {
  return used > getQuota(tier, quota);
}

export function usagePercent(tier: Tier, quota: QuotaKey, used: number): number {
  const total = getQuota(tier, quota);
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}
