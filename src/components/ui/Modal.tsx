"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 560 }: ModalProps) {
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex" }}>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "color-mix(in srgb, var(--color-carbon) 40%, transparent)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-paper rounded-lg"
        style={{
          position: "relative",
          margin: "auto",
          width: `min(${width}px, calc(100vw - 32px))`,
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 16px 48px rgba(32,32,32,0.16)",
        }}
      >
        <div
          className="flex items-start justify-between"
          style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-chalk)", gap: "12px" }}
        >
          <div className="min-w-0">
            <h2
              className="text-carbon"
              style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, lineHeight: 1.2 }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate" style={{ fontSize: "13px", marginTop: "4px" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md flex items-center justify-center text-graphite hover:bg-fog"
            style={{ width: "36px", height: "36px" }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="min-h-0" style={{ overflowY: "auto", padding: "20px 24px" }}>
          {children}
        </div>
        {footer && (
          <div
            className="flex items-center justify-end"
            style={{ padding: "16px 24px", borderTop: "1px solid var(--color-chalk)", gap: "8px" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
