"use client";

/**
 * ClientsTable — client-side interactive table for the Clients page.
 *
 * Wired to real data (Supabase, ~98k clients). Since we can't ship the
 * whole table to the browser, the page loads a capped initial page
 * (most-recently-added 200 clients) server-side, and this component
 * re-queries /api/clients (debounced) whenever search/filter changes.
 *
 * Drawer open/close still lives in the URL (?id=...) so it's linkable /
 * back-button-friendly, same as the original mockup.
 */

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Download, Filter, Phone, Plus, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, Button, SearchInput, DataTable, PageHeader, StatusBadge } from "@/components/ui";
import { ClientDrawer } from "@/components/clients/ClientDrawer";
import type { ClientListRow } from "@/lib/data/clients";
import { textColumn, dateColumn, currencyColumn } from "@/lib/columns";
import { formatPhone } from "@/lib/utils";
import { statusToVariant } from "@/lib/mock-data";
import {
  DEMO_CLIENTS,
  DEMO_INVOICES,
  JOB_BUCKET_META,
  getDemoJob,
  invoiceTotals,
  jobsForClient,
  phoneMatches,
} from "@/lib/demo/crm";

const FILTERS: { key: "all" | "commercial" | "residential"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "commercial", label: "Commercial" },
  { key: "residential", label: "Residential" },
];

function demoToRow(c: (typeof DEMO_CLIENTS)[number]): ClientListRow {
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
    lastInvoiceStatusLabel: meta?.short ?? "Sample",
    lastInvoiceStatusVariant: job?.bucket === "paid" ? "paid" : job?.bucket === "waiting_payment" ? "overdue" : "pending",
    totalInvoices: jobs.length,
    totalSpend: spend,
  };
}

const DEMO_ROWS = DEMO_CLIENTS.map(demoToRow);

interface ClientsTableProps {
  initialClients: ClientListRow[];
  initialTotalMatching: number;
}

export function ClientsTable(props: ClientsTableProps) {
  return (
    <Suspense fallback={null}>
      <ClientsTableInner {...props} />
    </Suspense>
  );
}

function ClientsTableInner({ initialClients, initialTotalMatching }: ClientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "commercial" | "residential">("all");
  const [clients, setClients] = useState(initialClients);
  const [, setTotalMatching] = useState(initialTotalMatching);
  const [, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleDemo = useMemo(() => {
    const q = search.trim();
    return DEMO_ROWS.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!q) return true;
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 3 && phoneMatches(c.phone, q)) return true;
      const blob = `${c.companyName ?? ""} ${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
      return blob.includes(q.toLowerCase());
    });
  }, [search, filter]);

  const merged = useMemo(() => {
    const rest = clients.filter((c) => !c.id.startsWith("demo-"));
    return [...visibleDemo, ...rest];
  }, [visibleDemo, clients]);

  // Drawer state — driven by ?id=1234 in the URL
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

  // Re-query the server whenever search/filter changes (debounced).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (filter !== "all") params.set("type", filter);
      fetch(`/api/clients?${params.toString()}`)
        .then((res) => res.json())
        .then((data: { clients: ClientListRow[]; totalMatching: number }) => {
          setClients(data.clients);
          setTotalMatching(data.totalMatching);
        })
        .catch((e) => console.error("Client search failed", e))
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filter]);

  const columns: ColumnDef<ClientListRow>[] = [
    textColumn<ClientListRow>({
      key: "companyName",
      header: "Company Name",
      sortKey: (c) => c.companyName ?? `${c.firstName} ${c.lastName}`,
      render: (c) => (
        <span className="inline-flex items-center" style={{ fontWeight: 600, gap: 8 }}>
          <Avatar name={c.companyName ?? `${c.firstName} ${c.lastName}`} size={20} />
          {c.companyName ?? `${c.firstName} ${c.lastName}`}
        </span>
      ),
    }),
    textColumn<ClientListRow>({ key: "lastName", header: "Last Name", sortKey: (c) => c.lastName }),
    textColumn<ClientListRow>({
      key: "phone",
      header: "Phone",
      render: (c) => (
        <span className="font-mono inline-flex items-center" style={{ fontSize: 12, gap: 6, color: "var(--color-gray-700)" }}>
          <Phone size={12} className="text-gray-400" />
          {c.phone ? formatPhone(c.phone) : "—"}
        </span>
      ),
    }),
    currencyColumn<ClientListRow>({ key: "lastInvoiceAmount", header: "Last Invoice" }),
    dateColumn<ClientListRow>({
      key: "lastInvoiceDate",
      header: "Last Invoice Date",
      format: (iso) => (iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"),
    }),
    // Custom (not the generic statusBadgeColumn helper) because we already
    // have a real, precomputed label from the server — statusBadgeColumn's
    // getLabel only derives a label from the variant, which would lose
    // the "Open / Quote" vs. "In Progress" distinction.
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const c = row.original;
        const variant = statusToVariant(c.lastInvoiceStatusVariant);
        return <StatusBadge variant={variant}>{c.lastInvoiceStatusLabel}</StatusBadge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Records" }, { label: "Clients" }]}
        title="Clients"
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download size={14} />}>
              Export
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={14} />}>
              New client
            </Button>
          </>
        }
      />

      <div style={{ padding: "16px 24px 32px" }}>
        <div className="bg-white overflow-hidden" style={{ borderRadius: 12, border: "1px solid var(--color-gray-150)" }}>
          <div className="flex items-center justify-between flex-wrap" style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-gray-150)", gap: 12 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <button type="button" className="inline-flex items-center rounded-md" style={{ height: 28, padding: "0 10px", gap: 6, fontSize: 13, fontWeight: 500, border: "1px solid var(--color-gray-150)", background: "white" }}>
                All clients <ChevronDown size={12} />
              </button>
            </div>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Button size="sm" variant="ghost">View settings</Button>
              <Button size="sm" variant="outlined" leadingIcon={<Download size={12} />}>Import / Export</Button>
              <SearchInput placeholder="Phone first — try 303-903" value={search} onChange={setSearch} style={{ width: 240 }} />
            </div>
          </div>

          <div className="flex items-center flex-wrap" style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-gray-150)", gap: 8 }}>
            <Button size="sm" variant="ghost" leadingIcon={<Filter size={13} />}>Filter</Button>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="rounded-md"
                style={{
                  height: 26,
                  padding: "0 10px",
                  fontSize: 12,
                  fontWeight: 500,
                  background: filter === f.key ? "var(--color-brand-100)" : "var(--color-gray-50)",
                  color: filter === f.key ? "var(--color-brand-700)" : "var(--color-gray-700)",
                  border: "none",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={merged}
            getRowId={(c) => c.id}
            onRowClick={(c) => router.push(`/clients/${encodeURIComponent(c.id)}`)}
            emptyIcon={Users}
            emptyTitle="No clients found"
            emptyDescription="Try a phone fragment like 303-903, or a last name."
          />

          <div
            className="flex items-center text-gray-600"
            style={{ padding: "10px 16px", borderTop: "1px solid var(--color-gray-150)", fontSize: 12, gap: 24 }}
          >
            <span>{merged.length.toLocaleString()} count</span>
            <span className="tabular">
              ${merged.reduce((s, c) => s + (c.totalSpend ?? 0), 0).toLocaleString()} sum
            </span>
            <span className="text-gray-400">+ Add calculation</span>
          </div>
        </div>
      </div>

      <ClientDrawer clientId={openClientId} open={!!openClientId} onClose={closeDrawer} />
    </div>
  );
}
