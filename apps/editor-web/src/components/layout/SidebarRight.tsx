import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  LinearProgress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@pdfplatform/ui';
import { usagePercent } from '@pdfplatform/entitlements';
import {
  IconCheckCircle,
  IconClock,
  IconCopy,
  IconFileText,
  IconTrash,
} from '@/components/icons';
import { DEMO_COLLABORATORS, DEMO_USAGE } from '@/lib/constants';
import { capitalize, formatBytes, formatDate } from '@/lib/utils';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useAnnotationsByPage } from '@/hooks/useAnnotations';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useAuthStore } from '@/stores/authStore';
import { useEditorStore } from '@/stores/editorStore';
import { useToastStore } from '@/stores/toastStore';

export function SidebarRight(): React.ReactElement {
  const { document } = usePdfDocument();
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');
  const currentPage = useEditorStore((state) => state.currentPage);
  const annotations = useAnnotationsByPage(currentPage);
  const removeAnnotation = useAnnotationsStore((state) => state.removeAnnotation);
  const showToast = useToastStore((state) => state.showToast);

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Share link copied to clipboard');
    } catch {
      showToast('error', 'Could not copy the link');
    }
  };

  const storagePercent = usagePercent(tier, 'storage:mb', DEMO_USAGE.storageUsedMb);
  const documentsPercent = usagePercent(tier, 'documents:monthly', DEMO_USAGE.documentsUsed);

  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:flex">
      <Tabs defaultValue="info" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-slate-200 px-3 pt-3 dark:border-slate-800">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              Info
            </TabsTrigger>
            <TabsTrigger value="annotations" className="flex-1">
              Annotations
            </TabsTrigger>
            <TabsTrigger value="share" className="flex-1">
              Share
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="info" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                <IconFileText />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {document?.name ?? 'Untitled'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {document ? `${formatBytes(document.sizeBytes)}` : 'No document'}
                </p>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Pages</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  {document?.pageCount ?? 0}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">File size</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                  {document ? formatBytes(document.sizeBytes) : '—'}
                </dd>
              </div>
            </dl>
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Storage used</span>
                <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                  {storagePercent}%
                </span>
              </div>
              <LinearProgress value={storagePercent} ariaLabel="Storage used" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Documents this month</span>
                <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                  {documentsPercent}%
                </span>
              </div>
              <LinearProgress value={documentsPercent} ariaLabel="Documents used" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="annotations" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {annotations && annotations.length > 0 ? (
            <ul className="space-y-2">
              {annotations.map((annotation) => (
                <li
                  key={annotation.id}
                  className="flex items-center gap-3 rounded-md border border-slate-200 p-2.5 dark:border-slate-800"
                >
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: annotation.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
                      {capitalize(annotation.type)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(new Date(annotation.createdAt))}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      removeAnnotation(annotation.id);
                    }}
                    aria-label="Delete annotation"
                  >
                    <IconTrash />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <IconCheckCircle className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No annotations on this page yet.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Pick a highlight tool and drag over the page.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="share" className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Collaborators
              </p>
              <AvatarGroup
                items={DEMO_COLLABORATORS.map((collaborator) => ({
                  alt: collaborator.name,
                  initials: collaborator.name
                    .split(' ')
                    .map((part) => part.charAt(0))
                    .join('')
                    .slice(0, 2),
                  src: collaborator.avatarUrl ?? undefined,
                }))}
                max={5}
                size="sm"
              />
            </div>
            <ul className="space-y-3">
              {DEMO_COLLABORATORS.map((collaborator) => (
                <li key={collaborator.id} className="flex items-center gap-3">
                  <Avatar
                    alt={collaborator.name}
                    initials={collaborator.name
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .join('')
                      .slice(0, 2)}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {collaborator.name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      <IconClock />
                      {formatDate(collaborator.lastActiveAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      collaborator.status === 'active' ? 'success' : 'slate'
                    }
                  >
                    {collaborator.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="w-full" onClick={() => void copyLink()}>
              <IconCopy />
              Copy share link
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
