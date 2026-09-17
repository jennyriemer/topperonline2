"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive, ArrowRight, Bell, Car, MapPin } from "lucide-react";
import { PageHeader, Button, StatusBadge, Modal } from "@/components/ui";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
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

const NEXT: Record<JobBucket, JobBucket | null> = {
  waiting_arrival: "waiting_install",
  waiting_install: "waiting_payment",
  waiting_payment: "paid",
  paid: null,
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
  const initialBucket = params.get("bucket") as JobBucket | null;
  const focus = params.get("focus");
  const [jobs, setJobs] = useState(DEMO_JOBS);
  const [showArchive, setShowArchive] = useState(initialBucket === "paid");
  const [notifyJob, setNotifyJob] = useState<DemoJob | null>(
    jobs.find((j) => j.id === focus && j.bucket === "waiting_install") ?? null
  );

  const visibleBuckets = showArchive ? JOB_BUCKETS : JOB_BUCKETS.filter((b) => b !== "paid");

  const byBucket = useMemo(() => {
    const map = new Map<JobBucket, DemoJob[]>();
    for (const b of JOB_BUCKETS) map.set(b, []);
    for (const j of jobs) map.get(j.bucket)!.push(j);
    return map;
  }, [jobs]);

  const move = (id: string, bucket: JobBucket) => {
    setJobs((prev) =>
      prev.map((j) => {
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
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Jobs" }]}
        title="Invoice / job board"
        subtitle="Staff moves jobs by hand. Billing date starts when the topper is installed."
        actions={
          <>
            <Button
              variant={showArchive ? "filled" : "outlined"}
              leadingIcon={<Archive size={16} />}
              onClick={() => setShowArchive((v) => !v)}
            >
              {showArchive ? "Hide archive" : "Show paid archive"}
            </Button>
            <Button variant="filled" onClick={() => router.push("/clients")}>
              New from client
            </Button>
          </>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Four buckets match the shop floor: Ordered → In → Installed (invoice sent, QuickBooks not
          connected) → Paid archive. Click a card to open the invoice with labor vs. product tax lines.
        </SampleBanner>

        <div
          style={{
            overflowX: "auto",
            marginLeft: "-32px",
            marginRight: "-32px",
            paddingLeft: "32px",
            paddingRight: "32px",
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${visibleBuckets.length}, minmax(280px, 1fr))`,
              gap: "16px",
              minWidth: visibleBuckets.length * 296,
            }}
          >
            {visibleBuckets.map((bucket) => {
              const meta = JOB_BUCKET_META[bucket];
              const list = byBucket.get(bucket) ?? [];
              const value = list.reduce((s, j) => s + jobTotal(j), 0);
              const highlighted = initialBucket === bucket;
              return (
                <section
                  key={bucket}
                  className="rounded-md bg-paper"
                  style={{
                    boxShadow: "var(--shadow-card)",
                    outline: highlighted ? "2px solid var(--color-signal-orange)" : undefined,
                    minHeight: "420px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <header style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--color-chalk)" }}>
                    <div className="flex items-center justify-between">
                      <StatusBadge variant={meta.variant}>{meta.short}</StatusBadge>
                      <span className="text-carbon" style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600 }}>
                        {list.length}
                      </span>
                    </div>
                    <div className="text-carbon" style={{ fontSize: "14px", fontWeight: 600, marginTop: "8px" }}>
                      {meta.label}
                    </div>
                    <div className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                      {meta.hint}
                    </div>
                    <div className="text-graphite" style={{ fontSize: "13px", fontWeight: 600, marginTop: "8px" }}>
                      {formatCurrency(value)}
                    </div>
                  </header>
                  <div className="flex flex-col" style={{ gap: "8px", padding: "12px", flex: 1 }}>
                    {list.length === 0 && (
                      <div className="text-slate text-center" style={{ fontSize: "12px", padding: "24px 8px" }}>
                        Nothing in this bucket
                      </div>
                    )}
                    {list.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        highlight={focus === job.id}
                        onMove={move}
                        onNotify={() => setNotifyJob(job)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {notifyJob && (
        <ArrivalModal job={notifyJob} onClose={() => setNotifyJob(null)} />
      )}
    </div>
  );
}

function JobCard({
  job,
  highlight,
  onMove,
  onNotify,
}: {
  job: DemoJob;
  highlight?: boolean;
  onMove: (id: string, bucket: JobBucket) => void;
  onNotify: () => void;
}) {
  const client = getDemoClient(job.clientId)!;
  const invoice = getDemoInvoice(job.invoiceId)!;
  const totals = invoiceTotals(invoice);
  const next = NEXT[job.bucket];

  return (
    <article
      className="rounded-md"
      style={{
        padding: "12px",
        background: highlight ? "color-mix(in srgb, var(--color-signal-orange) 8%, white)" : "var(--color-fog)",
        border: highlight ? "1px solid var(--color-signal-orange)" : "1px solid transparent",
      }}
    >
      <div className="flex items-start justify-between" style={{ gap: "8px" }}>
        <div className="min-w-0">
          <div className="flex items-center" style={{ gap: "6px" }}>
            <Link href={`/clients/${client.id}`} className="text-carbon hover:underline" style={{ fontSize: "13px", fontWeight: 600 }}>
              {clientDisplayName(client)}
            </Link>
            <SampleBadge />
          </div>
          <div className="text-slate" style={{ fontSize: "11px", marginTop: "2px" }}>
            {formatPhone(client.phone)}
          </div>
        </div>
        <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
          {formatCurrency(totals.total)}
        </div>
      </div>
      <div className="flex items-center text-graphite" style={{ gap: "4px", marginTop: "8px", fontSize: "12px" }}>
        <Car size={12} />
        {job.vehicle}
      </div>
      <div className="text-carbon" style={{ fontSize: "12px", fontWeight: 500, marginTop: "2px" }}>
        {job.manufacturer} {job.model} · {job.color}
      </div>
      <div className="flex items-center text-slate" style={{ gap: "6px", marginTop: "6px", fontSize: "11px" }}>
        <MapPin size={11} />
        {locationLabel(job.location)}
        {job.billedAt && <span>· billed {job.billedAt}</span>}
        {job.eta && job.bucket === "waiting_arrival" && <span>· ETA {job.eta}</span>}
      </div>
      <div className="flex flex-wrap" style={{ gap: "6px", marginTop: "10px" }}>
        <Link href={`/invoices/${invoice.id}`}>
          <Button size="sm" variant="outlined">
            Invoice
          </Button>
        </Link>
        {job.bucket === "waiting_install" && (
          <Button size="sm" variant="outlined" leadingIcon={<Bell size={12} />} onClick={onNotify}>
            Notify
          </Button>
        )}
        {next && (
          <Button size="sm" variant="filled" trailingIcon={<ArrowRight size={12} />} onClick={() => onMove(job.id, next)}>
            {JOB_BUCKET_META[next].short}
          </Button>
        )}
      </div>
    </article>
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
      <p className="text-graphite" style={{ fontSize: "14px", lineHeight: 1.5, marginBottom: "14px" }}>
        Light stock flow: call or email the customer, then drop them on the install calendar. No
        inventory over-engineering — just close the loop.
      </p>
      <div
        className="rounded-md"
        style={{ padding: "12px 14px", background: "var(--color-fog)", fontSize: "13px", lineHeight: 1.55 }}
      >
        <div className="text-slate" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Suggested SMS
        </div>
        <p className="text-carbon" style={{ marginTop: "6px" }}>
          Hi {client.firstName} — Suburban Toppers. Your {job.manufacturer} {job.model} is in at the{" "}
          {locationLabel(job.location)} shop. Want us to put you on the calendar this week? Reply with a
          day that works.
        </p>
      </div>
      <div className="flex" style={{ gap: "8px", marginTop: "14px" }}>
        <Button variant="outlined" leadingIcon={<Bell size={14} />}>
          Mark SMS queued
        </Button>
        <Link href={`/clients/${client.id}`}>
          <Button variant="ghost">Open client</Button>
        </Link>
      </div>
    </Modal>
  );
}
