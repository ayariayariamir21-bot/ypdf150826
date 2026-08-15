export interface AiChatSource {
  page: number;
  text: string;
  score: number;
}

export interface AiPageContext {
  page: number;
  text: string;
}

export interface AiChatChunk {
  text: string;
  sources?: readonly AiChatSource[];
}

export interface AiChatRequest {
  message: string;
  conversationId: string;
  model: string;
  pages: readonly AiPageContext[];
}

export interface AiHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiChatClient {
  streamMessage: (
    request: AiChatRequest,
    onChunk: (chunk: AiChatChunk) => void,
    signal: AbortSignal
  ) => Promise<void>;
  fetchHistory: (conversationId: string) => Promise<readonly AiHistoryMessage[]>;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function normalizePrompt(message: string): string {
  return message.toLowerCase();
}

function replyFor(message: string, pages: readonly AiPageContext[]): string {
  const prompt = normalizePrompt(message);
  if (prompt.includes('summar')) {
    return (
      'Here is a summary of the visible pages. ' +
      (pages.length > 0
        ? `Across the ${pages.length} pages you are viewing, the document establishes its core topic early and then builds supporting arguments with concrete examples and data points. The key themes are the stated objective, the main findings, and the recommendations that follow. `
        : 'No extractable text was found on the visible pages, so the summary is based on structure alone. ') +
      'For a full recap I would recommend reviewing the first page of each section and the closing notes.'
    );
  }
  if (prompt.includes('risk')) {
    return (
      'I reviewed the visible pages for risks. ' +
      (pages.length > 0
        ? 'Two items stand out: ambiguous dates in the schedule section and a missing sign-off on the budget line. Both are mentioned in the source passages below and should be confirmed before finalising the document. '
        : 'No text could be extracted from the visible pages, so I could not surface specific risks. ') +
      'Would you like me to draft a checklist you can paste directly into the document?'
    );
  }
  if (prompt.includes('translat') || prompt.includes('translate') || /\bfr\b/.test(prompt)) {
    return (
      'Voici la traduction en français des passages visibles. ' +
      (pages.length > 0
        ? 'Le document présente son objet principal, puis développe les points clés avec des exemples concrets. Les recommandations finales résument les actions à mener. '
        : 'Aucun texte exploitable na pu être extrait des pages visibles pour la traduction. ') +
      'Souhaitez-vous que je traduise également les pages suivantes?'
    );
  }
  if (prompt.includes('proofread') || prompt.includes('grammar')) {
    return (
      'I proofread the visible passages. ' +
      'I found a few minor issues: inconsistent hyphenation, one repeated word, and a sentence fragment in the third paragraph. The overall tone is clear and consistent. ' +
      'Would you like me to propose corrected versions inline?'
    );
  }
  return (
    'Based on the pages you are currently viewing, ' +
    (pages.length > 0
      ? 'the document appears well structured and internally consistent. The main points are introduced early and supported with concrete examples. '
      : 'I could not extract any selectable text from the visible pages, so my analysis is limited to the document structure. ') +
    'Tell me what you would like to focus on, and I can dig deeper into a specific page or section.'
  );
}

function buildSources(pages: readonly AiPageContext[], maxSources: number): readonly AiChatSource[] {
  const sources: AiChatSource[] = [];
  for (const page of pages) {
    const text = page.text.trim();
    if (text.length === 0) {
      continue;
    }
    const excerpt = text.slice(0, 160);
    sources.push({
      page: page.page,
      text: excerpt,
      score: Math.round(Math.max(40, 95 - sources.length * 8)),
    });
    if (sources.length >= maxSources) {
      break;
    }
  }
  return sources;
}

function* chunksOf(reply: string): Generator<string> {
  const words = reply.split(/\s+/);
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word === undefined) {
      continue;
    }
    yield `${word} `;
  }
}

function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

export function createMockAiChatClient(): AiChatClient {
  return {
    async streamMessage(request, onChunk, signal): Promise<void> {
      if (isAborted(signal)) {
        throw new DOMException('The request was aborted', 'AbortError');
      }
      await delay(600);
      if (isAborted(signal)) {
        throw new DOMException('The request was aborted', 'AbortError');
      }
      const reply = replyFor(request.message, request.pages);
      const sources = buildSources(request.pages, 3);
      onChunk({ text: '', sources });
      for (const chunk of chunksOf(reply)) {
        if (isAborted(signal)) {
          throw new DOMException('The request was aborted', 'AbortError');
        }
        await delay(35);
        onChunk({ text: chunk });
      }
    },
    async fetchHistory(): Promise<readonly AiHistoryMessage[]> {
      await delay(50);
      return [];
    },
  };
}
