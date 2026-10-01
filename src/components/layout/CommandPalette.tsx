"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Calendar,
  ClipboardList,
  PhoneCall,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import {
  searchDemoClients,
  searchDemoJobs,
  searchDemoLeads,
  clientDisplayName,
  JOB_BUCKET_META,
  LEAD_STAGE_LABELS,
} from "@/lib/demo/crm";
import { formatPhone } from "@/lib/utils";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "/" && !open) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return { clients: [], jobs: [], leads: [] };
    return {
      clients: searchDemoClients(query).slice(0, 5),
      jobs: searchDemoJobs(query).slice(0, 4),
      leads: searchDemoLeads(query).slice(0, 4),
    };
  }, [q]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ paddingTop: "12vh" }}>
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0"
        style={{ background: "rgba(16,24,40,.25)", border: "none" }}
        onClick={() => onOpenChange(false)}
      />
      <Command
        label="Command palette"
        className="relative bg-white overflow-hidden"
        style={{
          width: "min(640px, calc(100vw - 24px))",
          borderRadius: 16,
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-gray-150)",
        }}
      >
        <div className="flex items-center" style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-gray-150)", gap: 8 }}>
          <Search size={16} className="text-gray-500" />
          <Command.Input
            value={q}
            onValueChange={setQ}
            placeholder="Search by phone — try 303-903 — or jump to a page"
            className="flex-1 bg-transparent"
            style={{ border: "none", outline: "none", fontSize: 14, height: 28 }}
          />
        </div>
        <Command.List style={{ maxHeight: 380, overflow: "auto", padding: "8px 6px" }}>
          <Command.Empty style={{ padding: 16, fontSize: 13, color: "var(--color-gray-600)" }}>
            No matches. Try a phone fragment like 303-903.
          </Command.Empty>
          <Group heading="Quick actions">
            <Item icon={<Plus size={14} />} onSelect={() => go("/clients")} label="New client" hint="C" />
            <Item icon={<Sparkles size={14} />} onSelect={() => go("/leads")} label="New lead" hint="L" />
            <Item icon={<PhoneCall size={14} />} onSelect={() => go("/phone-agent")} label="Log a call" hint="P" />
            <Item icon={<ClipboardList size={14} />} onSelect={() => go("/stock")} label="Receive shipment" />
          </Group>
          {results.clients.length > 0 && (
            <Group heading="Clients">
              {results.clients.map((c) => (
                <Item
                  key={c.id}
                  icon={<Users size={14} />}
                  onSelect={() => go(`/clients/${c.id}`)}
                  label={clientDisplayName(c)}
                  meta={`${formatPhone(c.phone)} · ${c.city}`}
                />
              ))}
            </Group>
          )}
          {results.leads.length > 0 && (
            <Group heading="Leads">
              {results.leads.map((l) => (
                <Item
                  key={l.id}
                  icon={<Sparkles size={14} />}
                  onSelect={() => go(`/leads/${l.id}`)}
                  label={`${l.firstName} ${l.lastName}`}
                  meta={`${LEAD_STAGE_LABELS[l.stage]} · ${l.vehicle}`}
                />
              ))}
            </Group>
          )}
          {results.jobs.length > 0 && (
            <Group heading="Jobs">
              {results.jobs.map((j) => (
                <Item
                  key={j.id}
                  icon={<ClipboardList size={14} />}
                  onSelect={() => go(`/invoices/${j.invoiceId}`)}
                  label={`${j.manufacturer} ${j.model}`}
                  meta={`${JOB_BUCKET_META[j.bucket].short} · ${j.vehicle}`}
                />
              ))}
            </Group>
          )}
          <Group heading="Pages">
            <Item icon={<Calendar size={14} />} onSelect={() => go("/schedule")} label="Schedule" />
            <Item icon={<ClipboardList size={14} />} onSelect={() => go("/jobs")} label="Jobs board" />
            <Item icon={<Sparkles size={14} />} onSelect={() => go("/leads")} label="Leads pipeline" />
          </Group>
        </Command.List>
        <div
          className="flex items-center text-gray-500"
          style={{ padding: "8px 14px", borderTop: "1px solid var(--color-gray-150)", fontSize: 11, gap: 12 }}
        >
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc</span>
        </div>
      </Command>
    </div>
  );
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  icon,
  label,
  meta,
  hint,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  meta?: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center rounded-md data-[selected=true]:bg-gray-50"
      style={{ padding: "8px 8px", gap: 10, fontSize: 13, cursor: "pointer" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-sm text-gray-600 bg-gray-50"
        style={{ width: 24, height: 24 }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block truncate font-medium">{label}</span>
        {meta && <span className="block truncate text-gray-500 font-normal" style={{ fontSize: 12 }}>{meta}</span>}
      </span>
      {hint && (
        <kbd className="text-gray-400" style={{ fontSize: 11, border: "1px solid var(--color-gray-150)", borderRadius: 4, padding: "1px 5px" }}>
          {hint}
        </kbd>
      )}
    </Command.Item>
  );
}
