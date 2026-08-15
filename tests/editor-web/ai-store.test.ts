import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AiChatChunk } from '@/lib/aiClient';

vi.mock('@/lib/pdfLib', () => ({
  getActiveEngine: () => null,
  getPdfLibSnapshot: () => ({ document: null }),
}));

vi.mock('@/lib/aiClient', () => {
  let handler: ((chunk: AiChatChunk) => void) | null = null;
  let signalRef: AbortSignal | null = null;
  return {
    createMockAiChatClient: () => ({
      streamMessage: async (
        _request: { message: string },
        onChunk: (chunk: AiChatChunk) => void,
        signal: AbortSignal
      ) => {
        handler = onChunk;
        signalRef = signal;
        onChunk({ text: '', sources: [{ page: 1, text: 'source', score: 92 }] });
        onChunk({ text: 'Hello ' });
        onChunk({ text: 'world' });
        if (signal.aborted) {
          throw new DOMException('aborted', 'AbortError');
        }
      },
      fetchHistory: async () => [] as never[],
    }),
    __streamHandler: () => handler,
    __signal: () => signalRef,
  };
});

import { estimateTokens, useAiStore } from '@/stores/aiStore';
import { useAuthStore } from '@/stores/authStore';

function reset(): void {
  useAuthStore.setState({
    user: { id: 'u', name: 'T', email: 't@example.com', avatarUrl: null, tier: 'premium', createdAt: new Date() },
    isAuthenticated: true,
  });
  useAiStore.setState({
    messages: [],
    isStreaming: false,
    isLoading: false,
    error: null,
    conversationId: 'conv-1',
  });
}

beforeEach(reset);

describe('estimateTokens', () => {
  it('estimates tokens from text length', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('    ')).toBe(0);
    expect(estimateTokens('a'.repeat(400))).toBe(100);
  });
});

describe('useAiStore sendMessage', () => {
  it('appends user and assistant messages and completes the stream', async () => {
    const store = useAiStore;
    store.getState().setQuota(1, 10);
    await store.getState().sendMessage('summarize the document');
    const state = store.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0]).toMatchObject({ role: 'user', content: 'summarize the document' });
    const assistant = state.messages[1];
    expect(assistant?.role).toBe('assistant');
    expect(assistant?.content).toBe('Hello world');
    expect(assistant?.sources).toEqual([{ page: 1, text: 'source', score: 92 }]);
    expect(assistant?.status).toBe('complete');
    expect(state.isStreaming).toBe(false);
    expect(state.quotaUsed).toBe(2);
  });

  it('blocks sending when quota is exhausted', async () => {
    const store = useAiStore;
    store.getState().setQuota(10, 10);
    await store.getState().sendMessage('hello');
    const state = store.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.error).toContain('query limit');
  });

  it('refuses empty messages', async () => {
    const store = useAiStore;
    store.getState().setQuota(0, 10);
    await store.getState().sendMessage('   ');
    expect(store.getState().messages).toHaveLength(0);
  });

  it('retries the last user message', async () => {
    const store = useAiStore;
    store.getState().setQuota(0, 10);
    await store.getState().sendMessage('risk check');
    await store.getState().sendMessage('second question');
    expect(store.getState().messages).toHaveLength(4);
    await store.getState().retry();
    const state = store.getState();
    expect(state.messages).toHaveLength(6);
    expect(state.messages[4]?.role).toBe('user');
    expect(state.messages[4]?.content).toBe('second question');
    expect(state.messages[5]?.role).toBe('assistant');
  });

  it('clears the conversation', async () => {
    const store = useAiStore;
    store.getState().setQuota(0, 10);
    await store.getState().sendMessage('hello');
    store.getState().clearConversation();
    expect(store.getState().messages).toHaveLength(0);
    expect(store.getState().isStreaming).toBe(false);
  });
});
