import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastStyles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-orange-200 bg-orange-50 text-orange-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

const AlertInterceptor = () => {
  const { showToast } = useToast();

  useEffect(() => {
    const nativeAlert = window.alert;
    const win = window as any;
    win.alert = (message?: any) => {
      showToast(String(message ?? ""), "info");
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, [showToast]);

  return null;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      window.setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AlertInterceptor />
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl transition-all duration-300 ${toastStyles[toast.type]}`}
          >
            {toast.title ? <div className="font-semibold text-sm">{toast.title}</div> : null}
            <div className="mt-1 text-sm leading-5">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
