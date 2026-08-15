'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  IconBell,
  IconLogOut,
  IconMenu,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
  IconUsers,
  type IconProps,
} from '@/components/icons';
import { ENTERPRISE_BADGE } from '@/lib/constants';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { OrgSwitcher } from './OrgSwitcher';
import { SearchBar } from './SearchBar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/documents': 'Documents',
  '/pipelines': 'Pipelines',
  '/models': 'Models',
  '/audit': 'Audit Trail',
  '/settings': 'Settings',
};

export function TopNav(): React.ReactElement {
  const pathname = usePathname();
  const { isDark, toggle } = useDarkMode();
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const [userOpen, setUserOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const userRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const title = PAGE_TITLES[pathname] ?? 'Overview';

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent): void {
      const target = event.target as Node;
      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-dark-border bg-dark-bg px-4">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="btn-ghost h-9 w-9 p-0 lg:hidden"
        aria-label="Open navigation"
      >
        <IconMenu size={18} />
      </button>

      <h1 className="hidden text-sm font-semibold text-slate-100 sm:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <SearchBar />
        </div>

        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((value) => !value)}
            className="btn-ghost relative h-9 w-9 p-0"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <IconBell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-500 ring-2 ring-dark-bg" />
          </button>
          {notifOpen ? (
            <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-dark-border bg-dark-bg-elevated shadow-float animate-scale-in">
              <div className="flex items-center justify-between border-b border-dark-border px-3 py-2">
                <span className="text-xs font-semibold text-slate-200">Notifications</span>
                <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-[10px] font-medium text-brand-300">
                  3 new
                </span>
              </div>
              <ul className="divide-y divide-dark-border">
                {NOTIFICATIONS.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className="flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-dark-bg-secondary"
                    >
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', notification.dot)} />
                      <span>
                        <span className="block text-sm text-slate-200">{notification.title}</span>
                        <span className="block text-xs text-slate-500">{notification.time}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={toggle}
          className="btn-ghost h-9 w-9 p-0"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>

        <OrgSwitcher />

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-dark-bg-secondary"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-exclusive-600 text-xs font-bold text-white">
              AB
            </span>
          </button>
          {userOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-dark-border bg-dark-bg-elevated shadow-float animate-scale-in"
            >
              <div className="flex items-center gap-3 border-b border-dark-border px-3 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-exclusive-600 text-sm font-bold text-white">
                  AB
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">Amir Benali</p>
                  <p className="truncate text-[11px] text-slate-500">amir.benali@acme.com</p>
                </div>
              </div>
              <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-exclusive-500">
                {ENTERPRISE_BADGE} · Billing admin
              </div>
              <ul className="py-1">
                <li>
                  <UserMenuItem label="Profile" icon={IconUser} />
                </li>
                <li>
                  <UserMenuItem label="Team" icon={IconUsers} />
                </li>
                <li>
                  <UserMenuItem label="Settings" icon={IconSettings} />
                </li>
              </ul>
              <div className="border-t border-dark-border py-1">
                <UserMenuItem label="Sign out" icon={IconLogOut} danger />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

interface UserMenuItemProps {
  label: string;
  icon: (props: IconProps) => React.ReactElement;
  danger?: boolean;
}

function UserMenuItem({ label, icon: Icon, danger }: UserMenuItemProps): React.ReactElement {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
        danger
          ? 'text-danger-500 hover:bg-danger-500/10'
          : 'text-slate-300 hover:bg-dark-bg-secondary hover:text-slate-100'
      )}
    >
      <Icon size={15} className="shrink-0" />
      {label}
    </button>
  );
}

const NOTIFICATIONS = [
  { id: 'n1', title: 'Master Intake processed 24 documents', time: '3 minutes ago', dot: 'bg-success-500' },
  { id: 'n2', title: 'Approval required for 3 documents', time: '12 minutes ago', dot: 'bg-warning-500' },
  { id: 'n3', title: 'Model field-extractor v7 deployed', time: '28 minutes ago', dot: 'bg-brand-500' },
];
