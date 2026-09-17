"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Car, Filter, Mail, Plus, Sparkles } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { FunnelCard } from "@/components/charts/FunnelCard";
import { TrafficLightDot } from "@/components/ui/TrafficLight";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<DemoLead[]>(DEMO_LEADS);
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [search, setSearch] = useState("");

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
      .catch(() => {
        /* demo leads are enough */
      });
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

  const move = (id: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage, lastContactAt: new Date().toISOString(), daysInStage: 0, traffic: "green" } : l)));
    if (!id.startsWith("demo-")) {
      fetch(`/api/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      }).catch(() => {});
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Leads & Outreach" }]}
        title="Leads pipeline"
        subtitle={`New → Contacted → Conversation → Sale Pending → In Order. Traffic lights: green under ${TRAFFIC_YELLOW_DAYS} days, yellow ${TRAFFIC_YELLOW_DAYS}–${TRAFFIC_RED_DAYS - 1}, red at ${TRAFFIC_RED_DAYS}+. Staff nudge after ${NUDGE_AFTER_DAYS} quiet days.`}
        actions={
          <Link href="/leads/demo-l-01">
            <Button variant="filled" leadingIcon={<Plus size={16} />}>
              Open a sample lead
            </Button>
          </Link>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          “AI Contacted” is gone as a column. Website intake email is activity at New Lead, signed as an
          AI agent on behalf of Suburban Toppers. Staff still send the human follow-up.
        </SampleBanner>

        <div
          className="grid bg-paper rounded-md"
          style={{
            gridTemplateColumns: "repeat(5, 1fr)",
            marginBottom: "16px",
            boxShadow: "var(--shadow-card)",
            overflow: "hidden",
          }}
        >
          {LEAD_STAGES.map((stage, i) => {
            const list = byStage.get(stage) ?? [];
            const value = list.reduce((s, l) => s + l.estimatedValue, 0);
            return (
              <div
                key={stage}
                style={{
                  padding: "16px 18px",
                  borderRight: i < 4 ? "1px solid var(--color-chalk)" : undefined,
                }}
              >
                <div className="text-slate" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {LEAD_STAGE_LABELS[stage]}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600, marginTop: "4px" }}>
                  {list.length}
                </div>
                <div className="text-slate" style={{ fontSize: "13px" }}>
                  {formatCurrency(value)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center bg-paper rounded-md flex-wrap"
          style={{ padding: "12px 16px", marginBottom: "16px", boxShadow: "var(--shadow-card)", gap: "8px" }}
        >
          <span className="text-slate flex items-center" style={{ gap: "6px", fontSize: "13px", fontWeight: 500, paddingRight: "8px", borderRight: "1px solid var(--color-chalk)" }}>
            <Filter size={14} /> Source
          </span>
          <Pill active={sourceFilter === "all"} onClick={() => setSourceFilter("all")}>
            All
          </Pill>
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
            className="rounded-md"
            style={{
              height: "32px",
              width: "220px",
              padding: "0 12px",
              border: "1px solid var(--color-chalk)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            overflowX: "auto",
            marginLeft: "-32px",
            marginRight: "-32px",
            padding: "0 32px 8px",
            marginBottom: "24px",
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: "repeat(5, 280px)", gap: "16px" }}>
            {LEAD_STAGES.map((stage) => (
              <div key={stage} className="bg-paper rounded-md" style={{ boxShadow: "var(--shadow-card)", minHeight: "240px" }}>
                <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-chalk)" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{LEAD_STAGE_LABELS[stage]}</span>
                  <span className="text-graphite" style={{ fontSize: "12px", fontWeight: 600 }}>
                    {(byStage.get(stage) ?? []).length}
                  </span>
                </div>
                <div className="flex flex-col" style={{ gap: "8px", padding: "12px" }}>
                  {(byStage.get(stage) ?? []).map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onMove={move} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <FunnelCard
          title="Lead pipeline"
          subtitle={`${filtered.length} leads in view`}
          stages={LEAD_STAGES.map((s) => ({
            label: LEAD_STAGE_LABELS[s],
            count: (byStage.get(s) ?? []).length,
            href: `/leads?stage=${s}`,
          }))}
        />
      </div>
    </div>
  );
}

function LeadCard({ lead, onMove }: { lead: DemoLead; onMove: (id: string, stage: LeadStage) => void }) {
  const next = LEAD_STAGES[LEAD_STAGES.indexOf(lead.stage) + 1];
  return (
    <div className="rounded-md" style={{ padding: "12px", background: "var(--color-fog)" }}>
      <div className="flex items-start justify-between" style={{ gap: "8px" }}>
        <Link href={`/leads/${lead.id}`} className="text-carbon hover:underline" style={{ fontSize: "13px", fontWeight: 600 }}>
          {lead.firstName} {lead.lastName}
        </Link>
        <TrafficLightDot value={lead.traffic} />
      </div>
      <div className="flex items-center text-slate" style={{ gap: "4px", marginTop: "4px", fontSize: "11px" }}>
        <Car size={11} /> {lead.vehicle}
        {lead.bedSize ? ` · ${lead.bedSize}` : ""}
      </div>
      <div className="text-graphite truncate" style={{ fontSize: "11px", marginTop: "2px" }}>
        {lead.interest}
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: "8px" }}>
        <span
          className="rounded-md text-graphite"
          style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", background: "var(--color-chalk)", letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          {LEAD_SOURCE_LABEL[lead.source]}
        </span>
        <span className="text-carbon" style={{ fontSize: "12px", fontWeight: 600 }}>
          {formatCurrency(lead.estimatedValue)}
        </span>
      </div>
      <div className="flex items-center flex-wrap" style={{ gap: "6px", marginTop: "8px" }}>
        {lead.intakeEmail && lead.stage === "new_lead" && (
          <span className="inline-flex items-center text-signal-orange" style={{ fontSize: "10px", fontWeight: 600, gap: "3px" }}>
            <Mail size={10} /> AI intake sent
          </span>
        )}
        {lead.nudge && (
          <span className="inline-flex items-center text-status-amber" style={{ fontSize: "10px", fontWeight: 600, gap: "3px" }}>
            <Sparkles size={10} /> Nudge
          </span>
        )}
        {lead.id.startsWith("demo-") && <SampleBadge />}
      </div>
      {next && (
        <button
          type="button"
          onClick={() => onMove(lead.id, next)}
          className="text-signal-orange"
          style={{ marginTop: "8px", fontSize: "11px", fontWeight: 600, background: "none", border: "none", padding: 0 }}
        >
          Move to {LEAD_STAGE_LABELS[next]} →
        </button>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl"
      style={{
        height: "28px",
        padding: "0 12px",
        fontSize: "13px",
        fontWeight: 500,
        background: active ? "var(--color-carbon)" : "var(--color-fog)",
        color: active ? "var(--color-paper)" : "var(--color-graphite)",
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
  const last = String(raw.lastName ?? "");
  if (!id || !first) return null;
  return {
    id,
    firstName: first,
    lastName: last,
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
