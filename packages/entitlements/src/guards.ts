import { canExportFormat, maxFileSizeBytes, quotaExceeded, quotaRemaining } from './limits';
import { TIERS, TIER_MAP } from './tiers';
import { FEATURES, type ExportFormat, type FeatureId, type QuotaKey, type Tier } from './types';

export class EntitlementError extends Error {
  readonly tier: Tier;
  readonly feature: FeatureId;
  readonly requiredTier: Tier | null;

  constructor(tier: Tier, feature: FeatureId, requiredTier: Tier | null) {
    super(`Feature "${feature}" is not available on the "${tier}" tier.`);
    this.name = 'EntitlementError';
    this.tier = tier;
    this.feature = feature;
    this.requiredTier = requiredTier;
  }
}

export function hasFeature(tier: Tier, feature: FeatureId): boolean {
  return TIER_MAP[tier].features.includes(feature);
}

export function canAccess(tier: Tier, feature: FeatureId): boolean {
  return hasFeature(tier, feature);
}

export function tierRank(tier: Tier): number {
  return TIER_MAP[tier].sortOrder;
}

export function isTierAtLeast(tier: Tier, minimum: Tier): boolean {
  return tierRank(tier) >= tierRank(minimum);
}

export function minimumTierForFeature(feature: FeatureId): Tier | null {
  const eligible = TIERS.filter((definition) => definition.features.includes(feature)).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  return eligible[0]?.id ?? null;
}

export function isAiFeature(feature: FeatureId): boolean {
  return feature.startsWith('ai:');
}

export function canRunAiCapability(tier: Tier, feature: FeatureId): boolean {
  return isAiFeature(feature) && hasFeature(tier, feature);
}

export function canBatchExport(tier: Tier): boolean {
  return hasFeature(tier, FEATURES.BATCH_EXPORT);
}

export function canUseApi(tier: Tier): boolean {
  return hasFeature(tier, FEATURES.API_ACCESS);
}

export function canUpload(tier: Tier, sizeBytes: number): boolean {
  return sizeBytes <= maxFileSizeBytes(tier);
}

export function canExport(tier: Tier, format: ExportFormat): boolean {
  return canExportFormat(tier, format);
}

export function withinQuota(tier: Tier, quota: QuotaKey, used: number): boolean {
  return !quotaExceeded(tier, quota, used);
}

export function hasQuotaRemaining(tier: Tier, quota: QuotaKey, used: number): boolean {
  return quotaRemaining(tier, quota, used) > 0;
}

export function assertFeatureAccess(tier: Tier, feature: FeatureId): void {
  if (!hasFeature(tier, feature)) {
    throw new EntitlementError(tier, feature, minimumTierForFeature(feature));
  }
}
