'use client';

import * as React from 'react';
import {
  IconAlertTriangle,
  IconArchive,
  IconBell,
  IconCalendar,
  IconClock,
  IconDownload,
  IconFileOutput,
  IconGitBranch,
  IconLanguages,
  IconMail,
  IconPlug,
  IconScan,
  IconShield,
  IconSparkles,
  IconTag,
  IconUploadCloud,
  IconUserCheck,
  IconZap,
  type IconProps,
} from '@/components/icons';
import { NODE_STATE_LABELS, NODE_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { NodeKindId, NodeState, NodeTypeId, PipelineNode } from '@/types';

const NODE_WIDTH = 196;
export const NODE_HEIGHT = 92;

export const KIND_ICONS: Readonly<Record<NodeKindId, (props: IconProps) => React.ReactElement>> = {
  upload: IconUploadCloud,
  email: IconMail,
  schedule: IconCalendar,
  webhook: IconZap,
  ocr: IconScan,
  classify: IconTag,
  extract: IconFileOutput,
  redact: IconShield,
  translate: IconLanguages,
  summarize: IconSparkles,
  approval: IconUserCheck,
  condition: IconGitBranch,
  delay: IconClock,
  archive: IconArchive,
  notify: IconBell,
  export: IconDownload,
  'webhook-output': IconPlug,
  error: IconAlertTriangle,
};

const TYPE_ACCENT: Readonly<Record<NodeTypeId, string>> = {
  trigger: 'border-violet-500/40 text-violet-400',
  activity: 'border-brand-500/40 text-brand-400',
  gate: 'border-amber-500/40 text-amber-400',
  output: 'border-emerald-500/40 text-emerald-400',
  error: 'border-danger-500/40 text-danger-400',
};

const TYPE_BADGE: Readonly<Record<NodeTypeId, string>> = {
  trigger: 'bg-violet-500/10 text-violet-400',
  activity: 'bg-brand-500/10 text-brand-400',
  gate: 'bg-amber-500/10 text-amber-400',
  output: 'bg-emerald-500/10 text-emerald-400',
  error: 'bg-danger-500/10 text-danger-400',
};

const STATE_RING: Readonly<Record<NodeState, string>> = {
  idle: 'border-dark-border',
  running: 'border-brand-500',
  completed: 'border-success-500',
  failed: 'border-danger-500',
  paused: 'border-warning-500',
};

const STATE_DOT: Readonly<Record<NodeState, string>> = {
  idle: 'bg-slate-500',
  running: 'bg-brand-500',
  completed: 'bg-success-500',
  failed: 'bg-danger-500',
  paused: 'bg-warning-500',
};

interface NodeComponentProps {
  node: PipelineNode;
  selected: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>, node: PipelineNode) => void;
  onClick: (node: PipelineNode) => void;
  onOutputClick: (node: PipelineNode) => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>, node: PipelineNode) => void;
}

export function NodeComponent({
  node,
  selected,
  onPointerDown,
  onClick,
  onOutputClick,
  onContextMenu,
}: NodeComponentProps): React.ReactElement {
  const Icon = KIND_ICONS[node.kind];
  const connecting = node.state === 'running';

  return (
    <div
      role="button"
      tabIndex={0}
      data-node-id={node.id}
      onPointerDown={(event) => onPointerDown(event, node)}
      onClick={() => onClick(node)}
      onContextMenu={(event) => onContextMenu(event, node)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onClick(node);
        }
      }}
      className={cn(
        'group absolute cursor-grab select-none rounded-lg border bg-dark-bg-elevated shadow-card transition-shadow active:cursor-grabbing',
        STATE_RING[node.state],
        selected ? 'ring-2 ring-brand-500/70' : 'ring-0',
        node.state === 'failed' && 'shadow-[0_0_0_1px_rgba(220,38,38,0.4)]'
      )}
      style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH }}
    >
      <span
        className={cn(
          'absolute -top-[5px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ring-2 ring-dark-bg',
          STATE_DOT[node.state],
          connecting && 'animate-ping'
        )}
        aria-hidden="true"
      />
      <div className="flex items-center gap-2 border-b border-dark-border px-3 py-2.5">
        <span
          className={cn(
            'grid h-7 w-7 shrink-0 place-items-center rounded-md border',
            TYPE_ACCENT[node.type]
          )}
        >
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-100">{node.label}</p>
          <p className="text-[10px] text-slate-500">{NODE_TYPE_LABELS[node.type]}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
            TYPE_BADGE[node.type]
          )}
        >
          {NODE_STATE_LABELS[node.state]}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5">
        <p className="line-clamp-2 text-xs leading-4 text-slate-500">{node.description}</p>
      </div>

      <span className="absolute -left-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-dark-border bg-dark-bg" />
      <button
        type="button"
        title={node.type === 'output' || node.type === 'error' ? 'Input only' : 'Drag to connect'}
        aria-label={`Connect ${node.label} to another node`}
        onClick={(event) => {
          event.stopPropagation();
          onOutputClick(node);
        }}
        disabled={node.type === 'output' || node.type === 'error' || node.state === 'running'}
        className={cn(
          'absolute -right-[6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-dark-border bg-dark-bg transition-colors',
          node.type === 'output' || node.type === 'error'
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-crosshair group-hover:border-brand-500 group-hover:bg-brand-500'
        )}
      />
    </div>
  );
}

export { NODE_WIDTH };
