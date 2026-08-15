import * as React from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface NormalizedStroke {
  bbox: { x: number; y: number; w: number; h: number };
  content: string;
}

function serializePoints(points: readonly Point[]): string {
  return points.map((point) => `${point.x.toFixed(4)},${point.y.toFixed(4)}`).join(' ');
}

export function normalizeStroke(points: readonly Point[]): NormalizedStroke {
  if (points.length === 0) {
    return { bbox: { x: 0, y: 0, w: 0.01, h: 0.01 }, content: '' };
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  const width = Math.max(maxX - minX, 0.001);
  const height = Math.max(maxY - minY, 0.001);
  const relative = points.map((point) => ({
    x: (point.x - minX) / width,
    y: (point.y - minY) / height,
  }));
  return {
    bbox: { x: minX, y: minY, w: width, h: height },
    content: serializePoints(relative),
  };
}

export function buildPathData(content: string): string {
  const segments = content.trim().split(/\s+/);
  if (segments.length === 0) {
    return '';
  }
  return segments
    .map((segment, index) => {
      const [rawX, rawY] = segment.split(',');
      const x = (Number(rawX ?? 0) * 100).toFixed(2);
      const y = (Number(rawY ?? 0) * 100).toFixed(2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

interface DrawingCanvasProps {
  content: string;
  color: string;
  strokeWidth?: number;
}

export function DrawingCanvas({
  content,
  color,
  strokeWidth = 2,
}: DrawingCanvasProps): React.ReactElement {
  const path = buildPathData(content);
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      {path ? (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}
