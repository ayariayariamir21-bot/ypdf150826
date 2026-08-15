import * as React from 'react';
import { Button } from '@pdfplatform/ui';
import { IconBot, IconRefreshCw } from '@/components/icons';
import type { AiChatSource } from '@/lib/aiClient';
import { SourcesList } from './SourcesList';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  'Summarize this document',
  'Find risks in the contract',
  'Translate the key points to French',
] as const;

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <IconBot size={16} className="text-brand-500" />
        <p className="text-sm font-medium">What can I help with?</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-slate-700 dark:hover:text-brand-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  status: 'streaming' | 'complete' | 'error';
  error?: string;
  sources?: readonly AiChatSource[];
  onRetry?: () => void;
  onNavigate?: (page: number) => void;
}

export function ChatMessage({
  content,
  role,
  status,
  error,
  sources,
  onRetry,
  onNavigate,
}: ChatMessageProps): React.ReactElement {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white dark:bg-brand-500">
          <IconBot size={14} />
        </div>
      ) : null}
      <div className={`max-w-[85%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-sm text-white shadow-sm dark:bg-brand-500'
              : 'rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
          }
        >
          {status === 'error' ? (
            <span className="text-danger-600 dark:text-danger-400">{error ?? 'Something went wrong.'}</span>
          ) : content.length > 0 ? (
            <span className="whitespace-pre-wrap break-words">{content}</span>
          ) : (
            <span className="inline-flex items-center gap-1" aria-label="Generating response">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </span>
          )}
        </div>
        {!isUser && sources && onNavigate ? (
          <SourcesList sources={sources} onNavigate={onNavigate} />
        ) : null}
        {!isUser && status === 'error' && onRetry ? (
          <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
            <IconRefreshCw size={14} />
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
