'use client';

import * as React from 'react';
import { NODE_HEIGHT, NODE_WIDTH } from './NodeComponent';
import type { PipelineEdge, PipelineNode } from '@/types';

interface ConnectionLineProps {
  edge?: PipelineEdge;
  from?: PipelineNode;
  to?: PipelineNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  interactive?: boolean;
}

function toPath(start: { x: number; y: number }, end: { x: number; y: number }): string {
  const distance = Math.max(40, Math.abs(end.x - start.x) * 0.5);
  return [
    `M ${start.x} ${start.y}`,
    `C ${start.x + distance} ${start.y}, ${end.x - distance} ${end.y}, ${end.x} ${end.y}`,
  ].join(' ');
}

export function ConnectionLine({
  edge,
  from,
  to,
  start,
  end,
  interactive = false,
}: ConnectionLineProps): React.ReactElement | null {
  let path: string | null = null;

  if (edge && from && to) {
    path = toPath(
      { x: from.position.x + NODE_WIDTH, y: from.position.y + NODE_HEIGHT / 2 },
      { x: to.position.x, y: to.position.y + NODE_HEIGHT / 2 }
    );
  } else if (start && end) {
    path = toPath(start, end);
  }

  if (!path) {
    return null;
  }

  return (
    <path
      d={path}
      fill="none"
      stroke={interactive ? '#6366f1' : '#3f3f5f'}
      strokeWidth={interactive ? 1.5 : 2}
      strokeDasharray={interactive ? '6 4' : undefined}
      className={interactive ? 'animate-[indeterminate_0.8s_linear_infinite]' : undefined}
      pointerEvents="none"
    />
  );
}
