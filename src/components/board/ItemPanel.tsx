"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, Send, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatShortDate } from "@/lib/demo/crm";

export type PanelUpdate = {
  id: string;
  at: string;
  author: string;
  title: string;
  body: string;
};

export type PanelFile = {
  name: string;
  size: string;
  kind: "pdf" | "image" | "doc";
};

export type PanelField = { label: string; value: string };

export function ItemPanel({
  open,
  title,
  subtitle,
  onClose,
  updates,
  files,
  info,
  onAddUpdate,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  updates: PanelUpdate[];
  files: PanelFile[];
  info: PanelField[];
  onAddUpdate?: (text: string) => void;
  footer?: React.ReactNode;
}) {
  const [tab, setTab] = useState<"updates" | "files" | "info">("updates");
  const [draft, setDraft] = useState("");

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close item"
        className="fixed inset-0 z-40 md:hidden"
        style={{ background: "rgba(28,31,59,0.35)", border: "none" }}
        onClick={onClose}
      />
      <aside
        className="fixed z-50 flex flex-col bg-white"
        style={{
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(440px, 100vw)",
          borderLeft: "1px solid var(--color-gray-150)",
          boxShadow: "var(--shadow-lg)",
        }}
        aria-label="Item details"
      >
        <header
          className="shrink-0 flex items-start"
          style={{ padding: "16px 16px 0", gap: 10, borderBottom: "1px solid var(--color-gray-100)" }}
        >
          <div className="flex-1 min-w-0" style={{ paddingBottom: 12 }}>
            <h2 className="font-display truncate" style={{ fontSize: 18 }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 truncate" style={{ fontSize: 13, marginTop: 2 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md hover:bg-gray-50 text-gray-500"
            style={{ width: 32, height: 32, border: "none", background: "transparent" }}
            aria-label="Close"
          >
            <X size={18} className="mx-auto" />
          </button>
        </header>

        <div className="shrink-0 flex" style={{ padding: "0 8px", borderBottom: "1px solid var(--color-gray-150)" }}>
          {(["updates", "files", "info"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                height: 40,
                padding: "0 14px",
                fontSize: 13,
                fontWeight: tab === t ? 700 : 500,
                color: tab === t ? "var(--color-brand-600)" : "var(--color-gray-600)",
                border: "none",
                background: "transparent",
                borderBottom: tab === t ? "2px solid var(--color-brand-600)" : "2px solid transparent",
                textTransform: "capitalize",
              }}
            >
              {t === "updates" ? "Updates" : t === "files" ? "Files" : "Info"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
          {tab === "updates" && (
            <div>
              {onAddUpdate && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = draft.trim();
                    if (!text) return;
                    onAddUpdate(text);
                    setDraft("");
                  }}
                  className="flex"
                  style={{ gap: 8, marginBottom: 16 }}
                >
                  <Avatar name="Zack Vivas" size={28} />
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write an update…"
                    className="flex-1"
                    style={{
                      height: 36,
                      border: "1px solid var(--color-gray-150)",
                      borderRadius: 8,
                      padding: "0 12px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    className="rounded-md text-white"
                    style={{ width: 36, height: 36, background: "var(--color-mon-green)", border: "none" }}
                    aria-label="Post update"
                  >
                    <Send size={14} className="mx-auto" />
                  </button>
                </form>
              )}
              {updates.length === 0 ? (
                <p className="text-gray-500" style={{ fontSize: 13 }}>
                  No updates yet. Post the first note for this item.
                </p>
              ) : (
                <ul className="flex flex-col" style={{ gap: 12 }}>
                  {updates.map((u) => (
                    <li key={u.id} className="flex" style={{ gap: 10 }}>
                      <Avatar name={u.author} size={28} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline" style={{ gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{u.author}</span>
                          <span className="text-gray-400" style={{ fontSize: 11 }}>
                            {formatShortDate(u.at)}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{u.title}</div>
                        <p className="text-gray-600" style={{ fontSize: 13, lineHeight: 1.45, marginTop: 2 }}>
                          {u.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "files" && (
            <ul className="flex flex-col" style={{ gap: 8 }}>
              {files.length === 0 && (
                <p className="text-gray-500" style={{ fontSize: 13 }}>
                  No files attached.
                </p>
              )}
              {files.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center rounded-md"
                  style={{
                    gap: 10,
                    padding: 10,
                    border: "1px solid var(--color-gray-150)",
                    background: "var(--color-gray-25)",
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center rounded-md text-white"
                    style={{
                      width: 32,
                      height: 32,
                      background: f.kind === "image" ? "#ff5ac4" : f.kind === "pdf" ? "#e2445c" : "#579bfc",
                    }}
                  >
                    {f.kind === "image" ? <ImageIcon size={14} /> : f.kind === "pdf" ? <FileText size={14} /> : <Paperclip size={14} />}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                      {f.name}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: 11 }}>
                      {f.size}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tab === "info" && (
            <dl>
              {info.map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between"
                  style={{ padding: "10px 0", borderBottom: "1px solid var(--color-gray-100)", gap: 12 }}
                >
                  <dt className="text-gray-500" style={{ fontSize: 12, fontWeight: 600 }}>
                    {f.label}
                  </dt>
                  <dd style={{ fontSize: 13, fontWeight: 500, textAlign: "right" }}>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {footer && (
          <div className="shrink-0" style={{ padding: 12, borderTop: "1px solid var(--color-gray-150)" }}>
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
