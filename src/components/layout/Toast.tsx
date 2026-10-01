"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; undo?: () => void };

const ToastCtx = createContext<{
  push: (message: string, undo?: () => void) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) return { push: () => {} };
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, undo?: () => void) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, undo }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        className="fixed z-50 flex flex-col items-center"
        style={{ bottom: 24, left: 0, right: 0, pointerEvents: "none", gap: 8 }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in flex items-center"
            style={{
              pointerEvents: "auto",
              background: "var(--color-ink)",
              color: "white",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "var(--shadow-lg)",
              gap: 12,
            }}
          >
            <span>{t.message}</span>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  t.undo?.();
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-yellow-400)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
