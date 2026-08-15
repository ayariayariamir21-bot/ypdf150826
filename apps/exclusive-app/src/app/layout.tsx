import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { Shell } from '@/components/layout/Shell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PDF AI · Enterprise Console',
    template: '%s · PDF AI',
  },
  description: 'Enterprise document intelligence console for the Exclusive tier.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-dark-bg text-slate-200 antialiased">
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
