import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button } from '@pdfplatform/ui';
import { APP_NAME } from '@/lib/constants';
import {
  IconHome,
  IconLogOut,
  IconMoon,
  IconSettings,
  IconSparkles,
  IconSun,
  IconX,
} from '@/components/icons';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export function MobileNav(): React.ReactElement | null {
  const navigate = useNavigate();
  const open = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!open) {
    return null;
  }

  const go = (path: string): void => {
    setMobileNavOpen(false);
    navigate(path);
  };

  const items = [
    { label: 'Home', icon: IconHome, path: '/' },
    { label: 'Settings', icon: IconSettings, path: '/settings' },
    { label: 'Upgrade', icon: IconSparkles, path: '/upgrade' },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        onClick={() => setMobileNavOpen(false)}
      />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-float dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{APP_NAME}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <IconX />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon />
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          {user ? (
            <div className="mb-2 flex items-center gap-3">
              <Avatar
                alt={user.name}
                initials={user.name
                  .split(' ')
                  .map((part) => part.charAt(0))
                  .join('')
                  .slice(0, 2)}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setMobileNavOpen(false);
              logout();
              navigate('/');
            }}
          >
            <IconLogOut />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
