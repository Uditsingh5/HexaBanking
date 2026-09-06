import { useNotificationStore } from "@/stores/notification.store";

export function ToastViewport() {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismiss = useNotificationStore((state) => state.dismiss);

  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="status">
          <strong>{toast.title}</strong>
          {toast.description ? <p className="muted" style={{ margin: "4px 0 0" }}>{toast.description}</p> : null}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => dismiss(toast.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
