"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive, Bell, Car, MapPin } from "lucide-react";
import { PageHeader, Button, Modal, Avatar } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { DndKanban, KanbanCardShell } from "@/components/kanban/DndKanban";
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

const DOT: Record<JobBucket, string> = {
  waiting_arrival: "#F5B900",
  waiting_install: "#0E4CA1",
  waiting_payment: "#FF5B59",
  paid: "#0FC27B",
};

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
  const [jobs, setJobs] = useState(DEMO_JOBS);
  const [showArchive, setShowArchive] = useState(initialBucket === "paid");
  const [notifyJob, setNotifyJob] = useState<DemoJob | null>(
    jobs.find((j) => j.id === focus && j.bucket === "waiting_install") ?? null
  );

  const visibleBuckets = showArchive ? JOB_BUCKETS : JOB_BUCKETS.filter((b) => b !== "paid");

  const move = (id: string, bucket: JobBucket, undoable = true) => {
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
        move(id, prev.bucket, false)
      );
    }
  };

  const columns = visibleBuckets.map((bucket) => {
    const items = jobs.filter((j) => j.bucket === bucket);
    const meta = JOB_BUCKET_META[bucket];
    return {
      id: bucket,
      title: meta.short,
      hint: meta.hint,
      dot: DOT[bucket],
      items,
      sum: items.reduce((s, j) => s + jobTotal(j), 0),
    };
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Pipelines" }, { label: "Jobs" }]}
        title="Invoice / job board"
        subtitle="Staff moves jobs by hand. Billing date starts when the topper is installed."
        actions={
          <>
            <Button variant={showArchive ? "filled" : "outlined"} leadingIcon={<Archive size={14} />} onClick={() => setShowArchive((v) => !v)}>
              {showArchive ? "Hide archive" : "Paid archive"}
            </Button>
            <Button variant="filled" onClick={() => router.push("/clients")}>
              New from client
            </Button>
          </>
        }
      />

      <div style={{ padding: "20px 24px 40px" }}>
        <SampleBanner>
          Four buckets: Ordered → In → Installed (invoice sent, QuickBooks not connected) → Paid archive. Drag cards between columns.
        </SampleBanner>

        <DndKanban
          columns={columns}
          onMove={(id, col) => move(id, col as JobBucket)}
          renderCard={(job) => (
            <JobCard job={job} highlight={focus === job.id} onNotify={() => setNotifyJob(job)} />
          )}
        />
      </div>

      {notifyJob && <ArrivalModal job={notifyJob} onClose={() => setNotifyJob(null)} />}
    </div>
  );
}

function JobCard({ job, highlight, onNotify }: { job: DemoJob; highlight?: boolean; onNotify: () => void }) {
  const client = getDemoClient(job.clientId)!;
  const invoice = getDemoInvoice(job.invoiceId)!;
  const totals = invoiceTotals(invoice);

  return (
    <KanbanCardShell className={highlight ? "ring-2" : undefined} >
      <div className="flex items-start justify-between" style={{ gap: 8 }}>
        <div className="min-w-0">
          <Link href={`/clients/${client.id}`} className="hover:underline" style={{ fontSize: 14, fontWeight: 600 }}>
            {clientDisplayName(client)}
          </Link>
          <div className="font-mono text-gray-500" style={{ fontSize: 11, marginTop: 2 }}>
            {formatPhone(client.phone)}
          </div>
        </div>
        <div className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(totals.total)}</div>
      </div>
      <div className="flex items-center text-gray-600" style={{ gap: 6, marginTop: 8, fontSize: 12 }}>
        <Car size={14} className="text-gray-400" />
        {job.vehicle}
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>
        {job.manufacturer} {job.model} · {job.color}
      </div>
      <div className="flex items-center text-gray-500" style={{ gap: 6, marginTop: 6, fontSize: 11 }}>
        <MapPin size={12} />
        {locationLabel(job.location)}
        {job.eta && job.bucket === "waiting_arrival" && <span>· ETA {job.eta}</span>}
      </div>
      <div className="flex items-center" style={{ gap: 6, marginTop: 10 }}>
        <Avatar name={clientDisplayName(client)} size={20} />
        <Link href={`/invoices/${invoice.id}`} className="text-brand-600" style={{ fontSize: 12, fontWeight: 600 }}>
          Invoice
        </Link>
        {job.bucket === "waiting_install" && (
          <button type="button" onClick={onNotify} className="text-gray-600" style={{ fontSize: 12, fontWeight: 600, border: "none", background: "transparent" }}>
            <Bell size={12} className="inline" /> Notify
          </button>
        )}
      </div>
    </KanbanCardShell>
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
          <Button variant="outlined" onClick={onClose}>Later</Button>
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
        <div className="text-gray-500" style={{ fontSize: 11, fontWeight: 600 }}>Suggested SMS</div>
        <p style={{ marginTop: 6 }}>
          Hi {client.firstName} — Suburban Toppers. Your {job.manufacturer} {job.model} is in at the {locationLabel(job.location)} shop. Want us to put you on the calendar this week?
        </p>
      </div>
    </Modal>
  );
}
