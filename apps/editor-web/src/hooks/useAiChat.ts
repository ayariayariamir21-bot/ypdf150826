import * as React from 'react';
import { FEATURES, QUOTA_KEYS } from '@pdfplatform/entitlements';
import type { AiMessage } from '@/stores/aiStore';
import { AI_MODEL, estimateTokens, useAiStore } from '@/stores/aiStore';
import { usePdfDocument } from './usePdfDocument';
import { useEntitlement } from './useEntitlement';

const HISTORY_PREFIX = 'pdfstudio:ai-history:';

function storageKey(documentId: string): string {
  return `${HISTORY_PREFIX}${documentId}`;
}

function isStoredMessage(value: unknown): value is AiMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    (item.role === 'user' || item.role === 'assistant') &&
    typeof item.content === 'string'
  );
}

function loadHistory(documentId: string): readonly AiMessage[] | null {
  try {
    const raw = localStorage.getItem(storageKey(documentId));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter(isStoredMessage);
  } catch {
    return null;
  }
}

function saveHistory(documentId: string, messages: readonly AiMessage[]): void {
  try {
    localStorage.setItem(storageKey(documentId), JSON.stringify(messages));
  } catch {
    // storage may be unavailable
  }
}

export function useAiChat() {
  const { document } = usePdfDocument();
  const documentId = document?.documentId ?? null;
  const entitlement = useEntitlement();
  const enabled = entitlement.can(FEATURES.AI_EDIT);

  const messages = useAiStore((state) => state.messages);
  const isStreaming = useAiStore((state) => state.isStreaming);
  const isLoading = useAiStore((state) => state.isLoading);
  const model = useAiStore((state) => state.model);
  const conversationId = useAiStore((state) => state.conversationId);
  const quotaUsed = useAiStore((state) => state.quotaUsed);
  const quotaTotal = useAiStore((state) => state.quotaTotal);
  const error = useAiStore((state) => state.error);
  const sendMessage = useAiStore((state) => state.sendMessage);
  const abortStream = useAiStore((state) => state.abortStream);
  const retry = useAiStore((state) => state.retry);
  const clearConversation = useAiStore((state) => state.clearConversation);
  const resetConversation = useAiStore((state) => state.resetConversation);
  const replaceHistory = useAiStore((state) => state.replaceHistory);

  const previousId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (documentId === previousId.current) {
      return;
    }
    previousId.current = documentId;
    if (!documentId) {
      resetConversation();
      return;
    }
    replaceHistory(loadHistory(documentId) ?? []);
  }, [documentId, replaceHistory, resetConversation]);

  React.useEffect(() => {
    if (!documentId) {
      return;
    }
    saveHistory(documentId, messages);
  }, [documentId, messages]);

  return {
    enabled,
    messages,
    isStreaming,
    isLoading,
    model: model || AI_MODEL,
    conversationId,
    quotaUsed,
    quotaTotal,
    remaining: Math.max(0, quotaTotal - quotaUsed),
    error,
    sendMessage,
    abortStream,
    retry,
    clearConversation,
    estimateTokens,
    upgradeMessage: entitlement.upgradeMessage(FEATURES.AI_EDIT),
    quotaKey: QUOTA_KEYS.AI_REQUESTS_MONTHLY,
  };
}
