'use client';

import * as React from 'react';
import { useUiStore } from '@/stores/uiStore';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function Shell({ children }: { children: React.ReactNode }): React.ReactElement {
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
