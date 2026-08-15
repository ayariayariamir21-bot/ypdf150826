import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@pdfplatform/ui';
import { FEATURE_CATALOG, TIERS, type FeatureId, type Tier } from '@pdfplatform/entitlements';
import { IconBadgeCheck, IconCheck, IconCrown, type IconProps } from '@/components/icons';
import { cn, formatPriceCents } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { AppHeader } from '@/components/layout/AppHeader';

const FEATURE_LABELS: ReadonlyMap<FeatureId, string> = new Map(
  FEATURE_CATALOG.map((feature) => [feature.id, feature.label])
);

const TIER_ICONS: Readonly<Record<Tier, React.ComponentType<IconProps>>> = {
  free: IconBadgeCheck,
  premium: IconBadgeCheck,
  exclusive: IconCrown,
};

const TIER_BUTTON_VARIANT: Readonly<Record<Tier, 'secondary' | 'premium' | 'exclusive'>> = {
  free: 'secondary',
  premium: 'premium',
  exclusive: 'exclusive',
};

export function UpgradePage(): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const upgrade = useAuthStore((state) => state.upgrade);
  const showToast = useToastStore((state) => state.showToast);
  const currentTier = user?.tier ?? 'free';

  const choosePlan = (tier: Tier): void => {
    upgrade(tier);
    showToast('success', `You are now on the ${TIERS.find((item) => item.id === tier)?.name ?? tier} plan`);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader showBack />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Upgrade your plan
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Unlock more pages, exports and advanced tools.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[...TIERS]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((tier) => {
              const Icon = TIER_ICONS[tier.id];
              const isCurrent = tier.id === currentTier;
              const isLocked = tier.sortOrder < (TIERS.find((item) => item.id === currentTier)?.sortOrder ?? 0);
              return (
                <Card
                  key={tier.id}
                  className={cn(
                    'flex flex-col',
                    tier.highlighted && 'ring-2 ring-brand-500'
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={tier.id === 'exclusive' ? 'text-exclusive-600 dark:text-exclusive-400' : 'text-brand-600 dark:text-brand-400'} />
                      {isCurrent ? <Badge variant="slate">Current plan</Badge> : null}
                    </div>
                    <CardTitle className="capitalize">{tier.name}</CardTitle>
                    <CardDescription>{tier.tagline}</CardDescription>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                      {formatPriceCents(tier.priceMonthlyCents)}
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                        {' '}
                        / month
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="mb-6 flex-1 space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <IconCheck className="mt-0.5 shrink-0 text-success-500" />
                          {FEATURE_LABELS.get(feature) ?? feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={TIER_BUTTON_VARIANT[tier.id]}
                      disabled={isCurrent || isLocked}
                      onClick={() => {
                        if (!isLocked && !isCurrent) {
                          choosePlan(tier.id);
                        }
                      }}
                    >
                      {isCurrent ? 'Current plan' : isLocked ? 'Included in your plan' : `Choose ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </main>
    </div>
  );
}
