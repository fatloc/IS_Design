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
      <div aria-live="polite" className="fixed right-6 top-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`
              max-w-sm min-w-[280px] rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-xl
              animate-in fade-in slide-in-from-right-10 duration-500
              ${t.type === "success" 
                ? "bg-emerald-500/90 border-emerald-400/30 text-white" 
                : t.type === "error" 
                ? "bg-rose-500/90 border-rose-400/30 text-white" 
                : "bg-slate-900/90 border-slate-700/30 text-white"}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-1 rounded-lg ${t.type === "success" ? "bg-emerald-400/20" : t.type === "error" ? "bg-rose-400/20" : "bg-slate-700/20"}`}>
                {t.type === "success" && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                {t.type === "error" && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>}
                {(!t.type || t.type === "info") && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              </div>
              <div className="flex-1">
                <div className="text-[0.92rem] font-bold leading-tight mb-0.5">
                  {t.type === "success" ? "Thành công" : t.type === "error" ? "Lỗi hệ thống" : "Thông báo"}
                </div>
                <div className="text-[0.82rem] opacity-90 leading-relaxed">{t.message}</div>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
