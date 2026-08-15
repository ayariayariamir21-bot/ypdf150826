import { ThumbnailStrip } from '@/components/pdf/ThumbnailStrip';

export function SidebarLeft(): React.ReactElement {
  return (
    <aside className="hidden w-56 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pages</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ThumbnailStrip />
      </div>
    </aside>
  );
}
