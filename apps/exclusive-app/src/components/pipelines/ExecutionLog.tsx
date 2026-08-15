'use client';

import * as React from 'react';
import { IconX, type IconProps } from '@/components/icons';
import { useWorkflowStore } from '@/stores/workflowStore';
import { cn, formatTime } from '@/lib/utils';
import type { ExecutionLogLevel } from '@/types';

const LEVEL_STYLES: Readonly<Record<ExecutionLogLevel, { dot: string; text: string; icon?: (props: IconProps) => React.ReactElement }>> = {
  info: { dot: 'bg-brand-500', text: 'text-slate-300' },
  success: { dot: 'bg-success-500', text: 'text-slate-300' },
  warning: { dot: 'bg-warning-500', text: 'text-slate-300' },
  error: { dot: 'bg-danger-500', text: 'text-danger-400' },
};

interface ExecutionLogProps {
  onClose: () => void;
}

export function ExecutionLog({ onClose }: ExecutionLogProps): React.ReactElement {
  const log = useWorkflowStore((state) => state.log);
  const clearLog = useWorkflowStore((state) => state.clearLog);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [log.length]);

  return (
    <div className="flex h-44 shrink-0 flex-col border-t border-dark-border bg-dark-bg-secondary">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-dark-border px-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Execution Log
          </span>
          <span className="rounded-full bg-dark-bg-elevated px-1.5 py-0.5 text-[10px] text-slate-400">
            {log.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {log.length > 0 ? (
            <button type="button" onClick={clearLog} className="btn-ghost h-7 px-2 text-[11px]">
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost h-7 w-7 p-0"
            aria-label="Close execution log"
          >
            <IconX size={13} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs">
        {log.length === 0 ? (
          <p className="py-2 text-slate-600">
            No activity yet — press <span className="text-slate-400">Run</span> to execute the
            pipeline.
          </p>
        ) : (
          <ul className="space-y-1">
            {log.map((entry) => {
              const style = LEVEL_STYLES[entry.level];
              return (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className={cn('mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} />
                  <span className="shrink-0 text-slate-600">{formatTime(entry.timestamp)}</span>
                  <span className={cn('min-w-0 break-words', style.text)}>{entry.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
