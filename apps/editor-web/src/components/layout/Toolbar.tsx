import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES, hasFeature, isTierAtLeast, type ExportFormat } from '@pdfplatform/entitlements';
import type { PdfExportFormat } from '@pdfplatform/pdf-engine-core';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Tooltip,
} from '@pdfplatform/ui';
import {
  IconCheck,
  IconDownload,
  IconHand,
  IconHighlighter,
  IconLock,
  IconMousePointer,
  IconPencil,
  IconRedo,
  IconShield,
  IconSignature,
  IconStamp,
  IconStickyNote,
  IconStrikethrough,
  IconType,
  IconUnderline,
  IconUndo,
  type IconProps,
} from '@/components/icons';
import { EXPORT_FORMAT_LABELS, SUPPORTED_EXPORT_FORMATS } from '@/lib/constants';
import { canExportFormat } from '@pdfplatform/entitlements';
import { exportActiveDocument } from '@/lib/pdfLib';
import { errorMessage } from '@/lib/utils';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useAuthStore } from '@/stores/authStore';
import { useEditorStore, type ToolId } from '@/stores/editorStore';
import { useToastStore } from '@/stores/toastStore';

interface ToolDefinition {
  id: ToolId;
  label: string;
  shortcut: string;
  Icon: React.ComponentType<IconProps>;
}

const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'V', Icon: IconMousePointer },
  { id: 'pan', label: 'Pan', shortcut: 'H', Icon: IconHand },
  { id: 'text', label: 'Text', shortcut: 'T', Icon: IconType },
  { id: 'highlight', label: 'Highlight', shortcut: 'A', Icon: IconHighlighter },
  { id: 'underline', label: 'Underline', shortcut: 'U', Icon: IconUnderline },
  { id: 'strike', label: 'Strike', shortcut: 'K', Icon: IconStrikethrough },
  { id: 'note', label: 'Note', shortcut: 'N', Icon: IconStickyNote },
  { id: 'draw', label: 'Draw', shortcut: 'D', Icon: IconPencil },
  { id: 'sign', label: 'Sign', shortcut: 'Y', Icon: IconSignature },
  { id: 'stamp', label: 'Stamp', shortcut: 'B', Icon: IconStamp },
  { id: 'redaction', label: 'Redact (visual only)', shortcut: 'R', Icon: IconShield },
];

export function Toolbar(): React.ReactElement {
  const navigate = useNavigate();
  const tool = useEditorStore((state) => state.tool);
  const setTool = useEditorStore((state) => state.setTool);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const annotationsCanUndo = useAnnotationsStore((state) => state.canUndo);
  const annotationsCanRedo = useAnnotationsStore((state) => state.canRedo);
  const annotationsUndo = useAnnotationsStore((state) => state.undo);
  const annotationsRedo = useAnnotationsStore((state) => state.redo);
  const annotations = useAnnotationsStore((state) => state.annotations);
  const { document } = usePdfDocument();
  const tier = useAuthStore((state) => state.user?.tier ?? 'free');
  const showToast = useToastStore((state) => state.showToast);
  const [exporting, setExporting] = React.useState(false);

  const handleUndo = (): void => {
    if (annotationsCanUndo) {
      annotationsUndo();
    } else {
      undo();
    }
  };

  const handleRedo = (): void => {
    if (annotationsCanRedo) {
      annotationsRedo();
    } else {
      redo();
    }
  };

  React.useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        if (key === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (key === 'y') {
          event.preventDefault();
          handleRedo();
        }
        return;
      }
      const match = TOOLS.find(
        (definition) => definition.shortcut.toLowerCase() === event.key.toLowerCase()
      );
      if (match) {
        event.preventDefault();
        setTool(match.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const signAvailable = hasFeature(tier, FEATURES.DIGITAL_SIGNATURE);
  const redactionAvailable = isTierAtLeast(tier, 'premium');
  const availableFormats = SUPPORTED_EXPORT_FORMATS.filter((format) =>
    canExportFormat(tier, format as ExportFormat)
  ) as PdfExportFormat[];

  const runExport = async (format: PdfExportFormat): Promise<void> => {
    setExporting(true);
    try {
      await exportActiveDocument(format, annotations);
      showToast('success', `Exported as ${EXPORT_FORMAT_LABELS[format]}`);
    } catch (cause) {
      showToast('error', errorMessage(cause));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ id, label, shortcut, Icon }) => {
          const locked = (id === 'sign' && !signAvailable) || (id === 'redaction' && !redactionAvailable);
          const active = tool === id;
          return (
            <Tooltip key={id} content={`${label} (${shortcut})`}>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => {
                  if (locked) {
                    navigate('/upgrade');
                  } else {
                    setTool(id);
                  }
                }}
                aria-label={label}
                aria-pressed={active}
                className={locked ? 'relative' : undefined}
              >
                <Icon />
                {locked ? <IconLock size={10} className="absolute -right-0.5 -top-0.5" /> : null}
              </Button>
            </Tooltip>
          );
        })}
      </div>
      <div className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-800" />
      <Tooltip content="Undo (Ctrl+Z)">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleUndo}
          disabled={!annotationsCanUndo && !canUndo}
          aria-label="Undo"
        >
          <IconUndo />
        </Button>
      </Tooltip>
      <Tooltip content="Redo (Ctrl+Shift+Z)">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRedo}
          disabled={!annotationsCanRedo && !canRedo}
          aria-label="Redo"
        >
          <IconRedo />
        </Button>
      </Tooltip>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!document || exporting}
              loading={exporting}
            >
              <IconDownload />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export as</DropdownMenuLabel>
            {availableFormats.map((format) => (
              <DropdownMenuItem
                key={format}
                onSelect={() => {
                  void runExport(format);
                }}
              >
                {EXPORT_FORMAT_LABELS[format]}
                {format === 'pdf' ? <IconCheck className="ml-auto" /> : null}
              </DropdownMenuItem>
            ))}
            {availableFormats.length === 0 ? (
              <DropdownMenuItem disabled>No formats available on your plan</DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
