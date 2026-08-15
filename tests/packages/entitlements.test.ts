import { describe, expect, it } from 'vitest';
import {
  EntitlementError,
  EXPORT_FORMATS_BY_TIER,
  FEATURES,
  LIMIT_KEYS,
  QUOTA_KEYS,
  TIERS,
  allowedExportFormats,
  assertFeatureAccess,
  canAccess,
  canBatchExport,
  canExport,
  canExportFormat,
  canUpload,
  canUseApi,
  exportFormatLimit,
  getQuota,
  hasFeature,
  hasQuotaRemaining,
  isAiFeature,
  isTierAtLeast,
  maxBatchDocuments,
  maxFileSizeBytes,
  maxPageCount,
  minimumTierForFeature,
  monthlyAiRequests,
  quotaExceeded,
  quotaRemaining,
  tierRank,
  usagePercent,
  withinQuota,
} from '@pdfplatform/entitlements';

describe('tiers', () => {
  it('defines exactly the three tiers in order', () => {
    expect(TIERS.map((tier) => tier.id)).toEqual(['free', 'premium', 'exclusive']);
  });

  it('increases prices, quotas and limits across tiers', () => {
    const prices = TIERS.map((tier) => tier.priceMonthlyCents);
    expect(prices[0]).toBeLessThan(prices[1] as number);
    expect(prices[1]).toBeLessThan(prices[2] as number);

    const documents = TIERS.map((tier) => tier.quotas[QUOTA_KEYS.DOCUMENTS_MONTHLY] ?? 0);
    const pages = TIERS.map((tier) => tier.limits[LIMIT_KEYS.MAX_PAGE_COUNT] ?? 0);
    expect(documents[0]).toBeLessThan(documents[1] as number);
    expect(documents[1]).toBeLessThan(documents[2] as number);
    expect(pages[0]).toBeLessThan(pages[1] as number);
    expect(pages[1]).toBeLessThan(pages[2] as number);
  });

  it('only marks premium and exclusive as highlighted', () => {
    expect(TIERS.find((tier) => tier.id === 'free')?.highlighted).toBe(false);
    expect(TIERS.find((tier) => tier.id === 'premium')?.highlighted).toBe(true);
    expect(TIERS.find((tier) => tier.id === 'exclusive')?.highlighted).toBe(true);
  });
});

describe('limits', () => {
  it('returns file size limits in bytes', () => {
    expect(maxFileSizeBytes('free')).toBe(25 * 1024 * 1024);
    expect(maxFileSizeBytes('premium')).toBe(100 * 1024 * 1024);
    expect(maxFileSizeBytes('exclusive')).toBe(250 * 1024 * 1024);
  });

  it('returns batch and page limits', () => {
    expect(maxBatchDocuments('free')).toBe(1);
    expect(maxBatchDocuments('premium')).toBe(10);
    expect(maxBatchDocuments('exclusive')).toBe(50);
    expect(maxPageCount('exclusive')).toBe(2000);
  });

  it('computes quota helpers', () => {
    expect(monthlyAiRequests('premium')).toBe(2000);
    expect(quotaRemaining('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 12)).toBe(38);
    expect(quotaRemaining('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 9999)).toBe(0);
    expect(quotaExceeded('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 51)).toBe(true);
    expect(withinQuota('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 50)).toBe(true);
    expect(hasQuotaRemaining('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 50)).toBe(false);
    expect(usagePercent('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 25)).toBe(50);
    expect(usagePercent('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 5000)).toBe(100);
    expect(usagePercent('free', QUOTA_KEYS.AI_REQUESTS_MONTHLY, 0)).toBe(0);
  });
});

describe('export formats', () => {
  it('scopes formats by tier', () => {
    expect(EXPORT_FORMATS_BY_TIER.free).toEqual(['pdf']);
    expect(EXPORT_FORMATS_BY_TIER.premium).toEqual(['pdf', 'png', 'jpeg', 'txt']);
    expect(EXPORT_FORMATS_BY_TIER.exclusive).toHaveLength(6);
  });

  it('guards format access', () => {
    expect(canExportFormat('free', 'png')).toBe(false);
    expect(canExport('premium', 'txt')).toBe(true);
    expect(allowedExportFormats('exclusive')).toContain('docx');
    expect(exportFormatLimit('free')).toBe(1);
    expect(getQuota('premium', QUOTA_KEYS.STORAGE_MB)).toBe(5120);
  });
});

describe('guards', () => {
  it('resolves feature availability per tier', () => {
    expect(hasFeature('free', FEATURES.AI_EDIT)).toBe(true);
    expect(hasFeature('free', FEATURES.COLLABORATION)).toBe(false);
    expect(hasFeature('premium', FEATURES.COLLABORATION)).toBe(true);
    expect(hasFeature('premium', FEATURES.API_ACCESS)).toBe(false);
    expect(hasFeature('exclusive', FEATURES.API_ACCESS)).toBe(true);
    expect(canAccess('exclusive', FEATURES.ADVANCED_ANALYTICS)).toBe(true);
    expect(canBatchExport('premium')).toBe(true);
    expect(canBatchExport('free')).toBe(false);
    expect(canUseApi('exclusive')).toBe(true);
    expect(canUseApi('premium')).toBe(false);
  });

  it('computes the minimum tier for a feature', () => {
    expect(minimumTierForFeature(FEATURES.AI_EDIT)).toBe('free');
    expect(minimumTierForFeature(FEATURES.COLLABORATION)).toBe('premium');
    expect(minimumTierForFeature(FEATURES.API_ACCESS)).toBe('exclusive');
    expect(isTierAtLeast('premium', 'free')).toBe(true);
    expect(isTierAtLeast('free', 'premium')).toBe(false);
    expect(tierRank('exclusive')).toBe(2);
  });

  it('classifies AI features', () => {
    expect(isAiFeature(FEATURES.AI_SUMMARIZE)).toBe(true);
    expect(isAiFeature(FEATURES.OCR)).toBe(false);
  });

  it('guards uploads by size', () => {
    expect(canUpload('free', 25 * 1024 * 1024)).toBe(true);
    expect(canUpload('free', 25 * 1024 * 1024 + 1)).toBe(false);
    expect(canUpload('exclusive', 200 * 1024 * 1024)).toBe(true);
  });

  it('throws a typed error when access is denied', () => {
    expect(() => assertFeatureAccess('free', FEATURES.API_ACCESS)).toThrow(EntitlementError);
    try {
      assertFeatureAccess('free', FEATURES.API_ACCESS);
    } catch (cause) {
      expect(cause).toBeInstanceOf(EntitlementError);
      const error = cause as EntitlementError;
      expect(error.tier).toBe('free');
      expect(error.feature).toBe(FEATURES.API_ACCESS);
      expect(error.requiredTier).toBe('exclusive');
      expect(error.message).toContain('not available');
    }
    expect(() => assertFeatureAccess('exclusive', FEATURES.API_ACCESS)).not.toThrow();
  });
});
