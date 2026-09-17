"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PageHeader, Button, StatusBadge, Card } from "@/components/ui";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  DENVER_TAX_RATE,
  JOB_BUCKET_META,
  clientDisplayName,
  formatShortDate,
  getDemoClient,
  getDemoInvoice,
  getDemoJob,
  lineAmount,
  locationLabel,
  type DemoInvoiceLine,
  type LineKind,
} from "@/lib/demo/crm";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const seed = getDemoInvoice(id);
  if (!seed) {
    notFound();
  }

  const job = getDemoJob(seed.jobId)!;
  const client = getDemoClient(seed.clientId)!;
  const [lines, setLines] = useState<DemoInvoiceLine[]>(seed.lines);

  const totals = useMemo(() => {
    const taxable = lines.filter((l) => l.taxable).reduce((s, l) => s + lineAmount(l), 0);
    const nontaxable = lines.filter((l) => !l.taxable).reduce((s, l) => s + lineAmount(l), 0);
    const tax = Math.round(taxable * DENVER_TAX_RATE);
    return { taxable, nontaxable, tax, subtotal: taxable + nontaxable, total: taxable + nontaxable + tax };
  }, [lines]);

  const toggleTax = (lineId: string) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, taxable: !l.taxable } : l)));
  };

  const addLabor = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `custom-${prev.length + 1}`,
        kind: "misc",
        description: "Catch-all / misc labor",
        qty: 1,
        unitPrice: 85,
        taxable: false,
      },
    ]);
  };

  const billed = !!job.billedAt;
  const meta = JOB_BUCKET_META[job.bucket];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Jobs", href: "/jobs" },
          { label: seed.number },
        ]}
        title={seed.number}
        subtitle={`${clientDisplayName(client)} · ${job.manufacturer} ${job.model}`}
        actions={
          <>
            <Link href={`/clients/${client.id}`}>
              <Button variant="outlined">Client record</Button>
            </Link>
            <Button variant="filled" disabled={!billed}>
              {billed ? "Invoice sent (mock)" : "Send after install"}
            </Button>
          </>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Labor and catch-all lines default to <strong>non-taxable</strong>. Product lines are taxable
          at a Denver combined {Math.round(DENVER_TAX_RATE * 10000) / 100}%. Billing date starts when
          the job moves to Waiting Payment — QuickBooks is intentionally not connected.
        </SampleBanner>

        <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.8fr)", gap: "16px" }}>
          <Card padding={0}>
            <div
              className="flex items-center justify-between"
              style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-chalk)" }}
            >
              <div>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                    Line items
                  </h2>
                  <SampleBadge />
                </div>
                <p className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                  Toggle tax on any row. Labor/misc start off.
                </p>
              </div>
              <Button size="sm" variant="outlined" onClick={addLabor}>
                Add catch-all
              </Button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-slate" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: "10px 22px" }}>Description</th>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>Type</th>
                  <th style={{ textAlign: "right", padding: "10px 8px" }}>Amount</th>
                  <th style={{ textAlign: "right", padding: "10px 22px" }}>Tax</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} style={{ borderTop: "1px solid var(--color-chalk)" }}>
                    <td style={{ padding: "12px 22px" }}>
                      <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500 }}>
                        {line.description}
                      </div>
                      {line.manufacturer && (
                        <div className="text-slate" style={{ fontSize: "11px" }}>
                          {line.manufacturer}
                          {line.sku ? ` · ${line.sku}` : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <KindBadge kind={line.kind} />
                    </td>
                    <td className="text-carbon" style={{ padding: "12px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: "13px" }}>
                      {formatCurrency(lineAmount(line))}
                    </td>
                    <td style={{ padding: "12px 22px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => toggleTax(line.id)}
                        className="rounded-xl"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "4px 10px",
                          border: "none",
                          background: line.taxable
                            ? "color-mix(in srgb, var(--color-status-amber) 14%, transparent)"
                            : "color-mix(in srgb, var(--color-status-green) 14%, transparent)",
                          color: line.taxable ? "var(--color-sienna-bronze)" : "var(--color-status-green)",
                        }}
                      >
                        {line.taxable ? "Taxable" : "Non-taxable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px 22px 22px", borderTop: "1px solid var(--color-chalk)" }}>
              <Tot label="Taxable products" value={formatCurrency(totals.taxable)} />
              <Tot label="Non-taxable labor / misc" value={formatCurrency(totals.nontaxable)} />
              <Tot
                label={`Denver tax (${(DENVER_TAX_RATE * 100).toFixed(2)}%)`}
                value={formatCurrency(totals.tax)}
              />
              <Tot label="Total" value={formatCurrency(totals.total)} strong />
            </div>
          </Card>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <Card padding={22}>
              <div className="text-slate" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Job status
              </div>
              <div style={{ marginTop: "10px" }}>
                <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
              </div>
              <dl style={{ marginTop: "16px", display: "grid", gap: "10px" }}>
                <Meta label="Client" value={clientDisplayName(client)} href={`/clients/${client.id}`} />
                <Meta label="Phone" value={formatPhone(client.phone)} />
                <Meta label="Location" value={locationLabel(job.location)} />
                <Meta label="Ordered" value={formatShortDate(job.orderedAt)} />
                <Meta label="Arrived" value={formatShortDate(job.arrivedAt)} />
                <Meta label="Installed" value={formatShortDate(job.installedAt)} />
                <Meta label="Billing date" value={formatShortDate(job.billedAt)} />
                <Meta label="Paid" value={formatShortDate(job.paidAt)} />
              </dl>
              <p className="text-slate" style={{ fontSize: "12px", marginTop: "14px", lineHeight: 1.45 }}>
                {billed
                  ? "Invoice is considered sent as of the install/billing date. QuickBooks is not connected in this UI."
                  : "Invoice is a draft until the job is marked installed. That’s when billing starts."}
              </p>
              <Link href="/jobs" className="inline-block" style={{ marginTop: "14px" }}>
                <Button variant="outlined" size="sm">
                  Back to board
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: LineKind }) {
  const label = kind === "product" ? "Product" : kind === "labor" ? "Labor" : "Catch-all";
  const variant = kind === "product" ? "blue" : kind === "labor" ? "purple" : "amber";
  return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

function Tot({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "4px 0" }}>
      <span className={strong ? "text-carbon" : "text-slate"} style={{ fontSize: strong ? "14px" : "13px", fontWeight: strong ? 600 : 500 }}>
        {label}
      </span>
      <span
        className="text-carbon"
        style={{ fontSize: strong ? "18px" : "13px", fontWeight: 600, fontFamily: strong ? "var(--font-display)" : undefined }}
      >
        {value}
      </span>
    </div>
  );
}

function Meta({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start justify-between" style={{ gap: "12px" }}>
      <dt className="text-slate" style={{ fontSize: "12px" }}>
        {label}
      </dt>
      <dd className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, textAlign: "right" }}>
        {href ? (
          <Link href={href} className="hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
