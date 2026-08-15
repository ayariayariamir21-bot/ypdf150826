import { create } from 'zustand';
import { QUOTA_KEYS, getQuota, type Tier } from '@pdfplatform/entitlements';
import type { AiChatSource, AiPageContext } from '@/lib/aiClient';
import { createMockAiChatClient } from '@/lib/aiClient';
import { errorMessage, uid } from '@/lib/utils';
import { getActiveEngine, getPdfLibSnapshot } from '@/lib/pdfLib';
import { useEditorStore } from '@/stores/editorStore';
import { useAuthStore } from '@/stores/authStore';

export const AI_MODEL = 'pdf-studio-v1';

export type AiMessageStatus = 'streaming' | 'complete' | 'error';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: readonly AiChatSource[];
  status: AiMessageStatus;
  error?: string;
}

interface AiState {
  messages: readonly AiMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  model: string;
  conversationId: string;
  quotaUsed: number;
  quotaTotal: number;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  abortStream: () => void;
  retry: () => Promise<void>;
  clearConversation: () => void;
  resetConversation: () => void;
  setQuota: (used: number, total: number) => void;
  replaceHistory: (messages: readonly AiMessage[]) => void;
}

const AI_USAGE_SEED: Readonly<Record<Tier, number>> = {
  free: 12,
  premium: 517,
  exclusive: 1200,
};

function initialQuota(): { used: number; total: number } {
  const tier = useAuthStore.getState().user?.tier ?? 'free';
  return {
    used: AI_USAGE_SEED[tier] ?? 0,
    total: getQuota(tier, QUOTA_KEYS.AI_REQUESTS_MONTHLY),
  };
}

export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return Math.ceil(trimmed.length / 4);
}

const MAX_CONTEXT_PAGES = 3;
const MAX_PAGE_TEXT_CHARS = 800;

export async function buildVisiblePageContext(): Promise<readonly AiPageContext[]> {
  const engine = getActiveEngine();
  const document = getPdfLibSnapshot().document;
  if (!engine || !document) {
    return [];
  }
  const { currentPage, pageOrder } = useEditorStore.getState();
  const position = pageOrder.indexOf(currentPage);
  const slots: number[] = [];
  for (let offset = -1; offset <= 1; offset += 1) {
    const slot = pageOrder[position + offset];
    if (slot !== undefined && slot >= 0) {
      slots.push(slot);
    }
  }
  if (slots.length === 0 && pageOrder.length > 0) {
    const first = pageOrder[0];
    if (first !== undefined && first >= 0) {
      slots.push(first);
    }
  }
  if (slots.length === 0) {
    return [];
  }
  const indexes = slots.slice(0, MAX_CONTEXT_PAGES);
  const items = await engine.extractText(document.documentId, { pageIndexes: indexes });
  const byPage = new Map<number, string>();
  for (const item of items) {
    const existing = byPage.get(item.pageIndex) ?? '';
    byPage.set(item.pageIndex, existing + item.text + ' ');
  }
  const pages: AiPageContext[] = [];
  for (const pageIndex of indexes) {
    const text = (byPage.get(pageIndex) ?? '').trim().slice(0, MAX_PAGE_TEXT_CHARS);
    pages.push({ page: pageIndex + 1, text });
  }
  return pages;
}

const aiClient = createMockAiChatClient();

let abortController: AbortController | null = null;

export const useAiStore = create<AiState>((set, get) => ({
  messages: [],
  isStreaming: false,
  isLoading: false,
  model: AI_MODEL,
  conversationId: uid(),
  quotaUsed: initialQuota().used,
  quotaTotal: initialQuota().total,
  error: null,
  sendMessage: async (content) => {
    const trimmed = content.trim();
    const state = get();
    if (state.isStreaming) {
      return;
    }
    if (trimmed.length === 0) {
      return;
    }
    if (state.quotaUsed >= state.quotaTotal) {
      set({
        error: 'You have reached your monthly AI query limit. Upgrade your plan to keep asking.',
      });
      return;
    }
    const userMessage: AiMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      status: 'complete',
    };
    const assistantMessage: AiMessage = {
      id: uid(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'streaming',
    };
    set({
      messages: [...state.messages, userMessage, assistantMessage],
      isStreaming: true,
      isLoading: true,
      error: null,
    });
    abortController = new AbortController();
    try {
      const pages = await buildVisiblePageContext();
      await aiClient.streamMessage(
        {
          message: trimmed,
          conversationId: get().conversationId,
          model: get().model,
          pages,
        },
        (chunk) => {
          set((current) => ({
            messages: current.messages.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: message.content + chunk.text,
                    sources: chunk.sources ?? message.sources,
                  }
                : message
            ),
          }));
        },
        abortController.signal
      );
      set((current) => ({
        messages: current.messages.map((message) =>
          message.id === assistantMessage.id ? { ...message, status: 'complete' } : message
        ),
        isStreaming: false,
        isLoading: false,
        quotaUsed: current.quotaUsed + 1,
      }));
    } catch (cause) {
      const isAbort =
        cause instanceof DOMException &&
        (cause.name === 'AbortError' || cause.name === 'DOMException');
      set((current) => ({
        messages: current.messages.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                status: 'error',
                error: isAbort
                  ? 'Generation stopped.'
                  : errorMessage(cause),
              }
            : message
        ),
        isStreaming: false,
        isLoading: false,
      }));
    } finally {
      abortController = null;
    }
  },
  abortStream: () => {
    abortController?.abort();
  },
  retry: async () => {
    const state = get();
    const lastUser = [...state.messages].reverse().find((message) => message.role === 'user');
    if (!lastUser || state.isStreaming) {
      return;
    }
    await get().sendMessage(lastUser.content);
  },
  clearConversation: () => set({ messages: [], error: null, isStreaming: false, isLoading: false }),
  resetConversation: () =>
    set({
      messages: [],
      conversationId: uid(),
      error: null,
      isStreaming: false,
      isLoading: false,
    }),
  setQuota: (used, total) => set({ quotaUsed: used, quotaTotal: total }),
  replaceHistory: (messages) => set({ messages }),
}));
