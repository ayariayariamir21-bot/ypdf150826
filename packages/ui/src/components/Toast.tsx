import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const ToastProvider = ToastPrimitive.Provider;

const toastVariants = cva(
  'shadow-elevated data-[state=open]:animate-slide-in-from-bottom data-[state=closed]:animate-fade-out group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border p-4 pr-8 transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-0 data-[swipe=move]:translate-x-2',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50',
        success:
          'border-success-600/30 bg-success-50 text-success-600 dark:border-success-500/30 dark:bg-success-950/40 dark:text-success-500',
        warning:
          'border-warning-600/30 bg-warning-50 text-warning-600 dark:border-warning-500/30 dark:bg-warning-950/40 dark:text-warning-500',
        danger:
          'border-danger-600/30 bg-danger-50 text-danger-600 dark:border-danger-500/30 dark:bg-danger-950/40 dark:text-danger-500',
        premium:
          'border-premium-600/30 bg-premium-50 text-premium-600 dark:border-premium-500/30 dark:bg-premium-950/40 dark:text-premium-400',
        exclusive:
          'border-exclusive-600/30 bg-exclusive-50 text-exclusive-600 dark:border-exclusive-500/30 dark:bg-exclusive-950/40 dark:text-exclusive-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {}

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  function Toast({ className, variant, ...props }, ref) {
    return (
      <ToastPrimitive.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
  );
});
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Description
      ref={ref}
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  );
});
ToastDescription.displayName = 'ToastDescription';

function CloseIcon(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(function ToastClose({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Close
      ref={ref}
      toast-close=""
      className={cn(
        'focus:ring-brand-500 absolute right-2 top-2 rounded-md p-1 text-current opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus-visible:opacity-100 group-hover:opacity-100',
        className
      )}
      {...props}
    >
      <CloseIcon />
    </ToastPrimitive.Close>
  );
});
ToastClose.displayName = 'ToastClose';

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(function ToastAction({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Action
      ref={ref}
      className={cn(
        'focus:ring-brand-500 inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800',
        className
      )}
      {...props}
    />
  );
});
ToastAction.displayName = 'ToastAction';

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        'fixed z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm',
        className
      )}
      {...props}
    />
  );
});
ToastViewport.displayName = 'ToastViewport';

const viewportPositions = {
  'top-right': 'top-0 right-0 flex-col p-4',
  'top-left': 'top-0 left-0 flex-col p-4',
  'top-center': 'top-0 left-1/2 flex-col items-center p-4',
  'bottom-right': 'bottom-0 right-0 flex-col-reverse p-4',
  'bottom-left': 'bottom-0 left-0 flex-col-reverse p-4',
  'bottom-center': 'bottom-0 left-1/2 flex-col-reverse items-center p-4',
} as const;

export type ToasterPosition = keyof typeof viewportPositions;

export interface ToasterProps {
  position?: ToasterPosition;
  duration?: number;
}

export function Toaster({
  position = 'bottom-right',
  duration = 5000,
}: ToasterProps): React.ReactElement {
  return (
    <ToastProvider duration={duration} swipeDirection="right">
      <ToastViewport className={viewportPositions[position]} />
    </ToastProvider>
  );
}
