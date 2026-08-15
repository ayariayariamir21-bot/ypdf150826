import * as React from 'react';
import { Avatar, avatarSizeClasses, type AvatarSize } from './Avatar';
import { cn } from '../lib/utils';

export interface AvatarGroupItem {
  src?: string;
  alt: string;
  initials: string;
}

export interface AvatarGroupProps {
  items: readonly AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  items,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps): React.ReactElement {
  const visible = items.slice(0, Math.max(0, max));
  const overflow = items.length - visible.length;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((item) => (
        <Avatar
          key={item.alt}
          src={item.src}
          alt={item.alt}
          initials={item.initials}
          size={size}
          className="rounded-full ring-2 ring-white dark:ring-slate-950"
        />
      ))}
      {overflow > 0 ? (
        <span
          aria-label={`${overflow} more`}
          className={cn(
            'flex items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600 ring-2 ring-white dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-950',
            avatarSizeClasses[size],
            'text-xs'
          )}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
