import { useState } from 'react';
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
  IconCrown,
  IconHome,
  IconLogOut,
  IconMenu,
  IconMessageSquare,
  IconMoon,
  IconPanelLeft,
  IconPanelRight,
  IconSettings,
  IconShare,
  IconSparkles,
  IconSun,
} from '@/components/icons';
import { APP_NAME } from '@/lib/constants';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useAnnotations } from '@/hooks/useAnnotations';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useToastStore } from '@/stores/toastStore';
import { PdfCanvas } from '@/components/pdf/PdfCanvas';
import { ZoomControls } from '@/components/pdf/ZoomControls';
import { PageNavigation } from '@/components/pdf/PageNavigation';
import { AiChatPanel } from '@/components/ai/AiChatPanel';
import { RemoteCursors } from '@/components/collaboration/RemoteCursors';
import { Toolbar } from './Toolbar';
import { SidebarLeft } from './SidebarLeft';
import { SidebarRight } from './SidebarRight';
import { StatusBar } from './StatusBar';
import { MobileNav } from './MobileNav';

export function EditorLayout(): React.ReactElement {
  const navigate = useNavigate();
  const { document } = usePdfDocument();
  const [chatOpen, setChatOpen] = useState(false);
  const collaboration = useCollaboration();
  useAnnotations();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const leftSidebarOpen = useUiStore((state) => state.leftSidebarOpen);
  const toggleLeftSidebar = useUiStore((state) => state.toggleLeftSidebar);
  const rightSidebarOpen = useUiStore((state) => state.rightSidebarOpen);
  const toggleRightSidebar = useUiStore((state) => state.toggleRightSidebar);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const showToast = useToastStore((state) => state.showToast);

  const initials =
    user?.name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2) ?? 'GU';

  const shareDocument = (): void => {
    if (document) {
      showToast('info', 'Sharing is available on the Premium plan');
      navigate('/upgrade');
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="lg:hidden"
        >
          <IconMenu />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleLeftSidebar}
          aria-label="Toggle pages sidebar"
          aria-pressed={leftSidebarOpen}
        >
          <IconPanelLeft />
        </Button>
        <button
          type="button"
          className="flex items-center gap-2 px-1"
          onClick={() => navigate('/')}
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
            P
          </span>
          <span className="hidden text-sm font-semibold text-slate-900 dark:text-slate-100 sm:inline">
            {APP_NAME}
          </span>
        </button>
        <div className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
          {document?.name ?? 'Editor'}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setChatOpen((open) => !open)}
            aria-label="Toggle AI assistant"
            aria-pressed={chatOpen}
            title="Ask AI about this document"
          >
            <IconMessageSquare />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleRightSidebar}
            aria-label="Toggle info sidebar"
            aria-pressed={rightSidebarOpen}
          >
            <IconPanelRight />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </Button>
          <Button variant="outline" size="sm" onClick={shareDocument} className="hidden sm:inline-flex">
            <IconShare />
            Share
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
                  <Badge variant={user.tier === 'free' ? 'slate' : user.tier === 'premium' ? 'premium' : 'exclusive'}>
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
              ) : null}
              {user && user.tier === 'exclusive' ? (
                <DropdownMenuItem disabled>
                  <IconCrown />
                  Exclusive
                </DropdownMenuItem>
              ) : null}
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
      <Toolbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {leftSidebarOpen ? <SidebarLeft /> : null}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <PdfCanvas />
          <RemoteCursors users={collaboration.users} isConnected={collaboration.isConnected} />
          {chatOpen ? (
            <div className="absolute inset-y-0 right-0 z-40">
              <AiChatPanel onClose={() => setChatOpen(false)} />
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center">
            <ZoomControls />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 z-10">
            <PageNavigation />
          </div>
        </div>
        {rightSidebarOpen ? <SidebarRight /> : null}
      </div>
      <StatusBar />
      <MobileNav />
    </div>
  );
}
