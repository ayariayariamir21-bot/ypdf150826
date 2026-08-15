import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@pdfplatform/ui';
import {
  IconChevronLeft,
  IconCrown,
  IconHome,
  IconLogOut,
  IconMoon,
  IconSettings,
  IconSparkles,
  IconSun,
} from '@/components/icons';
import { APP_NAME } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

interface AppHeaderProps {
  showBack?: boolean;
}

export function AppHeader({ showBack = false }: AppHeaderProps): React.ReactElement {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  const initials =
    user?.name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2) ?? 'GU';

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      {showBack ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          <IconChevronLeft />
        </Button>
      ) : null}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-1"
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
          P
        </span>
        <span className="hidden text-sm font-semibold text-slate-900 dark:text-slate-100 sm:inline">
          {APP_NAME}
        </span>
      </button>
      <div className="ml-auto flex items-center gap-2">
        {user && user.tier !== 'exclusive' ? (
          <Button variant="premium" size="sm" onClick={() => navigate('/upgrade')}>
            <IconSparkles />
            <span className="hidden sm:inline">Upgrade</span>
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full transition-opacity hover:opacity-80"
              aria-label="Account menu"
            >
              <Avatar alt={user?.name ?? 'Guest'} initials={initials} size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-2">
              {user?.name ?? 'Guest'}
              {user ? (
                <Badge
                  variant={
                    user.tier === 'free' ? 'slate' : user.tier === 'premium' ? 'premium' : 'exclusive'
                  }
                >
                  {user.tier === 'free' ? 'Free' : user.tier === 'premium' ? 'Premium' : 'Exclusive'}
                </Badge>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')}>
              <IconHome />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <IconSettings />
              Settings
            </DropdownMenuItem>
            {user && user.tier !== 'exclusive' ? (
              <DropdownMenuItem onClick={() => navigate('/upgrade')}>
                <IconSparkles />
                Upgrade plan
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>
                <IconCrown />
                Exclusive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <IconLogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
