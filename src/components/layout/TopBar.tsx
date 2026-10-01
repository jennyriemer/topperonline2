"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { actionQueue } from "@/lib/demo/crm";
import { Avatar } from "@/components/ui/Avatar";

export function TopBar({ onCommand }: { onCommand?: () => void }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => actionQueue().slice(0, 6), []);
  const urgent = items.filter((a) => a.urgency === "now").length;

  return (
    <header
      className="sticky top-0 z-30 flex items-center bg-white"
      style={{ height: 48, padding: "0 16px", borderBottom: "1px solid var(--color-gray-150)", gap: 12 }}
    >
      <button
        type="button"
        onClick={onCommand}
        className="hidden sm:flex items-center flex-1"
        style={{
          maxWidth: 420,
          height: 32,
          marginLeft: "auto",
          padding: "0 12px",
          gap: 8,
          borderRadius: 8,
          border: "1px solid var(--color-gray-150)",
          background: "var(--color-gray-25)",
          color: "var(--color-gray-500)",
          fontSize: 13,
        }}
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search anything</span>
        <kbd style={{ fontSize: 10, border: "1px solid var(--color-gray-150)", borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
      </button>

      <div className="ml-auto sm:ml-0 flex items-center" style={{ gap: 8 }}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative rounded-md hover:bg-gray-50"
            style={{ width: 32, height: 32, border: "none", background: "transparent" }}
            aria-label="Notifications"
          >
            <Bell size={16} className="mx-auto text-gray-600" />
            {urgent > 0 && (
              <span
                className="absolute text-white"
                style={{
                  top: 4,
                  right: 4,
                  minWidth: 14,
                  height: 14,
                  borderRadius: 99,
                  background: "#e2445c",
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: "14px",
                }}
              >
                {urgent}
              </span>
            )}
          </button>
          {open && (
            <div
              className="absolute right-0 bg-white z-50 overflow-hidden"
              style={{
                top: 36,
                width: 320,
                borderRadius: 8,
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--color-gray-150)",
              }}
            >
              <div style={{ padding: "10px 12px", fontWeight: 700, fontSize: 13, borderBottom: "1px solid var(--color-gray-100)" }}>
                Notifications
              </div>
              <ul>
                {items.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={a.href}
                      onClick={() => setOpen(false)}
                      className="block hover:bg-gray-50"
                      style={{ padding: "10px 12px", textDecoration: "none" }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                      <div className="text-gray-500 truncate" style={{ fontSize: 12 }}>
                        {a.detail}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Avatar name="Zack Vivas" size={28} />
      </div>
    </header>
  );
}
