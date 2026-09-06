import { create } from "zustand";

export type ToastTone = "success" | "info" | "warning" | "danger";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface NotificationState {
  toasts: Toast[];
  notify: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],

  notify(toast) {
    const duplicate = get().toasts.find(
      (item) => item.title === toast.title && item.description === toast.description,
    );
    if (duplicate) return;

    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    window.setTimeout(() => {
      get().dismiss(id);
    }, 4200);
  },

  dismiss(id) {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
