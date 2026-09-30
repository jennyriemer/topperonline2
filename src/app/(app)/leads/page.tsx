"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Car, Filter, Mail, MessageSquare, Plus } from "lucide-react";
import { PageHeader, Button, Avatar } from "@/components/ui";
import { TrafficLightDot } from "@/components/ui/TrafficLight";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { DndKanban, KanbanCardShell } from "@/components/kanban/DndKanban";
import { useToast } from "@/components/layout/Toast";
import { formatCurrency } from "@/lib/utils";
import {
  DEMO_LEADS,
  LEAD_SOURCE_LABEL,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
  LEGACY_LEAD_STAGE_MAP,
  NUDGE_AFTER_DAYS,
  TRAFFIC_RED_DAYS,
  TRAFFIC_YELLOW_DAYS,
  type DemoLead,
  type LeadSource,
  type LeadStage,
} from "@/lib/demo/crm";

const STAGE_DOT: Record<LeadStage, string> = {
  new_lead: "#8F99A8",
  contacted: "#0E4CA1",
  conversation: "#9B69FF",
  sale_pending: "#F5B900",
  in_order: "#0FC27B",
};

const SOURCE_PILL: Record<LeadSource, { bg: string; fg: string }> = {
  website: { bg: "var(--color-info-bg)", fg: "var(--color-info-fg)" },
  phone_call: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)" },
  walk_in: { bg: "var(--color-purple-bg)", fg: "var(--color-purple-fg)" },
  referral: { bg: "var(--color-yellow-100)", fg: "var(--color-yellow-700)" },
  google_ads: { bg: "var(--color-pink-bg)", fg: "var(--color-pink-fg)" },
  facebook: { bg: "var(--color-teal-bg)", fg: "var(--color-teal-fg)" },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [search, setSearch] = useState("");
  const { push } = useToast();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data: { leads?: Array<Record<string, unknown>> }) => {
        const extras: DemoLead[] = (data.leads ?? [])
          .filter((l) => typeof l.id === "string" && !String(l.id).startsWith("demo-"))
          .map(adaptApiLead)
          .filter((l): l is DemoLead => !!l);
        if (extras.length) {
          setLeads((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            return [...prev, ...extras.filter((e) => !ids.has(e.id))];
          });
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return [l.firstName, l.lastName, l.vehicle, l.interest, l.phone, l.email].join(" ").toLowerCase().includes(q);
    });
  }, [leads, search, sourceFilter]);

  const byStage = useMemo(() => {
    const map = new Map<LeadStage, DemoLead[]>();
    LEAD_STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((l) => map.get(l.stage)?.push(l));
    return map;
  }, [filtered]);

  const move = (id: string, stage: LeadStage, undoable = true) => {
    const prev = leads.find((l) => l.id === id);
    setLeads((list) =>
      list.map((l) => (l.id === id ? { ...l, stage, lastContactAt: new Date().toISOString(), daysInStage: 0, traffic: "green" } : l))
    );
    if (!id.startsWith("demo-")) {
      fetch(`/api/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      }).catch(() => {});
    }
    if (undoable && prev) {
      push(`Moved ${prev.firstName} ${prev.lastName} to ${LEAD_STAGE_LABELS[stage]}`, () => move(id, prev.stage, false));
    }
  };

  const columns = LEAD_STAGES.map((stage) => {
    const items = byStage.get(stage) ?? [];
    return {
      id: stage,
      title: LEAD_STAGE_LABELS[stage],
      dot: STAGE_DOT[stage],
      items,
      sum: items.reduce((s, l) => s + l.estimatedValue, 0),
    };
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Pipelines" }, { label: "Leads & Outreach" }]}
        title="Leads pipeline"
        subtitle={`New → Contacted → Conversation → Sale pending → In order. Green under ${TRAFFIC_YELLOW_DAYS}d, yellow ${TRAFFIC_YELLOW_DAYS}–${TRAFFIC_RED_DAYS - 1}, red at ${TRAFFIC_RED_DAYS}+. Nudge after ${NUDGE_AFTER_DAYS} quiet days.`}
        actions={
          <Link href="/leads/demo-l-01">
            <Button variant="filled" leadingIcon={<Plus size={14} />}>
              Open a sample lead
            </Button>
          </Link>
        }
      />

      <div style={{ padding: "20px 24px 40px" }}>
        <SampleBanner>
          “AI Contacted” is gone as a column. Website intake email is activity at New lead, signed as an AI agent on behalf of Suburban Toppers.
        </SampleBanner>

        <div className="flex items-center flex-wrap bg-white" style={{ padding: 10, marginBottom: 16, borderRadius: 12, border: "1px solid var(--color-gray-150)", gap: 8 }}>
          <span className="text-gray-500 flex items-center" style={{ gap: 6, fontSize: 13 }}>
            <Filter size={14} /> Where source is
          </span>
          <Pill active={sourceFilter === "all"} onClick={() => setSourceFilter("all")}>All</Pill>
          {(Object.keys(LEAD_SOURCE_LABEL) as LeadSource[]).map((src) => (
            <Pill key={src} active={sourceFilter === src} onClick={() => setSourceFilter(src)}>
              {LEAD_SOURCE_LABEL[src]}
            </Pill>
          ))}
          <div className="flex-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="rounded-lg"
            style={{ height: 32, width: 220, padding: "0 12px", border: "1px solid var(--color-gray-150)", fontSize: 13, outline: "none" }}
          />
        </div>

        <DndKanban
          columns={columns}
          onMove={(id, col) => move(id, col as LeadStage)}
          renderCard={(lead) => <LeadCard lead={lead} />}
        />
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: DemoLead }) {
  const pill = SOURCE_PILL[lead.source];
  return (
    <KanbanCardShell>
      <div className="flex items-start justify-between" style={{ gap: 8 }}>
        <Link href={`/leads/${lead.id}`} className="hover:underline" style={{ fontSize: 14, fontWeight: 600 }}>
          {lead.firstName} {lead.lastName}
        </Link>
        <TrafficLightDot value={lead.traffic} />
      </div>
      <Row icon={<Car size={14} />}>
        {lead.vehicle}{lead.bedSize ? ` · ${lead.bedSize}` : ""}
      </Row>
      <Row>{lead.interest}</Row>
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, padding: "2px 8px", borderRadius: 6, background: pill.bg, color: pill.fg }}>
          {LEAD_SOURCE_LABEL[lead.source]}
        </span>
        <span className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(lead.estimatedValue)}</span>
      </div>
      <div className="flex items-center" style={{ marginTop: 10, gap: 8 }}>
        <Avatar name={`${lead.firstName} ${lead.lastName}`} size={20} />
        {lead.intakeEmail && lead.stage === "new_lead" && (
          <span className="inline-flex items-center text-gray-500" style={{ fontSize: 11, gap: 4 }}>
            <Mail size={12} /> Intake sent
          </span>
        )}
        <span className="ml-auto inline-flex items-center text-gray-400" style={{ fontSize: 11, gap: 4 }}>
          <MessageSquare size={12} />
          <span
            style={{
              color: lead.traffic === "red" ? "var(--color-danger-fg)" : lead.traffic === "yellow" ? "var(--color-warning-fg)" : "var(--color-gray-500)",
            }}
          >
            {lead.daysInStage}d
          </span>
        </span>
      </div>
    </KanbanCardShell>
  );
}

function Row({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center text-gray-600" style={{ gap: 6, marginTop: 6, fontSize: 12 }}>
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md"
      style={{
        height: 26,
        padding: "0 10px",
        fontSize: 12,
        fontWeight: 500,
        background: active ? "var(--color-brand-100)" : "var(--color-gray-50)",
        color: active ? "var(--color-brand-700)" : "var(--color-gray-700)",
        border: "none",
      }}
    >
      {children}
    </button>
  );
}

function adaptApiLead(raw: Record<string, unknown>): DemoLead | null {
  const id = String(raw.id ?? "");
  const stage = LEGACY_LEAD_STAGE_MAP[String(raw.stage ?? "new_lead")] ?? "new_lead";
  const first = String(raw.firstName ?? "");
  if (!id || !first) return null;
  return {
    id,
    firstName: first,
    lastName: String(raw.lastName ?? ""),
    phone: String(raw.phone ?? ""),
    email: String(raw.email ?? ""),
    source: (raw.source as LeadSource) || "website",
    vehicle: String(raw.vehicle ?? ""),
    bedSize: "",
    color: "",
    interest: String(raw.interest ?? ""),
    stage,
    estimatedValue: Number(raw.estimatedValue ?? 0),
    lastContactAt: String(raw.lastContactAt ?? new Date().toISOString()),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    daysInStage: 1,
    traffic: "green",
    aiHandled: Boolean(raw.aiHandled),
    activity: [],
  };
}
