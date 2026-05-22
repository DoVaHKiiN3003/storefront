"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { X, Check, AlertCircle, Bell } from "lucide-react";

// ── Types ────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

// ── Context ──────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

// ── Container ────────────────────────────────────────────

function ToastContainer({
  toasts,
  dismissToast,
}: {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 350);
    }, toast.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const colorMap: Record<ToastType, { bg: string; icon: React.ReactNode; border: string }> =
    {
      success: {
        bg: "bg-sage",
        icon: <Check size={14} strokeWidth={3} className="text-white" />,
        border: "border-sage/20",
      },
      error: {
        bg: "bg-red-400",
        icon: <AlertCircle size={14} className="text-white" />,
        border: "border-red-200/50",
      },
      info: {
        bg: "bg-espresso",
        icon: <Bell size={14} className="text-cream" />,
        border: "border-espresso/10",
      },
    };

  const { bg, icon, border } = colorMap[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] border transition-all duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${bg} ${border}`}
      style={{
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? "translateY(0) scale(1)" : "translateY(12px) scale(0.92)",
      }}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
        {icon}
      </span>
      <span className="text-xs font-medium text-white/90">{toast.message}</span>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(onDismiss, 350);
        }}
        className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/10 transition-colors duration-300"
      >
        <X size={10} className="text-white/60" />
      </button>
    </div>
  );
}

// ── Hook ─────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
