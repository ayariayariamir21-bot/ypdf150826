import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from '@pdfplatform/ui';
import { IconCheck, IconStickyNote, IconTrash, IconX } from '@/components/icons';
import type { Annotation } from '@/types';

interface NotePinProps {
  annotation: Annotation;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (content: string) => void;
  onRemove: () => void;
  pinLeft: number;
  pinTop: number;
}

function computePopoverPosition(
  anchor: DOMRect,
  width: number,
): { left: number; top: number; placement: 'below' | 'above' } {
  const gap = 8;
  const padding = 8;
  const below = anchor.bottom + gap;
  const placement: 'below' | 'above' = below + 220 <= window.innerHeight - padding ? 'below' : 'above';
  const top = placement === 'below' ? below : Math.max(padding, anchor.top - gap - 220);
  const left = Math.min(Math.max(padding, anchor.left - width / 2), window.innerWidth - width - padding);
  return { left, top, placement };
}

interface NoteEditorProps {
  annotation: Annotation;
  onSave: (content: string) => void;
  onClose: () => void;
  onRemove: () => void;
}

function NoteEditor({
  annotation,
  onSave,
  onClose,
  onRemove,
}: NoteEditorProps): React.ReactElement {
  const [draft, setDraft] = React.useState(annotation.content ?? '');

  const submit = (): void => {
    onSave(draft);
  };

  return (
    <div className="w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <IconStickyNote size={14} />
          Note
        </span>
        <Button size="icon-sm" variant="ghost" aria-label="Delete note" onClick={onRemove}>
          <IconTrash />
        </Button>
      </div>
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
        rows={3}
        placeholder="Write a note…"
        aria-label="Note content"
        className="w-full resize-none rounded-md border border-slate-200 bg-white p-2 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onClose}>
          <IconX size={14} />
          Cancel
        </Button>
        <Button size="sm" onClick={submit}>
          <IconCheck size={14} />
          Save
        </Button>
      </div>
    </div>
  );
}

export function NotePin({
  annotation,
  selected,
  onSelect,
  onUpdate,
  onRemove,
  pinLeft,
  pinTop,
}: NotePinProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ left: number; top: number } | null>(null);
  const pinRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const update = (): void => {
      const rect = pinRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition(computePopoverPosition(rect, 256));
      }
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const toggle = (): void => {
    onSelect();
    setOpen((current) => !current);
  };

  return (
    <>
      <div
        ref={pinRef}
        role="button"
        tabIndex={0}
        aria-label={
          annotation.content ? `Note annotation: ${annotation.content}` : 'Note annotation'
        }
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            toggle();
          }
        }}
        className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer ${selected ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
        style={{ left: pinLeft, top: pinTop }}
      >
        <div
          className="flex size-6 items-center justify-center rounded-[4px] text-white shadow-sm"
          style={{ backgroundColor: annotation.color ?? '#4f46e5' }}
        >
          <IconStickyNote size={14} />
          <span className="absolute right-0 top-0 size-2 rounded-bl-[4px] bg-white/70" />
        </div>
      </div>
      {open && position
        ? ReactDOM.createPortal(
            <div className="fixed z-50" style={position}>
              <NoteEditor
                annotation={annotation}
                onSave={(content) => {
                  onUpdate(content);
                  setOpen(false);
                }}
                onClose={() => setOpen(false)}
                onRemove={() => {
                  onRemove();
                  setOpen(false);
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
