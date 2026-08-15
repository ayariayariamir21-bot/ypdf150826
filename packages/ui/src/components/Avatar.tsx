import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/utils';

export const avatarSizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-xl',
} as const;

const statusColorClasses = {
  online: 'bg-success-500',
  offline: 'bg-slate-400',
  busy: 'bg-danger-500',
  away: 'bg-warning-500',
} as const;

export type AvatarSize = keyof typeof avatarSizeClasses;
export type AvatarStatus = keyof typeof statusColorClasses;

export interface AvatarProps {
  src?: string;
  alt: string;
  initials: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, initials, size = 'md', status, className },
  ref
) {
  return (
    <span ref={ref} className={cn('relative inline-flex shrink-0', className)}>
      <AvatarPrimitive.Root
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          avatarSizeClasses[size]
        )}
      >
        {src ? (
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="aspect-square size-full object-cover"
          />
        ) : null}
        <AvatarPrimitive.Fallback
          delayMs={400}
          className="bg-brand-50 text-brand-700 dark:text-brand-300 flex size-full items-center justify-center rounded-full font-semibold uppercase dark:bg-slate-800"
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-0.5 -right-0.5 block size-2.5 rounded-full ring-2 ring-white dark:ring-slate-950',
            statusColorClasses[status]
          )}
        />
      ) : null}
    </span>
  );
});
Avatar.displayName = 'Avatar';
