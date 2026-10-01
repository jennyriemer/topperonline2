"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MondayBoard, ItemPanel, type BoardColumn, type BoardGroup, type BoardView } from "@/components/board";
import { Button } from "@/components/ui";
import { useToast } from "@/components/layout/Toast";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  DEMO_LEADS,
  LEAD_SOURCE_LABEL,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
  LEGACY_LEAD_STAGE_MAP,
  type DemoLead,
  type LeadSource,
  type LeadStage,
} from "@/lib/demo/crm";
import {
  HEALTH_STATUS,
  LEAD_STAGE_STATUS,
  SOURCE_STATUS,
  defaultLeadOwner,
  optionById,
  STAFF,
} from "@/lib/monday";

type LeadRow = DemoLead & { ownerId: string };

type GroupBy = "stage" | "source" | "owner" | "health";

function coerceIso(value: unknown): string {
  if (value == null || value === "") return new Date().toISOString();
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
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
    lastContactAt: coerceIso(raw.lastContactAt),
    createdAt: coerceIso(raw.createdAt),
    daysInStage: 1,
    traffic: "green",
    aiHandled: Boolean(raw.aiHandled),
    activity: [],
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>(() => DEMO_LEADS.map((l) => ({ ...l, ownerId: defaultLeadOwner(l.id) })));
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("stage");
  const [view, setView] = useState<BoardView>("table");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data: { leads?: Array<Record<string, unknown>> }) => {
        const extras: LeadRow[] = (data.leads ?? [])
          .filter((l) => typeof l.id === "string" && !String(l.id).startsWith("demo-"))
          .map(adaptApiLead)
          .filter((l): l is DemoLead => !!l)
          .map((l) => ({ ...l, ownerId: defaultLeadOwner(l.id) }));
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
    return leads
      .filter((l) => {
        if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
        if (personFilter !== "all" && l.ownerId !== personFilter) return false;
        if (!q) return true;
        return [l.firstName, l.lastName, l.vehicle, l.interest, l.phone, l.email].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => (sortDir === "desc" ? b.estimatedValue - a.estimatedValue : a.estimatedValue - b.estimatedValue));
  }, [leads, search, sourceFilter, personFilter, sortDir]);

  const groups: BoardGroup<LeadRow>[] = useMemo(() => {
    if (groupBy === "source") {
      return SOURCE_STATUS.map((s) => ({
        id: s.id,
        title: s.label,
        color: s.color,
        items: filtered.filter((l) => l.source === s.id),
      }));
    }
    if (groupBy === "owner") {
      return STAFF.map((p) => ({
        id: p.id,
        title: p.name,
        color: optionById(LEAD_STAGE_STATUS, "contacted")!.color,
        items: filtered.filter((l) => l.ownerId === p.id),
      })).filter((g) => g.items.length);
    }
    if (groupBy === "health") {
      return HEALTH_STATUS.map((s) => ({
        id: s.id,
        title: s.label,
        color: s.color,
        items: filtered.filter((l) => l.traffic === s.id),
      }));
    }
    return LEAD_STAGE_STATUS.map((s) => ({
      id: s.id,
      title: s.label,
      color: s.color,
      items: filtered.filter((l) => l.stage === s.id),
    }));
  }, [filtered, groupBy]);

  const patch = (id: string, next: Partial<LeadRow>, undoable = true, message?: string) => {
    const prev = leads.find((l) => l.id === id);
    setLeads((list) => list.map((l) => (l.id === id ? { ...l, ...next } : l)));
    if (prev && next.stage && next.stage !== prev.stage && !id.startsWith("demo-")) {
      fetch(`/api/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: next.stage }),
      }).catch(() => {});
    }
    if (undoable && prev && message) {
      push(message, () => patch(id, prev, false));
    }
  };

  const move = (id: string, toGroup: string) => {
    const prev = leads.find((l) => l.id === id);
    if (!prev) return;
    if (groupBy === "stage") {
      patch(id, { stage: toGroup as LeadStage, lastContactAt: new Date().toISOString(), daysInStage: 0, traffic: "green" }, true, `Moved ${prev.firstName} to ${LEAD_STAGE_LABELS[toGroup as LeadStage]}`);
    } else if (groupBy === "source") {
      patch(id, { source: toGroup as LeadSource }, true, `Source → ${LEAD_SOURCE_LABEL[toGroup as LeadSource]}`);
    } else if (groupBy === "owner") {
      patch(id, { ownerId: toGroup }, true, `Assigned to ${STAFF.find((s) => s.id === toGroup)?.name ?? "owner"}`);
    } else {
      patch(id, { traffic: toGroup as LeadRow["traffic"] }, true, "Health updated");
    }
  };

  const addItem = (groupId?: string) => {
    const id = `demo-l-new-${Date.now()}`;
    const stage = groupBy === "stage" && groupId ? (groupId as LeadStage) : "new_lead";
    const row: LeadRow = {
      id,
      firstName: "New",
      lastName: "lead",
      phone: "",
      email: "",
      source: groupBy === "source" && groupId ? (groupId as LeadSource) : "website",
      vehicle: "",
      bedSize: "",
      color: "",
      interest: "",
      stage,
      estimatedValue: 0,
      lastContactAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      daysInStage: 0,
      traffic: "green",
      aiHandled: false,
      activity: [{ id: "n", at: new Date().toISOString(), kind: "staff", title: "Created", body: "Added from the board." }],
      ownerId: groupBy === "owner" && groupId ? groupId : "nate",
    };
    setLeads((list) => [row, ...list]);
    setOpenId(id);
  };

  const columns: BoardColumn<LeadRow>[] = [
    {
      id: "stage",
      header: "Status",
      kind: "status",
      width: 150,
      getStatus: (r) => r.stage,
      statusOptions: LEAD_STAGE_STATUS,
      onStatus: (r, id) =>
        patch(r.id, { stage: id as LeadStage, lastContactAt: new Date().toISOString(), daysInStage: 0, traffic: "green" }, true, `Status → ${LEAD_STAGE_LABELS[id as LeadStage]}`),
    },
    {
      id: "health",
      header: "Health",
      kind: "status",
      width: 130,
      getStatus: (r) => r.traffic,
      statusOptions: HEALTH_STATUS,
      onStatus: (r, id) => patch(r.id, { traffic: id as LeadRow["traffic"] }),
    },
    {
      id: "owner",
      header: "Owner",
      kind: "person",
      width: 140,
      getPerson: (r) => r.ownerId,
      onPerson: (r, id) => patch(r.id, { ownerId: id }),
    },
    {
      id: "source",
      header: "Source",
      kind: "status",
      width: 130,
      getStatus: (r) => r.source,
      statusOptions: SOURCE_STATUS,
      onStatus: (r, id) => patch(r.id, { source: id as LeadSource }),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      kind: "text",
      width: 170,
      getText: (r) => r.vehicle,
      onText: (r, t) => patch(r.id, { vehicle: t }),
    },
    {
      id: "contact",
      header: "Last contact",
      kind: "date",
      width: 130,
      getDate: (r) => r.lastContactAt,
      onDate: (r, iso) => patch(r.id, { lastContactAt: iso }),
    },
    {
      id: "value",
      header: "Deal value",
      kind: "number",
      width: 120,
      getNumber: (r) => r.estimatedValue,
    },
  ];

  const open = leads.find((l) => l.id === openId) ?? null;

  return (
    <div>
      <MondayBoard
        title="Leads"
        color="#fdab3d"
        groups={groups}
        columns={columns}
        getName={(r) => `${r.firstName} ${r.lastName}`.trim()}
        onRename={(r, name) => {
          const parts = name.trim().split(/\s+/);
          patch(r.id, { firstName: parts[0] || r.firstName, lastName: parts.slice(1).join(" ") });
        }}
        onMove={move}
        onOpen={(r) => setOpenId(r.id)}
        onNewItem={addItem}
        newItemLabel="New lead"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search leads — try Kim or 555"
        personFilter={personFilter}
        onPersonFilter={setPersonFilter}
        getPersonId={(r) => r.ownerId}
        sortLabel={sortDir === "desc" ? "Value ↓" : "Value ↑"}
        onSort={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
        groupByLabel={groupBy}
        groupByOptions={[
          { id: "stage", label: "Status" },
          { id: "source", label: "Source" },
          { id: "owner", label: "Owner" },
          { id: "health", label: "Health" },
        ]}
        onGroupBy={(id) => setGroupBy(id as GroupBy)}
        filterSlot={
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | "all")}
            style={{ height: 32, border: "1px solid var(--color-gray-150)", borderRadius: 4, padding: "0 8px", fontSize: 13, background: "white" }}
          >
            <option value="all">All sources</option>
            {(Object.keys(LEAD_SOURCE_LABEL) as LeadSource[]).map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        }
        getDate={(r) => r.lastContactAt}
        sumItems={(items) => items.reduce((s, l) => s + l.estimatedValue, 0)}
        view={view}
        onViewChange={setView}
      />

      <ItemPanel
        open={!!open}
        title={open ? `${open.firstName} ${open.lastName}` : ""}
        subtitle={open ? `${LEAD_STAGE_LABELS[open.stage]} · ${formatCurrency(open.estimatedValue)}` : ""}
        onClose={() => setOpenId(null)}
        updates={
          open
            ? open.activity.map((a) => ({
                id: a.id,
                at: a.at,
                author: a.kind === "ai" || a.kind === "email" ? "Sarah AI" : a.kind === "customer" ? `${open.firstName} ${open.lastName}` : "Nate Brooks",
                title: a.title,
                body: a.body,
              }))
            : []
        }
        files={
          open
            ? [
                ...(open.intakeEmail ? [{ name: `${open.firstName}-intake.eml`, size: "4 KB", kind: "doc" as const }] : []),
                { name: `${open.vehicle || "vehicle"}-notes.pdf`, size: "128 KB", kind: "pdf" as const },
              ]
            : []
        }
        info={
          open
            ? [
                { label: "Phone", value: formatPhone(open.phone) || "—" },
                { label: "Email", value: open.email || "—" },
                { label: "Source", value: LEAD_SOURCE_LABEL[open.source] },
                { label: "Vehicle", value: open.vehicle || "—" },
                { label: "Bed / color", value: `${open.bedSize || "—"} · ${open.color || "—"}` },
                { label: "Want", value: open.interest || "—" },
                { label: "Stage", value: LEAD_STAGE_LABELS[open.stage] },
                { label: "Days in stage", value: String(open.daysInStage) },
                { label: "AI intake", value: open.aiHandled ? "On" : "Human-owned" },
              ]
            : []
        }
        onAddUpdate={(text) => {
          if (!open) return;
          patch(open.id, {
            activity: [
              { id: `u-${Date.now()}`, at: new Date().toISOString(), kind: "staff", title: "Update", body: text },
              ...open.activity,
            ],
          });
        }}
        footer={
          open ? (
            <Link href={`/leads/${open.id}`}>
              <Button variant="filled" className="w-full">
                Open full lead
              </Button>
            </Link>
          ) : null
        }
      />
    </div>
  );
}
