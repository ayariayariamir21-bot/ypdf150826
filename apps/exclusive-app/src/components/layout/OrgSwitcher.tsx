'use client';

import * as React from 'react';
import { IconBuilding2, IconCheck, IconChevronDown, IconChevronsUpDown } from '@/components/icons';
import { ENTERPRISE_BADGE, ORG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  tier: string;
}

const ORGANIZATIONS: readonly Organization[] = [
  { id: 'org-exclusive', name: 'Acme Enterprise', tier: ENTERPRISE_BADGE },
  { id: 'org-labs', name: 'Innovation Labs', tier: 'PRO' },
  { id: 'org-dev', name: 'Development', tier: 'FREE' },
];

const FALLBACK_ORG: Organization = { id: 'org-exclusive', name: 'Acme Enterprise', tier: ENTERPRISE_BADGE };

export function OrgSwitcher(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(ORG.id);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = ORGANIZATIONS.find((org) => org.id === selectedId) ?? FALLBACK_ORG;

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-md border border-dark-border bg-dark-bg px-2.5 text-sm transition-colors hover:border-dark-border-hover"
      >
        <IconBuilding2 size={14} className="text-slate-500" />
        <span className="max-w-36 truncate text-slate-200">{selected.name}</span>
        <IconChevronDown size={14} className={cn('text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Switch organization"
          className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-lg border border-dark-border bg-dark-bg-elevated shadow-float animate-scale-in"
        >
          <div className="border-b border-dark-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Organizations
          </div>
          <ul className="py-1">
            {ORGANIZATIONS.map((org) => {
              const isSelected = org.id === selectedId;
              return (
                <li key={org.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedId(org.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
                      isSelected ? 'bg-brand-600/15 text-brand-300' : 'text-slate-300 hover:bg-dark-bg-secondary'
                    )}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-dark-bg-secondary text-xs text-slate-400">
                      {org.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{org.name}</span>
                      <span className="block text-[11px] text-exclusive-500">{org.tier}</span>
                    </span>
                    {isSelected ? <IconCheck size={15} className="shrink-0 text-brand-400" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-dark-border px-3 py-2">
            <button type="button" className="btn-ghost h-8 w-full justify-start gap-2 text-xs">
              <IconChevronsUpDown size={13} />
              Create organization
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
