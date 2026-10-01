"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

function parseDay(value: string | null | undefined): string {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const isoCandidate = raw.includes("T") ? raw : /^\d{4}-\d{2}-\d{2}/.test(raw) ? `${raw.slice(0, 10)}T12:00:00` : raw;
  const d = new Date(isoCandidate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function DateCell({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange?: (iso: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const iso = parseDay(value);
  const label = iso
    ? new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  if (editing && onChange) {
    return (
      <input
        type="date"
        autoFocus
        value={iso}
        onChange={(e) => {
          onChange(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full"
        style={{ border: "none", outline: "none", fontSize: 13, padding: "0 8px", background: "white", minHeight: 36 }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onChange) setEditing(true);
      }}
      className="h-full w-full flex items-center"
      style={{
        gap: 6,
        padding: "0 10px",
        border: "none",
        background: "transparent",
        fontSize: 13,
        minHeight: 36,
        color: iso ? "var(--color-ink)" : "var(--color-gray-400)",
      }}
    >
      {iso ? (
        <span
          className="inline-flex items-center rounded-full"
          style={{
            gap: 4,
            height: 24,
            padding: "0 8px",
            background: "var(--color-gray-50)",
            fontWeight: 500,
          }}
        >
          <Calendar size={12} className="text-gray-500" />
          {label}
        </span>
      ) : (
        <span className="text-gray-400">+ Add date</span>
      )}
    </button>
  );
}

export function TextCell({
  value,
  onChange,
  placeholder = "",
  strong,
}: {
  value: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  strong?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing && onChange) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onChange(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(draft);
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full"
        style={{
          border: "none",
          outline: "1px solid var(--color-mon-blue)",
          fontSize: 14,
          padding: "0 12px",
          background: "white",
          minHeight: 36,
          fontWeight: strong ? 600 : 400,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        if (!onChange) return;
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      className="h-full w-full text-left truncate"
      style={{
        border: "none",
        background: "transparent",
        fontSize: 14,
        padding: "0 12px",
        minHeight: 36,
        fontWeight: strong ? 600 : 400,
        color: value ? "var(--color-ink)" : "var(--color-gray-400)",
      }}
    >
      {value || placeholder}
    </button>
  );
}
