'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCommand,
  IconCornerDownLeft,
  IconCpu,
  IconFolder,
  IconGitBranch,
  IconLayoutDashboard,
  IconScrollText,
  IconSearch,
  IconSettings,
  IconX,
  type IconProps,
} from '@/components/icons';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const NAV_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  dashboard: IconLayoutDashboard,
  documents: IconFolder,
  pipelines: IconGitBranch,
  models: IconCpu,
  audit: IconScrollText,
  settings: IconSettings,
};

export function SearchBar(): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return NAV_ITEMS;
    }
    return NAV_ITEMS.filter(
      (item) => item.label.toLowerCase().includes(normalized) || item.href.includes(normalized)
    );
  }, [query]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function navigate(href: string): void {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % Math.max(results.length, 1));
      return;
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      navigate(results[activeIndex].href);
    }
  }

  return (
    <div className="relative w-72">
      <IconSearch
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search anything…"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results"
        className="input h-9 w-full pl-9 pr-14"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-dark-border bg-dark-bg px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
        <IconCommand size={10} />
        K
      </kbd>

      {open ? (
        <div
          id="search-results"
          role="listbox"
          className="absolute right-0 top-11 z-50 w-full overflow-hidden rounded-lg border border-dark-border bg-dark-bg-elevated shadow-float animate-fade-in"
        >
          <div className="border-b border-dark-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Go to
          </div>
          {results.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((item, index) => {
                const Icon = NAV_ICONS[item.icon] ?? IconLayoutDashboard;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
                        index === activeIndex ? 'bg-brand-600/15 text-brand-300' : 'text-slate-300'
                      )}
                    >
                      <Icon size={15} className="shrink-0 text-slate-500" />
                      <span className="flex-1">{item.label}</span>
                      <IconCornerDownLeft
                        size={12}
                        className={cn('text-slate-600', index === activeIndex ? 'opacity-100' : 'opacity-0')}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate-500">No results found</div>
          )}
          <div className="flex items-center justify-between border-t border-dark-border px-3 py-1.5">
            <span className="text-[11px] text-slate-500">
              Use <kbd className="rounded border border-dark-border px-1">↑↓</kbd> to navigate
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost h-6 px-1.5 text-[11px]"
              aria-label="Close search"
            >
              <IconX size={11} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
