'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconGitBranch,
  IconPlus,
  IconScrollText,
  IconUploadCloud,
  IconUsers,
  type IconProps,
} from '@/components/icons';

interface QuickAction {
  label: string;
  description: string;
  icon: (props: IconProps) => React.ReactElement;
  href: string;
}

const ACTIONS: readonly QuickAction[] = [
  {
    label: 'Upload documents',
    description: 'Add files for processing',
    icon: IconUploadCloud,
    href: '/documents',
  },
  {
    label: 'New pipeline',
    description: 'Design an automation',
    icon: IconGitBranch,
    href: '/pipelines',
  },
  {
    label: 'Review audit trail',
    description: 'Inspect recent activity',
    icon: IconScrollText,
    href: '/audit',
  },
  {
    label: 'Invite member',
    description: 'Grant workspace access',
    icon: IconUsers,
    href: '/settings',
  },
];

export function QuickActions(): React.ReactElement {
  const router = useRouter();

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-dark-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Quick Actions</h2>
          <p className="mt-0.5 text-xs text-slate-500">Shortcuts for common tasks</p>
        </div>
        <IconPlus size={16} className="text-slate-500" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              onClick={() => router.push(action.href)}
              className="group flex flex-col items-start gap-3 rounded-lg border border-dark-border bg-dark-bg p-4 text-left transition-colors hover:border-brand-500/60 hover:bg-dark-bg-elevated"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600/15 text-brand-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-200">{action.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{action.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
