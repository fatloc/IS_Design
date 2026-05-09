import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type Toast = { id: string; message: string; type?: "success" | "error" | "info" };

const ToastContext = createContext<{ addToast: (t: Omit<Toast, "id">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((s) => [{ id, ...t }, ...s]);
    // auto remove
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToasts([]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div aria-live="polite" className="fixed right-6 top-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm rounded-lg px-4 py-3 shadow-md text-sm ${t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-slate-800 text-white"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
