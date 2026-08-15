import * as React from 'react';
import { FEATURES } from '@pdfplatform/entitlements';
import type { CollaborationClient, RemoteUser } from '@/lib/collaborationClient';
import { createMockCollaborationClient } from '@/lib/collaborationClient';
import { clamp } from '@/lib/utils';
import { useAnnotationsStore } from '@/stores/annotationsStore';
import { useAuthStore } from '@/stores/authStore';
import { useEditorStore } from '@/stores/editorStore';
import { useEntitlement } from './useEntitlement';
import { usePdfDocument } from './usePdfDocument';

export function useCollaboration() {
  const { document } = usePdfDocument();
  const documentId = document?.documentId ?? null;
  const entitlement = useEntitlement();
  const enabled = entitlement.can(FEATURES.COLLABORATION);
  const user = useAuthStore((state) => state.user);
  const localUserId = user?.id ?? 'local-guest';

  const [isConnected, setIsConnected] = React.useState(false);
  const [users, setUsers] = React.useState<readonly RemoteUser[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const clientRef = React.useRef<CollaborationClient | null>(null);
  const suppressBroadcastRef = React.useRef(false);
  const broadcastTimerRef = React.useRef<number | null>(null);
  const cursorTimerRef = React.useRef<number | null>(null);
  const lastCursorRef = React.useRef<{ page: number; x: number; y: number } | null>(null);
  const userIdRef = React.useRef(localUserId);
  userIdRef.current = localUserId;

  React.useEffect(() => {
    if (!enabled || !documentId) {
      clientRef.current?.disconnect();
      clientRef.current = null;
      setIsConnected(false);
      setUsers([]);
      return;
    }

    const client = createMockCollaborationClient(
      () => useEditorStore.getState().pageOrder.length
    );
    clientRef.current = client;

    const unsubscribeConnection = client.onConnectionState((next) => {
      setIsConnected(next);
      if (!next) {
        setUsers([]);
      }
    });

    const unsubscribeMessage = client.onMessage((message) => {
      switch (message.type) {
        case 'presence':
          setUsers(message.users);
          break;
        case 'cursor':
          setUsers((current) =>
            current.map((peer) =>
              peer.id === message.userId ? { ...peer, cursor: message.cursor } : peer
            )
          );
          break;
        case 'annotations':
          suppressBroadcastRef.current = true;
          useAnnotationsStore.getState().replaceAll(message.annotations);
          suppressBroadcastRef.current = false;
          break;
        default:
          break;
      }
    });

    const unsubscribeAnnotations = useAnnotationsStore.subscribe((state) => {
      if (suppressBroadcastRef.current) {
        return;
      }
      if (broadcastTimerRef.current !== null) {
        window.clearTimeout(broadcastTimerRef.current);
      }
      broadcastTimerRef.current = window.setTimeout(() => {
        broadcastTimerRef.current = null;
        clientRef.current?.send({ type: 'annotations', annotations: state.annotations });
      }, 250);
    });

    const handlePointerMove = (event: PointerEvent): void => {
      if (!documentId) {
        return;
      }
      const target = window.document.elementFromPoint(event.clientX, event.clientY);
      const element = target?.closest<HTMLElement>('[data-page-slot]');
      if (!element) {
        if (lastCursorRef.current !== null) {
          lastCursorRef.current = null;
          client.send({ type: 'cursor', userId: userIdRef.current, cursor: null });
        }
        return;
      }
      const page = Number(element.getAttribute('data-page-slot'));
      const rect = element.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        return;
      }
      lastCursorRef.current = {
        page,
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
      };
      if (cursorTimerRef.current !== null) {
        window.clearTimeout(cursorTimerRef.current);
      }
      cursorTimerRef.current = window.setTimeout(() => {
        cursorTimerRef.current = null;
        client.send({
          type: 'cursor',
          userId: userIdRef.current,
          cursor: lastCursorRef.current,
        });
      }, 120);
    };

    window.addEventListener('pointermove', handlePointerMove);
    client.connect();
    setError(null);

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeAnnotations();
      window.removeEventListener('pointermove', handlePointerMove);
      if (broadcastTimerRef.current !== null) {
        window.clearTimeout(broadcastTimerRef.current);
        broadcastTimerRef.current = null;
      }
      if (cursorTimerRef.current !== null) {
        window.clearTimeout(cursorTimerRef.current);
        cursorTimerRef.current = null;
      }
      client.disconnect();
      clientRef.current = null;
      setIsConnected(false);
      setUsers([]);
    };
  }, [enabled, documentId]);

  return { isConnected, users, error };
}
