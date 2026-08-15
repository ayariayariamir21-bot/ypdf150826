'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconChevronLeft,
  IconChevronsUpDown,
  IconCpu,
  IconFolder,
  IconGitBranch,
  IconLayoutDashboard,
  IconScrollText,
  IconSettings,
  IconSparkles,
  IconX,
  type IconProps,
} from '@/components/icons';
import { APP_NAME, ENTERPRISE_BADGE, NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';

const NAV_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  dashboard: IconLayoutDashboard,
  documents: IconFolder,
  pipelines: IconGitBranch,
  models: IconCpu,
  audit: IconScrollText,
  settings: IconSettings,
};

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-dark-border bg-dark-bg-secondary transition-[width,transform] duration-200 lg:static lg:z-auto',
        collapsed ? 'w-[68px]' : 'w-60',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2 overflow-hidden text-slate-100',
            collapsed && 'lg:justify-center'
          )}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-600 text-white">
            <IconSparkles size={16} />
          </span>
          {!collapsed ? (
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight">{APP_NAME}</span>
          ) : null}
        </Link>
        {mobileNavOpen ? (
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="btn-ghost h-8 w-8 p-0 lg:hidden"
            aria-label="Close navigation"
          >
            <IconX size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            className="btn-ghost hidden h-8 w-8 p-0 lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.icon] ?? IconLayoutDashboard;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
                collapsed && 'lg:justify-center lg:px-0',
                active
                  ? 'bg-brand-600/15 text-brand-300'
                  : 'text-slate-400 hover:bg-dark-bg-elevated hover:text-slate-200'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-dark-border p-3">
        {!collapsed ? (
          <div className="rounded-lg border border-dark-border bg-dark-bg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Usage</span>
              <span className="text-brand-300">94%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dark-bg-elevated">
              <div className="h-full w-[94%] rounded-full bg-brand-500" />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">Tokens · 46.2M / 49.1M</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-md px-1 py-1">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-exclusive-600 text-xs font-bold text-white">
            AB
          </span>
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">Amir Benali</p>
                <p className="truncate text-[11px] text-exclusive-500">{ENTERPRISE_BADGE}</p>
              </div>
              <button type="button" className="btn-ghost h-7 w-7 p-0" aria-label="Account menu">
                <IconChevronsUpDown size={14} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
