import * as React from 'react';
import { IconFileText } from '@/components/icons';
import type { AiChatSource } from '@/lib/aiClient';

interface SourcesListProps {
  sources: readonly AiChatSource[];
  onNavigate: (page: number) => void;
}

export function SourcesList({ sources, onNavigate }: SourcesListProps): React.ReactElement | null {
  if (sources.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Sources
      </p>
      <ul className="space-y-1">
        {sources.map((source) => (
          <li key={`${source.page}-${source.text.slice(0, 24)}`}>
            <button
              type="button"
              onClick={() => onNavigate(source.page)}
              className="group flex w-full items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-700 dark:hover:bg-slate-800"
            >
              <IconFileText
                size={14}
                className="mt-0.5 shrink-0 text-slate-400 group-hover:text-brand-500 dark:text-slate-500"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Page {source.page}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {source.text}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {Math.round(source.score ?? 0)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
