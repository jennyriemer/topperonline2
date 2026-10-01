"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { contrastText, type StatusOption } from "@/lib/monday";

export function StatusCell({
  value,
  options,
  onChange,
  emptyLabel = "—",
}: {
  value: string | null | undefined;
  options: StatusOption[];
  onChange?: (id: string) => void;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const bg = current?.color ?? "#c4c4c4";
  const fg = contrastText(bg);

  return (
    <div ref={ref} className="relative h-full w-full min-h-[36px]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onChange) setOpen((v) => !v);
        }}
        className="h-full w-full flex items-center justify-center font-medium"
        style={{
          background: bg,
          color: fg,
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          borderRadius: 0,
          minHeight: 36,
          padding: "0 8px",
          cursor: onChange ? "pointer" : "default",
        }}
      >
        <span className="truncate">{current?.label ?? emptyLabel}</span>
        {onChange && <ChevronDown size={12} className="ml-1 opacity-80 shrink-0" />}
      </button>
      {open && onChange && (
        <div
          className="absolute z-50 overflow-hidden"
          style={{
            top: "100%",
            left: 0,
            minWidth: 180,
            width: "100%",
            background: "white",
            boxShadow: "var(--shadow-lg)",
            borderRadius: 8,
            padding: 8,
            border: "1px solid var(--color-gray-150)",
          }}
        >
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.id);
                setOpen(false);
              }}
              className="w-full"
              style={{
                height: 32,
                marginBottom: 4,
                background: o.color,
                color: contrastText(o.color),
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 4,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatusBar({
  items,
  accessor,
  options,
}: {
  items: { id: string }[];
  accessor: (id: string) => string | null | undefined;
  options: StatusOption[];
}) {
  const counts = options.map((o) => ({
    ...o,
    n: items.filter((it) => accessor(it.id) === o.id).length,
  }));
  const total = items.length || 1;
  return (
    <div className="flex w-full overflow-hidden" style={{ height: 24 }} title="Status distribution">
      {counts.map((c) =>
        c.n ? (
          <div
            key={c.id}
            title={`${c.label}: ${c.n}`}
            style={{ flex: c.n / total, background: c.color, minWidth: c.n ? 4 : 0 }}
          />
        ) : null
      )}
      {counts.every((c) => !c.n) && <div className="flex-1" style={{ background: "var(--color-gray-100)" }} />}
    </div>
  );
}
