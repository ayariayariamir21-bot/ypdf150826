import {
  FEATURE_CATALOG,
  TIERS,
  getQuota,
  getTierDefinition,
  hasFeature,
  isTierAtLeast,
  minimumTierForFeature,
  quotaRemaining,
  type FeatureId,
  type LimitMap,
  type QuotaKey,
} from '@pdfplatform/entitlements';
import { capitalize } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export function useEntitlement() {
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');
  const definition = getTierDefinition(tier);

  const can = (feature: FeatureId): boolean => hasFeature(tier, feature);
  const isLocked = (feature: FeatureId): boolean => !can(feature);
  const remaining = (quota: QuotaKey, used = 0): number => quotaRemaining(tier, quota, used);
  const quotaOf = (quota: QuotaKey): number => getQuota(tier, quota);

  const upgradeMessage = (feature: FeatureId): string => {
    const requiredTier = minimumTierForFeature(feature);
    if (!requiredTier || isTierAtLeast(tier, requiredTier)) {
      return '';
    }
    const tierName = TIERS.find((item) => item.id === requiredTier)?.name ?? capitalize(requiredTier);
    const featureLabel =
      FEATURE_CATALOG.find((item) => item.id === feature)?.label ?? feature;
    return `${featureLabel} is available on the ${tierName} plan.`;
  };

  return {
    tier,
    features: definition.features,
    limits: definition.limits as LimitMap,
    can,
    isLocked,
    remaining,
    quotaOf,
    upgradeMessage,
  };
}
