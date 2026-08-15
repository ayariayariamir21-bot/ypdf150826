import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, LinearProgress, ToggleField } from '@pdfplatform/ui';
import { usagePercent } from '@pdfplatform/entitlements';
import { DEMO_USAGE } from '@/lib/constants';
import { formatBytes } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useToastStore } from '@/stores/toastStore';
import { AppHeader } from '@/components/layout/AppHeader';

export function Settings(): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const tier = user?.tier ?? 'free';
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = React.useState(user?.name ?? '');
  const [email, setEmail] = React.useState(user?.email ?? '');

  const saveProfile = (): void => {
    showToast('success', 'Profile updated');
  };

  const storagePercent = usagePercent(tier, 'storage:mb', DEMO_USAGE.storageUsedMb);
  const documentsPercent = usagePercent(tier, 'documents:monthly', DEMO_USAGE.documentsUsed);
  const aiPercent = usagePercent(tier, 'ai:requests:monthly', DEMO_USAGE.aiRequestsUsed);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <Button onClick={saveProfile}>Save profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how the editor looks.</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleField
                id="dark-mode"
                label="Dark mode"
                description="Use a dark color scheme across the app."
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
              <CardDescription>Your current subscription.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium capitalize text-slate-900 dark:text-slate-100">{tier}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tier === 'free'
                    ? 'Free tier'
                    : tier === 'premium'
                      ? 'Premium tier'
                      : 'Exclusive tier'}
                </p>
              </div>
              {tier !== 'exclusive' ? (
                <Button variant="premium" onClick={() => navigate('/upgrade')}>
                  Upgrade
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your current limits for this billing period.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Storage</span>
                  <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {formatBytes(DEMO_USAGE.storageUsedMb * 1024 * 1024)} of{' '}
                    {formatBytes(DEMO_USAGE.storageTotalMb * 1024 * 1024)}
                  </span>
                </div>
                <LinearProgress value={storagePercent} ariaLabel="Storage used" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Documents</span>
                  <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {DEMO_USAGE.documentsUsed} of {DEMO_USAGE.documentsTotal}
                  </span>
                </div>
                <LinearProgress value={documentsPercent} ariaLabel="Documents used" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">AI requests</span>
                  <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                    {DEMO_USAGE.aiRequestsUsed} of {DEMO_USAGE.aiRequestsTotal}
                  </span>
                </div>
                <LinearProgress value={aiPercent} ariaLabel="AI requests used" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
