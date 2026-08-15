import type { Annotation } from '@/types';

export interface RemoteCursor {
  page: number;
  x: number;
  y: number;
}

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  initials: string;
  cursor: RemoteCursor | null;
  isActive: boolean;
}

export type CollaborationMessage =
  | { type: 'presence'; users: readonly RemoteUser[] }
  | { type: 'cursor'; userId: string; cursor: RemoteCursor | null }
  | { type: 'annotations'; annotations: readonly Annotation[] }
  | { type: 'status'; connected: boolean };

export interface CollaborationClient {
  connect: () => void;
  disconnect: () => void;
  send: (message: CollaborationMessage) => void;
  onMessage: (listener: (message: CollaborationMessage) => void) => () => void;
  onConnectionState: (listener: (connected: boolean) => void) => () => void;
}

interface MockPeer {
  id: string;
  name: string;
  color: string;
  initials: string;
}

const MOCK_PEERS: readonly MockPeer[] = [
  { id: 'peer-alice', name: 'Alice Martin', color: '#8b5cf6', initials: 'AM' },
  { id: 'peer-bruno', name: 'Bruno Silva', color: '#10b981', initials: 'BS' },
];

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function randomCursor(pageCount: number, pageHint: number): RemoteCursor {
  const page = Math.max(0, Math.min(pageCount - 1, pageHint + Math.floor(Math.random() * 3) - 1));
  return { page, x: clampUnit(0.08 + Math.random() * 0.84), y: clampUnit(0.08 + Math.random() * 0.84) };
}

export function createMockCollaborationClient(pageCountProvider: () => number): CollaborationClient {
  let connected = false;
  let disposed = false;
  const listeners = new Set<(message: CollaborationMessage) => void>();
  const connectionListeners = new Set<(connected: boolean) => void>();
  let cursorTimer: number | null = null;
  let presenceTimer: number | null = null;

  const peers = new Map<string, MockPeer & { cursor: RemoteCursor | null }>(
    MOCK_PEERS.map((peer) => [peer.id, { ...peer, cursor: null }])
  );

  const emitMessage = (message: CollaborationMessage): void => {
    if (disposed) {
      return;
    }
    for (const listener of listeners) {
      listener(message);
    }
  };

  const emitConnectionState = (next: boolean): void => {
    if (disposed) {
      return;
    }
    connected = next;
    for (const listener of connectionListeners) {
      listener(next);
    }
    emitMessage({ type: 'status', connected: next });
  };

  const broadcastPresence = (): void => {
    emitMessage({
      type: 'presence',
      users: [...peers.values()].map((peer) => ({
        id: peer.id,
        name: peer.name,
        color: peer.color,
        initials: peer.initials,
        cursor: peer.cursor,
        isActive: true,
      })),
    });
  };

  return {
    connect: () => {
      if (connected || disposed) {
        return;
      }
      emitConnectionState(true);
      for (const peer of peers.values()) {
        peer.cursor = randomCursor(pageCountProvider(), 0);
      }
      broadcastPresence();
      cursorTimer = window.setInterval(() => {
        const pageCount = pageCountProvider();
        const peer = [...peers.values()][Math.floor(Math.random() * peers.size)];
        if (!peer) {
          return;
        }
        peer.cursor = randomCursor(pageCount, peer.cursor?.page ?? 0);
        emitMessage({ type: 'cursor', userId: peer.id, cursor: peer.cursor });
      }, 1600);
      presenceTimer = window.setInterval(() => {
        broadcastPresence();
      }, 8000);
    },
    disconnect: () => {
      if (cursorTimer !== null) {
        window.clearInterval(cursorTimer);
        cursorTimer = null;
      }
      if (presenceTimer !== null) {
        window.clearInterval(presenceTimer);
        presenceTimer = null;
      }
      if (connected) {
        emitConnectionState(false);
      }
      disposed = true;
      listeners.clear();
      connectionListeners.clear();
    },
    send: (message) => {
      if (!connected || disposed) {
        return;
      }
      if (message.type === 'annotations') {
        window.setTimeout(() => {
          if (!disposed) {
            emitMessage({ type: 'annotations', annotations: [...message.annotations] });
          }
        }, 350);
      }
    },
    onMessage: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    onConnectionState: (listener) => {
      connectionListeners.add(listener);
      return () => {
        connectionListeners.delete(listener);
      };
    },
  };
}
