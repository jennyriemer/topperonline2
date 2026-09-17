"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Search, Sparkles } from "lucide-react";
import {
  searchDemoClients,
  searchDemoJobs,
  searchDemoLeads,
  clientDisplayName,
  JOB_BUCKET_META,
  LEAD_STAGE_LABELS,
} from "@/lib/demo/crm";
import { formatPhone } from "@/lib/utils";

export function TopBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return [];
    const clients = searchDemoClients(query).slice(0, 4).map((c) => ({
      id: c.id,
      href: `/clients/${c.id}`,
      kicker: "Client",
      title: clientDisplayName(c),
      detail: `${formatPhone(c.phone)} · ${c.city}`,
    }));
    const jobs = searchDemoJobs(query).slice(0, 3).map((j) => ({
      id: j.id,
      href: `/invoices/${j.invoiceId}`,
      kicker: JOB_BUCKET_META[j.bucket].short,
      title: `${j.manufacturer} ${j.model}`,
      detail: j.vehicle,
    }));
    const leads = searchDemoLeads(query).slice(0, 3).map((l) => ({
      id: l.id,
      href: `/leads/${l.id}`,
      kicker: LEAD_STAGE_LABELS[l.stage],
      title: `${l.firstName} ${l.lastName}`,
      detail: `${formatPhone(l.phone)} · ${l.vehicle}`,
    }));
    return [...clients, ...jobs, ...leads];
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (href?: string) => {
    setOpen(false);
    if (href) {
      router.push(href);
      return;
    }
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md"
      style={{
        padding: "12px 32px",
        borderBottom: "1px solid var(--color-chalk)",
      }}
    >
      <div className="flex items-center" style={{ gap: "16px" }}>
        <div ref={wrapRef} className="relative flex-1" style={{ maxWidth: "720px" }}>
          <div
            className="flex items-center bg-paper rounded-md"
            style={{
              height: "44px",
              padding: "0 12px",
              gap: "10px",
              border: open ? "1.5px solid var(--color-carbon)" : "1px solid var(--color-chalk)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Phone size={16} strokeWidth={2} className="text-signal-orange shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(results[active]?.href);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Search by phone — try 303-903 — or name / company"
              className="flex-1 bg-transparent text-carbon placeholder:text-slate"
              style={{ border: "none", outline: "none", fontSize: "14px", minWidth: 0 }}
              aria-label="Phone-first global search"
            />
            <kbd
              className="text-slate hidden sm:inline"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 6px",
                border: "1px solid var(--color-chalk)",
                borderRadius: "4px",
                background: "var(--color-fog)",
              }}
            >
              ⌘K
            </kbd>
            <Search size={16} strokeWidth={2} className="text-slate shrink-0" />
          </div>

          {open && q.trim().length >= 2 && (
            <div
              className="absolute bg-paper rounded-md overflow-hidden"
              style={{
                top: "52px",
                left: 0,
                right: 0,
                boxShadow: "0 12px 32px rgba(32,32,32,0.12)",
                border: "1px solid var(--color-chalk)",
                zIndex: 40,
              }}
            >
              {results.length === 0 ? (
                <div className="text-slate" style={{ padding: "16px", fontSize: "13px" }}>
                  No matches. Press Enter for full results.
                </div>
              ) : (
                <ul>
                  {results.map((r, i) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r.href)}
                        className="w-full text-left"
                        style={{
                          padding: "10px 14px",
                          background: i === active ? "var(--color-fog)" : "transparent",
                          border: "none",
                        }}
                      >
                        <div className="flex items-center justify-between" style={{ gap: "8px" }}>
                          <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                            {r.title}
                          </span>
                          <span className="text-slate" style={{ fontSize: "11px", fontWeight: 600 }}>
                            {r.kicker}
                          </span>
                        </div>
                        <div className="text-graphite" style={{ fontSize: "12px", marginTop: "2px" }}>
                          {r.detail}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => go()}
                className="w-full text-left text-signal-orange"
                style={{
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  borderTop: "1px solid var(--color-chalk)",
                  background: "transparent",
                }}
              >
                View all results for “{q.trim()}”
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center shrink-0" style={{ gap: "8px" }}>
          <span
            className="rounded-xl text-graphite hidden md:inline-flex items-center"
            style={{
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 10px",
              background: "var(--color-paper)",
              border: "1px solid var(--color-chalk)",
              gap: "6px",
            }}
          >
            <Sparkles size={12} strokeWidth={2} className="text-signal-orange" />
            Layout mock · sample records
          </span>
        </div>
      </div>
    </div>
  );
}
