import * as React from 'react';
import { PipelinesWorkspace } from '@/components/pipelines/PipelinesWorkspace';

export default function PipelinesPage(): React.ReactElement {
  return (
    <React.Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-500">Loading pipelines…</div>}>
      <PipelinesWorkspace />
    </React.Suspense>
  );
}
