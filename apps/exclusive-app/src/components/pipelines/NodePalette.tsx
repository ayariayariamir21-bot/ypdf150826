'use client';

import * as React from 'react';
import { NODE_PALETTE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { NodeKindId, NodeTypeId } from '@/types';
import { KIND_ICONS } from './NodeComponent';

export const NODE_DRAG_MIME = 'application/x-node-type';

export function nodeDragPayload(kind: NodeKindId, type: NodeTypeId): string {
  return `${kind}:${type}`;
}

export function parseNodeDragPayload(payload: string): { kind: NodeKindId; type: NodeTypeId } | null {
  const [kind, type] = payload.split(':');
  if (kind && type && kind in KIND_ICONS) {
    return { kind: kind as NodeKindId, type: type as NodeTypeId };
  }
  return null;
}

export function NodePalette(): React.ReactElement {
  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-dark-border bg-dark-bg-secondary">
      <div className="sticky top-0 z-10 border-b border-dark-border bg-dark-bg-secondary px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Node Library</p>
        <p className="mt-0.5 text-[11px] text-slate-500">Drag a node onto the canvas</p>
      </div>
      <div className="space-y-4 p-3">
        {NODE_PALETTE.map((category) => (
          <div key={category.id}>
            <p className="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {category.label}
            </p>
            <ul className="space-y-1">
              {category.items.map((item) => {
                const Icon = KIND_ICONS[item.id];
                return (
                  <li key={item.id}>
                    <div
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          NODE_DRAG_MIME,
                          nodeDragPayload(item.id, item.type)
                        );
                        event.dataTransfer.effectAllowed = 'copy';
                      }}
                      className={cn(
                        'flex cursor-grab items-center gap-2.5 rounded-md border border-dark-border bg-dark-bg px-2.5 py-2 transition-colors hover:border-brand-500/60 hover:bg-dark-bg-elevated'
                      )}
                      title={item.description}
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-md border',
                          item.type === 'trigger' && 'border-violet-500/40 text-violet-400',
                          item.type === 'activity' && 'border-brand-500/40 text-brand-400',
                          item.type === 'gate' && 'border-amber-500/40 text-amber-400',
                          item.type === 'output' && 'border-emerald-500/40 text-emerald-400'
                        )}
                      >
                        <Icon size={13} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-200">{item.label}</p>
                        <p className="truncate text-[10px] text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
