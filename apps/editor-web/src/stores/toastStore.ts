import { create } from 'zustand';
import { uid } from '@/lib/utils';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: readonly Toast[];
  showToast: (kind: ToastKind, message: string) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (kind, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: uid(), kind, message }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
