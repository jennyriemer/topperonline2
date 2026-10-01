"use client";

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { MondayBoard, ItemPanel, type BoardColumn, type BoardGroup, type BoardView } from "@/components/board";
import { Button } from "@/components/ui";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import type { ClientListRow } from "@/lib/data/clients";
import { formatPhone } from "@/lib/utils";
import {
  DEMO_CLIENTS,
  DEMO_INVOICES,
  JOB_BUCKET_META,
  getDemoJob,
  invoiceTotals,
  jobsForClient,
  notesForClient,
  phoneMatches,
} from "@/lib/demo/crm";
import { CLIENT_TYPE_STATUS, JOB_BUCKET_STATUS } from "@/lib/monday";

const FILTERS: { key: "all" | "commercial" | "residential"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "commercial", label: "Commercial" },
  { key: "residential", label: "Residential" },
];

function demoToRow(c: (typeof DEMO_CLIENTS)[number]): ClientListRow & { ownerId: string } {
  const jobs = jobsForClient(c.id);
  const latest = jobs[0];
  const inv = latest ? DEMO_INVOICES.find((i) => i.id === latest.invoiceId) : undefined;
  const job = latest ? getDemoJob(latest.id) : undefined;
  const meta = job ? JOB_BUCKET_META[job.bucket] : null;
  const spend = jobs.reduce((s, j) => {
    const i = DEMO_INVOICES.find((x) => x.id === j.invoiceId);
    return s + (i ? invoiceTotals(i).total : 0);
  }, 0);
  return {
    id: c.id,
    companyName: c.companyName,
    firstName: c.firstName,
    lastName: c.lastName,
    type: c.type,
    phone: c.phone,
    email: c.email,
    address: c.address,
    city: c.city,
    state: c.state,
    zip: c.zip,
    notes: c.notes,
    lastInvoiceNumber: inv?.number ?? null,
    lastInvoiceDate: job?.billedAt ?? job?.orderedAt ?? null,
    lastInvoiceAmount: inv ? invoiceTotals(inv).total : null,
    lastInvoiceStatusLabel: meta?.short ?? "Prospect",
    lastInvoiceStatusVariant: job?.bucket === "paid" ? "paid" : job?.bucket === "waiting_payment" ? "overdue" : "pending",
    totalInvoices: jobs.length,
    totalSpend: spend,
    ownerId: c.type === "commercial" ? "zack" : "nate",
  };
}

const DEMO_ROWS = DEMO_CLIENTS.map(demoToRow);

type ClientRow = ClientListRow & { ownerId: string };

function withOwner(c: ClientListRow): ClientRow {
  return { ...c, ownerId: c.type === "commercial" ? "zack" : "nate" };
}

type GroupBy = "type" | "status";

export function ClientsTable(props: { initialClients: ClientListRow[]; initialTotalMatching: number }) {
  return (
    <Suspense fallback={null}>
      <ClientsTableInner {...props} />
    </Suspense>
  );
}

function ClientsTableInner({ initialClients }: { initialClients: ClientListRow[]; initialTotalMatching: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "commercial" | "residential">("all");
  const [clients, setClients] = useState(initialClients.map(withOwner));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [view, setView] = useState<BoardView>("table");
  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const visibleDemo = useMemo(() => {
    const q = search.trim();
    return DEMO_ROWS.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (personFilter !== "all" && c.ownerId !== personFilter) return false;
      if (!q) return true;
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 3 && phoneMatches(c.phone, q)) return true;
      const blob = `${c.companyName ?? ""} ${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [search, filter, personFilter]);

  const merged = useMemo(() => {
    const rest = clients
      .filter((c) => !c.id.startsWith("demo-"))
      .filter((c) => {
        if (filter !== "all" && c.type !== filter) return false;
        if (personFilter !== "all" && c.ownerId !== personFilter) return false;
        return true;
      });
    const rows = [...visibleDemo, ...rest];
    return rows.sort((a, b) => (sortDir === "desc" ? (b.totalSpend ?? 0) - (a.totalSpend ?? 0) : (a.totalSpend ?? 0) - (b.totalSpend ?? 0)));
  }, [visibleDemo, clients, filter, personFilter, sortDir]);

  const openClientId = searchParams.get("id");

  const closeDrawer = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    const qs = params.toString();
    router.push(qs ? `/clients?${qs}` : "/clients");
  }, [searchParams, router]);

  useEffect(() => {
    if (!openClientId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openClientId, closeDrawer]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (filter !== "all") params.set("type", filter);
      fetch(`/api/clients?${params.toString()}`)
        .then((res) => res.json())
        .then((data: { clients: ClientListRow[]; totalMatching: number }) => {
          setClients(data.clients.map(withOwner));
        })
        .catch((e) => console.error("Client search failed", e));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filter]);

  const statusId = (c: ClientRow) => {
    if (c.lastInvoiceStatusVariant === "paid") return "paid";
    if (c.lastInvoiceStatusVariant === "overdue") return "waiting_payment";
    if (c.lastInvoiceStatusLabel.toLowerCase().includes("install")) return "waiting_install";
    if (c.lastInvoiceStatusLabel.toLowerCase().includes("arrival") || c.lastInvoiceStatusLabel.toLowerCase().includes("order"))
      return "waiting_arrival";
    return "waiting_arrival";
  };

  const groups: BoardGroup<ClientRow>[] = useMemo(() => {
    if (groupBy === "status") {
      return JOB_BUCKET_STATUS.map((s) => ({
        id: s.id,
        title: s.label,
        color: s.color,
        items: merged.filter((c) => statusId(c) === s.id),
      }));
    }
    return CLIENT_TYPE_STATUS.map((s) => ({
      id: s.id,
      title: s.label,
      color: s.color,
      items: merged.filter((c) => c.type === s.id),
    }));
  }, [merged, groupBy]);

  const columns: BoardColumn<ClientRow>[] = [
    {
      id: "type",
      header: "Type",
      kind: "status",
      width: 140,
      getStatus: (r) => r.type,
      statusOptions: CLIENT_TYPE_STATUS,
      onStatus: (r, id) => {
        setClients((list) => list.map((c) => (c.id === r.id ? { ...c, type: id as ClientRow["type"] } : c)));
      },
    },
    {
      id: "status",
      header: "Job status",
      kind: "status",
      width: 160,
      getStatus: (r) => statusId(r),
      statusOptions: JOB_BUCKET_STATUS,
    },
    {
      id: "owner",
      header: "Owner",
      kind: "person",
      width: 140,
      getPerson: (r) => r.ownerId,
      onPerson: (r, id) => setClients((list) => list.map((c) => (c.id === r.id ? { ...c, ownerId: id } : c))),
    },
    {
      id: "phone",
      header: "Phone",
      kind: "text",
      width: 150,
      getText: (r) => formatPhone(r.phone),
    },
    {
      id: "last",
      header: "Last invoice",
      kind: "date",
      width: 130,
      getDate: (r) => r.lastInvoiceDate,
    },
    {
      id: "spend",
      header: "Lifetime",
      kind: "number",
      width: 120,
      getNumber: (r) => r.totalSpend ?? 0,
    },
  ];

  const open = merged.find((c) => c.id === openId) ?? null;
  const notes = open ? notesForClient(open.id) : [];

  return (
    <div>
      <MondayBoard
        title="Clients"
        color="#00c875"
        groups={groups}
        columns={columns}
        getName={(c) => c.companyName ?? `${c.firstName} ${c.lastName}`}
        onRename={(c, name) => {
          setClients((list) =>
            list.map((row) => (row.id === c.id ? { ...row, companyName: row.companyName ? name : row.companyName, firstName: row.companyName ? row.firstName : name.split(" ")[0] } : row))
          );
        }}
        onMove={(id, to) => {
          if (groupBy === "type") {
            setClients((list) => list.map((c) => (c.id === id ? { ...c, type: to as ClientRow["type"] } : c)));
          }
        }}
        onOpen={(c) => setOpenId(c.id)}
        onNewItem={() => setOpenId(merged[0]?.id ?? null)}
        newItemLabel="New client"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Phone first — try 303-903"
        personFilter={personFilter}
        onPersonFilter={setPersonFilter}
        sortLabel={sortDir === "desc" ? "Spend ↓" : "Spend ↑"}
        onSort={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
        groupByLabel={groupBy}
        groupByOptions={[
          { id: "type", label: "Type" },
          { id: "status", label: "Job status" },
        ]}
        onGroupBy={(id) => setGroupBy(id as GroupBy)}
        filterSlot={
          <div className="flex" style={{ gap: 4 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  height: 32,
                  padding: "0 10px",
                  fontSize: 13,
                  borderRadius: 4,
                  border: "1px solid var(--color-gray-150)",
                  background: filter === f.key ? "var(--color-brand-50)" : "white",
                  fontWeight: filter === f.key ? 700 : 500,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
        getDate={(r) => r.lastInvoiceDate}
        sumItems={(items) => items.reduce((s, c) => s + (c.totalSpend ?? 0), 0)}
        view={view}
        onViewChange={setView}
        actions={
          <Button variant="outlined" leadingIcon={<Download size={14} />}>
            Export
          </Button>
        }
      />

      <ItemPanel
        open={!!open}
        title={open ? open.companyName ?? `${open.firstName} ${open.lastName}` : ""}
        subtitle={open ? `${open.city}, ${open.state} · ${open.type}` : ""}
        onClose={() => setOpenId(null)}
        updates={notes.map((n) => ({ id: n.id, at: n.createdAt, author: n.author, title: "Note", body: n.body }))}
        files={open ? [{ name: `${open.lastInvoiceNumber ?? "account"}.pdf`, size: "64 KB", kind: "pdf" as const }] : []}
        info={
          open
            ? [
                { label: "Phone", value: formatPhone(open.phone) },
                { label: "Email", value: open.email || "—" },
                { label: "Type", value: open.type },
                { label: "Address", value: `${open.address}, ${open.city}` },
                { label: "Last invoice", value: open.lastInvoiceNumber ?? "—" },
                { label: "Lifetime", value: `$${(open.totalSpend ?? 0).toLocaleString()}` },
                { label: "Jobs", value: String(open.totalInvoices) },
              ]
            : []
        }
        footer={
          open ? (
            <Link href={`/clients/${encodeURIComponent(open.id)}`}>
              <Button variant="filled" className="w-full">
                Open record
              </Button>
            </Link>
          ) : null
        }
      />

      <ClientDrawer clientId={openClientId} open={!!openClientId} onClose={closeDrawer} />
    </div>
  );
}
