import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@pdfplatform/ui';
import { useToastStore, type ToastKind } from '@/stores/toastStore';

const VARIANT_BY_KIND: Readonly<
  Record<ToastKind, 'default' | 'success' | 'warning' | 'danger' | 'premium' | 'exclusive'>
> = {
  success: 'success',
  error: 'danger',
  info: 'default',
};

export function GlobalToastRegion(): React.ReactElement {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <ToastProvider duration={4500} swipeDirection="right">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={VARIANT_BY_KIND[toast.kind]}
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(toast.id);
            }
          }}
        >
          <div>
            <ToastTitle>{toast.message}</ToastTitle>
            <ToastDescription>PDF Studio</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="bottom-0 right-0 flex-col-reverse" />
    </ToastProvider>
  );
}
