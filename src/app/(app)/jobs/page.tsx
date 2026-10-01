"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive } from "lucide-react";
import { MondayBoard, ItemPanel, type BoardColumn, type BoardGroup, type BoardView } from "@/components/board";
import { Button, Modal } from "@/components/ui";
import { useToast } from "@/components/layout/Toast";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  DEMO_JOBS,
  JOB_BUCKETS,
  JOB_BUCKET_META,
  clientDisplayName,
  getDemoClient,
  getDemoInvoice,
  invoiceTotals,
  jobTotal,
  locationLabel,
  type DemoJob,
  type JobBucket,
} from "@/lib/demo/crm";
import { JOB_BUCKET_STATUS, LOCATION_STATUS, defaultJobOwner } from "@/lib/monday";

type JobRow = DemoJob & { ownerId: string };

export default function JobsPage() {
  return (
    <Suspense>
      <JobsInner />
    </Suspense>
  );
}

function JobsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { push } = useToast();
  const initialBucket = params.get("bucket") as JobBucket | null;
  const focus = params.get("focus");
  const [jobs, setJobs] = useState<JobRow[]>(() => DEMO_JOBS.map((j) => ({ ...j, ownerId: defaultJobOwner(j.installer) })));
  const [showArchive, setShowArchive] = useState(initialBucket === "paid");
  const [notifyJob, setNotifyJob] = useState<JobRow | null>(
    (jobs.find((j) => j.id === focus && j.bucket === "waiting_install") as JobRow | undefined) ?? null
  );
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [view, setView] = useState<BoardView>("table");
  const [openId, setOpenId] = useState<string | null>(focus);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const visibleBuckets = showArchive ? JOB_BUCKETS : JOB_BUCKETS.filter((b) => b !== "paid");

  const moveBucket = (id: string, bucket: JobBucket, undoable = true) => {
    const prev = jobs.find((j) => j.id === id);
    setJobs((list) =>
      list.map((j) => {
        if (j.id !== id) return j;
        const next = { ...j, bucket };
        const today = new Date().toISOString().slice(0, 10);
        if (bucket === "waiting_install") next.arrivedAt = next.arrivedAt ?? today;
        if (bucket === "waiting_payment") {
          next.installedAt = next.installedAt ?? today;
          next.billedAt = today;
        }
        if (bucket === "paid") next.paidAt = today;
        return next;
      })
    );
    if (undoable && prev) {
      const client = getDemoClient(prev.clientId);
      push(`Moved ${client ? clientDisplayName(client) : "job"} to ${JOB_BUCKET_META[bucket].short}`, () =>
        moveBucket(id, prev.bucket, false)
      );
    }
    if (bucket === "waiting_install") {
      const job = jobs.find((j) => j.id === id);
      if (job) setNotifyJob({ ...job, bucket });
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs
      .filter((j) => {
        if (personFilter !== "all" && j.ownerId !== personFilter) return false;
        if (!q) return true;
        const client = getDemoClient(j.clientId);
        return [client ? clientDisplayName(client) : "", j.vehicle, j.manufacturer, j.model, j.color, j.poNumber ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (sortDir === "desc" ? jobTotal(b) - jobTotal(a) : jobTotal(a) - jobTotal(b)));
  }, [jobs, search, personFilter, sortDir]);

  const groups: BoardGroup<JobRow>[] = visibleBuckets.map((bucket) => {
    const meta = JOB_BUCKET_STATUS.find((s) => s.id === bucket)!;
    return {
      id: bucket,
      title: JOB_BUCKET_META[bucket].short,
      color: meta.color,
      items: filtered.filter((j) => j.bucket === bucket),
    };
  });

  const columns: BoardColumn<JobRow>[] = [
    {
      id: "bucket",
      header: "Status",
      kind: "status",
      width: 160,
      getStatus: (r) => r.bucket,
      statusOptions: JOB_BUCKET_STATUS.filter((s) => showArchive || s.id !== "paid"),
      onStatus: (r, id) => moveBucket(r.id, id as JobBucket),
    },
    {
      id: "owner",
      header: "Owner",
      kind: "person",
      width: 140,
      getPerson: (r) => r.ownerId,
      onPerson: (r, id) => setJobs((list) => list.map((j) => (j.id === r.id ? { ...j, ownerId: id } : j))),
    },
    {
      id: "location",
      header: "Shop",
      kind: "status",
      width: 150,
      getStatus: (r) => r.location,
      statusOptions: LOCATION_STATUS,
      onStatus: (r, id) => setJobs((list) => list.map((j) => (j.id === r.id ? { ...j, location: id as JobRow["location"] } : j))),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      kind: "text",
      width: 180,
      getText: (r) => r.vehicle,
      onText: (r, t) => setJobs((list) => list.map((j) => (j.id === r.id ? { ...j, vehicle: t } : j))),
    },
    {
      id: "eta",
      header: "Date",
      kind: "date",
      width: 130,
      getDate: (r) => r.installedAt ?? r.arrivedAt ?? r.eta ?? r.orderedAt,
      onDate: (r, iso) => setJobs((list) => list.map((j) => (j.id === r.id ? { ...j, eta: iso } : j))),
    },
    {
      id: "value",
      header: "Invoice",
      kind: "number",
      width: 120,
      getNumber: (r) => jobTotal(r),
    },
  ];

  const open = jobs.find((j) => j.id === openId) ?? null;
  const openClient = open ? getDemoClient(open.clientId) : undefined;
  const openInv = open ? getDemoInvoice(open.invoiceId) : undefined;

  return (
    <div>
      <MondayBoard
        title="Jobs / invoices"
        color="#579bfc"
        groups={groups}
        columns={columns}
        getName={(r) => {
          const c = getDemoClient(r.clientId);
          return c ? clientDisplayName(c) : r.vehicle;
        }}
        onMove={(id, to) => moveBucket(id, to as JobBucket)}
        onOpen={(r) => setOpenId(r.id)}
        onNewItem={() => router.push("/clients")}
        newItemLabel="New from client"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search jobs"
        personFilter={personFilter}
        onPersonFilter={setPersonFilter}
        sortLabel={sortDir === "desc" ? "Value ↓" : "Value ↑"}
        onSort={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
        getDate={(r) => r.installedAt ?? r.arrivedAt ?? r.eta ?? r.orderedAt}
        sumItems={(items) => items.reduce((s, j) => s + jobTotal(j), 0)}
        view={view}
        onViewChange={setView}
        actions={
          <Button variant={showArchive ? "filled" : "outlined"} leadingIcon={<Archive size={14} />} onClick={() => setShowArchive((v) => !v)}>
            {showArchive ? "Hide archive" : "Paid archive"}
          </Button>
        }
      />

      <ItemPanel
        open={!!open}
        title={openClient ? clientDisplayName(openClient) : ""}
        subtitle={open ? `${open.manufacturer} ${open.model} · ${JOB_BUCKET_META[open.bucket].short}` : ""}
        onClose={() => setOpenId(null)}
        updates={
          open
            ? [
                { id: "o", at: open.orderedAt, author: "Nate Brooks", title: "Ordered", body: `${open.manufacturer} ${open.model} PO ${open.poNumber ?? "—"}.` },
                ...(open.arrivedAt ? [{ id: "a", at: open.arrivedAt, author: "Shop", title: "Arrived", body: "On the lot — notify the customer." }] : []),
                ...(open.installedAt ? [{ id: "i", at: open.installedAt, author: open.installer ?? "Installer", title: "Installed", body: "Billing date starts today." }] : []),
                ...(open.notes ? [{ id: "n", at: open.orderedAt, author: "Notes", title: "Job notes", body: open.notes }] : []),
              ]
            : []
        }
        files={
          openInv
            ? [
                { name: `${openInv.number}.pdf`, size: "86 KB", kind: "pdf" as const },
                { name: `${open?.poNumber ?? "PO"}.pdf`, size: "42 KB", kind: "pdf" as const },
              ]
            : []
        }
        info={
          open && openClient && openInv
            ? [
                { label: "Phone", value: formatPhone(openClient.phone) },
                { label: "Vehicle", value: open.vehicle },
                { label: "Product", value: `${open.manufacturer} ${open.model}` },
                { label: "Color", value: open.color },
                { label: "Shop", value: locationLabel(open.location) },
                { label: "Invoice", value: openInv.number },
                { label: "Total", value: formatCurrency(invoiceTotals(openInv).total) },
                { label: "Status", value: JOB_BUCKET_META[open.bucket].short },
              ]
            : []
        }
        footer={
          open && openInv ? (
            <div className="flex" style={{ gap: 8 }}>
              <Link href={`/invoices/${openInv.id}`} className="flex-1">
                <Button variant="filled" className="w-full">
                  Open invoice
                </Button>
              </Link>
              {open.bucket === "waiting_install" && (
                <Button variant="outlined" onClick={() => setNotifyJob(open)}>
                  Notify
                </Button>
              )}
            </div>
          ) : null
        }
      />

      {notifyJob && <ArrivalModal job={notifyJob} onClose={() => setNotifyJob(null)} />}
    </div>
  );
}

function ArrivalModal({ job, onClose }: { job: DemoJob; onClose: () => void }) {
  const client = getDemoClient(job.clientId)!;
  return (
    <Modal
      open
      onClose={onClose}
      title="Topper arrived — notify & schedule"
      subtitle={`${job.manufacturer} ${job.model} for ${clientDisplayName(client)}`}
      footer={
        <>
          <Button variant="outlined" onClick={onClose}>
            Later
          </Button>
          <Link href={`/schedule?job=${job.id}&date=${new Date().toISOString().slice(0, 10)}`}>
            <Button variant="filled">Open calendar</Button>
          </Link>
        </>
      }
    >
      <p className="text-gray-600" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
        Call or email the customer, then drop them on the install calendar.
      </p>
      <div className="rounded-xl" style={{ padding: "12px 14px", background: "var(--color-gray-50)", fontSize: 13, lineHeight: 1.55 }}>
        <div className="text-gray-500" style={{ fontSize: 11, fontWeight: 600 }}>
          Suggested SMS
        </div>
        <p style={{ marginTop: 6 }}>
          Hi {client.firstName} — Suburban Toppers. Your {job.manufacturer} {job.model} is in at the {locationLabel(job.location)} shop. Want us to put you on the calendar this week?
        </p>
      </div>
    </Modal>
  );
}
