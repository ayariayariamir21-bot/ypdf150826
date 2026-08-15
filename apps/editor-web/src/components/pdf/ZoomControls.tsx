import * as React from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@pdfplatform/ui';
import { IconMaximize, IconMoveHorizontal, IconZoomIn, IconZoomOut } from '@/components/icons';
import { ZOOM_PERCENTAGES } from '@/lib/constants';
import { useZoom } from '@/hooks/useZoom';

export function ZoomControls(): React.ReactElement {
  const { scale, fitMode, zoomIn, zoomOut, zoomTo, fitWidth, fitPage } = useZoom();
  const percent = Math.round(scale * 100);

  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-elevated dark:border-slate-700 dark:bg-slate-900/95">
      <Button variant="ghost" size="icon-sm" onClick={zoomOut} aria-label="Zoom out">
        <IconZoomOut />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="min-w-14 rounded-md px-2 py-1 text-center text-xs font-medium tabular-nums text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {percent}%
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {ZOOM_PERCENTAGES.map((value) => (
            <DropdownMenuItem
              key={value}
              onSelect={() => {
                zoomTo(value / 100);
              }}
            >
              {value}%
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon-sm" onClick={zoomIn} aria-label="Zoom in">
        <IconZoomIn />
      </Button>
      <div className="mx-0.5 h-5 w-px bg-slate-200 dark:bg-slate-700" />
      <Button
        variant={fitMode === 'width' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={fitWidth}
        aria-label="Fit width"
        title="Fit width"
      >
        <IconMoveHorizontal />
      </Button>
      <Button
        variant={fitMode === 'page' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={fitPage}
        aria-label="Fit page"
        title="Fit page"
      >
        <IconMaximize />
      </Button>
    </div>
  );
}
