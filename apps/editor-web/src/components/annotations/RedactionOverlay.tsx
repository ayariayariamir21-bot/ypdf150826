import * as React from 'react';
import type { Annotation } from '@/types';

interface RedactionOverlayProps {
  annotation: Annotation;
  left: number;
  top: number;
  width: number;
  height: number;
  locked?: boolean;
}

const VISUAL_ONLY_TITLE =
  'Visual redaction only - the underlying text is not removed from the file';

export function RedactionOverlay({
  annotation,
  left,
  top,
  width,
  height,
  locked = false,
}: RedactionOverlayProps): React.ReactElement {
  const label = annotation.content?.trim() || 'Redacted';

  if (locked) {
    return (
      <div
        role="img"
        aria-label="Redaction locked"
        title={VISUAL_ONLY_TITLE}
        className="absolute flex items-center justify-center rounded-[2px] border-2 border-dashed border-danger-500/70 bg-black/5"
        style={{ left, top, width, height }}
      >
        <span className="text-base leading-none">🔒</span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Redacted: ${label}`}
      title={VISUAL_ONLY_TITLE}
      className="absolute flex items-center justify-center overflow-hidden rounded-[2px] bg-slate-950"
      style={{ left, top, width, height, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
    >
      <span className="max-h-full max-w-full overflow-hidden px-1 text-center text-[10px] font-medium uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}
