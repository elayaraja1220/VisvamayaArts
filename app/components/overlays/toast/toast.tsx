"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import "./toast.css";

export type ToastVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info";

export type ToastPosition =
  | "top-right"
  | "top-center"
  | "bottom-right"
  | "bottom-center";

type ToastOptions = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = Omit<ToastOptions, "variant" | "duration"> & {
  id: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextType = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const toastIcons: Record<ToastVariant, string> = {
  primary: "✦",
  secondary: "●",
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
};

function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (item.duration <= 0) return;

    const timer = window.setTimeout(() => {
      onDismiss(item.id);
    }, item.duration);

    return () => window.clearTimeout(timer);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      className={`toast toast-${item.variant ?? "primary"}`}
      role={item.variant === "error" ? "alert" : "status"}
      aria-live={item.variant === "error" ? "assertive" : "polite"}
    >
      <span className="toast-icon" aria-hidden="true">
        {toastIcons[item.variant ?? "primary"]}
      </span>

      <div className="toast-content">
        {item.title && (
          <strong className="toast-title">{item.title}</strong>
        )}

        <p className="toast-message">{item.message}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        aria-label="Close notification"
        onClick={() => onDismiss(item.id)}
      >
        ×
      </button>
    </div>
  );
}

type ToastProviderProps = {
  children: ReactNode;
  position?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
};

export function ToastProvider({
  children,
  position = "top-right",
  defaultDuration = 4000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }, []);

  const dismissAll = useCallback(() => {
    setItems([]);
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `${Date.now()}-${Math.random()}`;

      const newToast: ToastItem = {
        ...options,
        id,
        variant: options.variant ?? "primary",
        duration: options.duration ?? defaultDuration,
      };

      setItems((previous) => [
        ...previous,
        newToast,
      ].slice(-maxToasts));
    },
    [defaultDuration, maxToasts],
  );

  return (
    <ToastContext.Provider
      value={{ toast, dismiss, dismissAll }}
    >
      {children}

      <div
        className={`toast-container toast-${position}`}
        aria-label="Notifications"
      >
        {items.map((item) => (
          <ToastItemView
            key={item.id}
            item={item}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider.",
    );
  }

  return context;
}
