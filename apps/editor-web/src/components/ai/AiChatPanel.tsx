import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@pdfplatform/ui';
import type { PdfEngine, PdfTextItem } from '@pdfplatform/pdf-engine-core';
import { ChatInput } from './ChatInput';
import { ChatMessage, SuggestedPrompts } from './SuggestedPrompts';
import { IconAlert, IconBot, IconLock, IconTrash, IconX } from '@/components/icons';
import { useAiChat } from '@/hooks/useAiChat';
import { getActiveEngine, getPdfLibSnapshot } from '@/lib/pdfLib';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useEditorStore } from '@/stores/editorStore';

interface AiChatPanelProps {
  onClose: () => void;
}

async function highlightSourceInPage(
  engine: PdfEngine,
  documentId: string,
  pageIndex: number,
  sourceText: string
): Promise<void> {
  const pages = await engine.listPages(documentId);
  const page = pages[pageIndex];
  if (!page) {
    return;
  }
  const items = await engine.extractText(documentId, { pageIndexes: [pageIndex] });
  const needle = sourceText.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 40);
  if (needle.length === 0) {
    return;
  }
  const needlePrefix = needle.slice(0, 20);
  const positioned = items.filter(
    (item): item is PdfTextItem & { x: number; y: number; width: number; height: number } =>
      item.pageIndex === pageIndex &&
      item.x !== undefined &&
      item.y !== undefined &&
      item.width !== undefined &&
      item.height !== undefined
  );
  let cumulative = '';
  let startIndex = -1;
  let endIndex = -1;
  for (let index = 0; index < positioned.length; index += 1) {
    const item = positioned[index];
    if (!item) {
      continue;
    }
    cumulative += item.text + ' ';
    const normalized = cumulative.replace(/\s+/g, ' ').toLowerCase();
    if (startIndex === -1 && normalized.includes(needlePrefix)) {
      startIndex = index;
    }
    if (startIndex !== -1 && normalized.length >= needle.length) {
      endIndex = index;
      break;
    }
  }
  if (startIndex === -1 || endIndex === -1) {
    return;
  }
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let index = startIndex; index <= endIndex; index += 1) {
    const item = positioned[index];
    if (!item) {
      continue;
    }
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.width);
    maxY = Math.max(maxY, item.y + item.height);
  }
  if (!Number.isFinite(minX)) {
    return;
  }
  useAnnotationsStore.getState().addAnnotation({
    type: 'highlight',
    page: pageIndex,
    bbox: {
      x: minX / page.widthPt,
      y: minY / page.heightPt,
      w: (maxX - minX) / page.widthPt,
      h: (maxY - minY) / page.heightPt,
    },
    color: '#3b82f6',
  });
}

export function AiChatPanel({ onClose }: AiChatPanelProps): React.ReactElement {
  const navigate = useNavigate();
  const chat = useAiChat();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const last = chat.messages[chat.messages.length - 1];
    if (last && (last.role === 'user' || last.content.length > 0)) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chat.messages, chat.isStreaming]);

  const navigateToSource = (pageNumber: number, sourceText: string): void => {
    const pageIndex = pageNumber - 1;
    useEditorStore.getState().requestScrollToPage(pageIndex);
    const engine = getActiveEngine();
    const document = getPdfLibSnapshot().document;
    if (!engine || !document) {
      return;
    }
    void highlightSourceInPage(engine, document.documentId, pageIndex, sourceText);
  };

  const usedPercent = chat.quotaTotal > 0 ? chat.quotaUsed / chat.quotaTotal : 0;
  const quotaDanger = usedPercent >= 0.9;
  const quotaWarning = usedPercent >= 0.7;
  const showUpgrade = !chat.enabled || quotaWarning;

  return (
    <div className="flex h-full w-[380px] flex-col border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-white dark:bg-brand-500">
            <IconBot size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Assistant</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{chat.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {chat.messages.length > 0 ? (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Clear conversation"
              onClick={chat.clearConversation}
            >
              <IconTrash />
            </Button>
          ) : null}
          <Button size="icon-sm" variant="ghost" aria-label="Close AI assistant" onClick={onClose}>
            <IconX />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={
                quotaDanger
                  ? 'h-full rounded-full bg-danger-500'
                  : quotaWarning
                    ? 'h-full rounded-full bg-warning-500'
                    : 'h-full rounded-full bg-brand-500'
              }
              style={{ width: `${Math.min(usedPercent * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {chat.quotaUsed} / {chat.quotaTotal} queries
          </span>
        </div>
        {showUpgrade ? (
          <Button size="sm" variant="premium" onClick={() => navigate('/upgrade')}>
            Upgrade
          </Button>
        ) : null}
      </div>

      {!chat.enabled ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
            <IconLock size={20} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              AI Assistant is locked
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {chat.upgradeMessage || 'Upgrade your plan to ask questions about your document.'}
            </p>
          </div>
          <Button variant="premium" onClick={() => navigate('/upgrade')}>
            Upgrade to Premium
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {chat.messages.length === 0 ? (
              <div className="mt-8">
                <SuggestedPrompts onSelect={(prompt) => void chat.sendMessage(prompt)} />
              </div>
            ) : (
              <div className="space-y-3">
                {chat.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    role={message.role}
                    status={message.status}
                    error={message.error}
                    sources={message.sources}
                    onRetry={() => void chat.retry()}
                    onNavigate={
                      message.role === 'assistant'
                        ? (page) => navigateToSource(page, message.content)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
            {chat.error ? (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-300">
                <IconAlert size={14} className="mt-0.5 shrink-0" />
                <span>{chat.error}</span>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>
          <ChatInput
            disabled={!chat.enabled}
            streaming={chat.isStreaming}
            onSend={(message) => void chat.sendMessage(message)}
            onStop={chat.abortStream}
          />
        </>
      )}
    </div>
  );
}
