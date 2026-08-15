import * as React from 'react';
import type { Annotation } from '@/types';

interface HighlightOverlayProps {
  annotation: Annotation;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function HighlightOverlay({
  annotation,
  left,
  top,
  width,
  height,
}: HighlightOverlayProps): React.ReactElement {
  const color = annotation.color ?? '#f59e0b';

  if (annotation.type === 'underline') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left, top, width, height, borderBottom: `3px solid ${color}` }}
      />
    );
  }

  if (annotation.type === 'strike') {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left,
          top: top + height / 2 - 1,
          width,
          height: 3,
          backgroundColor: color,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-[2px]"
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: `${color}66`,
        borderLeft: `3px solid ${color}`,
      }}
    />
  );
}
