import * as React from 'react';
import type { RemoteUser } from '@/lib/collaborationClient';

interface RemoteCursorsProps {
  users: readonly RemoteUser[];
  isConnected: boolean;
}

export function RemoteCursors({ users, isConnected }: RemoteCursorsProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cursorsRef = React.useRef(new Map<string, HTMLDivElement>());

  React.useEffect(() => {
    if (!isConnected) {
      return;
    }
    let frame = 0;
    const tick = (): void => {
      frame = requestAnimationFrame(tick);
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        return;
      }
      for (const user of users) {
        const element = cursorsRef.current.get(user.id);
        if (!element || !user.cursor) {
          continue;
        }
        const pageElement = document.querySelector(`[data-page-slot="${user.cursor.page}"]`);
        if (!pageElement) {
          element.style.opacity = '0';
          continue;
        }
        const pageRect = pageElement.getBoundingClientRect();
        const x = pageRect.left + user.cursor.x * pageRect.width - containerRect.left;
        const y = pageRect.top + user.cursor.y * pageRect.height - containerRect.top;
        element.style.transform = `translate(${x}px, ${y}px)`;
        element.style.opacity = '1';
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [users, isConnected]);

  const captureRef = (userId: string) => (element: HTMLDivElement | null): void => {
    if (element) {
      cursorsRef.current.set(userId, element);
    } else {
      cursorsRef.current.delete(userId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      {users.map((user) => (
        <div
          key={user.id}
          ref={captureRef(user.id)}
          className="absolute left-0 top-0 opacity-0 transition-opacity duration-200 will-change-transform"
          style={{ color: user.color }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 2l16 8.5-7.3 2.6L9.5 21 4 2z" />
          </svg>
          <span
            className="absolute left-4 top-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </div>
  );
}
