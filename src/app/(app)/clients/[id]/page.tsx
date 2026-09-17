import Link from "next/link";
import { Mail, MapPin, Phone, Car, FileText, StickyNote, Activity } from "lucide-react";
import { PageHeader, Button, Card, StatusBadge } from "@/components/ui";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { LiveClientRecord } from "@/components/clients/LiveClientRecord";
import {
  JOB_BUCKET_META,
  activityForClient,
  clientDisplayName,
  formatShortDate,
  getDemoClient,
  getDemoInvoice,
  invoiceTotals,
  jobsForClient,
  notesForClient,
} from "@/lib/demo/crm";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getDemoClient(id);
  if (!client) return <LiveClientRecord id={id} />;

  const jobs = jobsForClient(client.id);
  const notes = notesForClient(client.id);
  const activity = activityForClient(client.id);
  const spend = jobs.reduce((s, j) => {
    const inv = getDemoInvoice(j.invoiceId);
    return s + (inv ? invoiceTotals(inv).total : 0);
  }, 0);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Clients", href: "/clients" },
          { label: clientDisplayName(client) },
        ]}
        title={clientDisplayName(client)}
        subtitle={`${client.type === "commercial" ? "Commercial" : "Residential"} · ${jobs.length} job${jobs.length === 1 ? "" : "s"} · ${formatCurrency(spend)} lifetime (sample)`}
        actions={
          <>
            <Link href={`/jobs`}>
              <Button variant="outlined">Jobs board</Button>
            </Link>
            {jobs[0] && (
              <Link href={`/invoices/${jobs[0].invoiceId}`}>
                <Button variant="filled">Open latest invoice</Button>
              </Link>
            )}
          </>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Full client record for the walkthrough: vehicles, job/invoice history, notes, and activity.
          Phone-first search (try <strong>303-903</strong>) lands here.
        </SampleBanner>

        <div className="grid" style={{ gridTemplateColumns: "minmax(280px, 0.7fr) minmax(0, 1.3fr)", gap: "16px" }}>
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <Card padding={22}>
              <div className="flex items-center" style={{ gap: "8px", marginBottom: "14px" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>Contact</h2>
                <SampleBadge />
              </div>
              <Info icon={Phone} text={formatPhone(client.phone)} />
              <Info icon={Mail} text={client.email} />
              <Info
                icon={MapPin}
                text={`${client.address}, ${client.city}, ${client.state} ${client.zip}`}
              />
              <p className="text-graphite" style={{ fontSize: "13px", lineHeight: 1.5, marginTop: "14px" }}>
                {client.notes}
              </p>
            </Card>

            <Card padding={22}>
              <div className="flex items-center" style={{ gap: "8px", marginBottom: "14px" }}>
                <Car size={16} className="text-signal-orange" />
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>Vehicles</h2>
              </div>
              <ul className="flex flex-col" style={{ gap: "8px" }}>
                {client.vehicles.map((v, i) => (
                  <li
                    key={i}
                    className="rounded-md"
                    style={{ padding: "12px", background: "var(--color-fog)" }}
                  >
                    <div className="text-carbon" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {v.year} {v.make} {v.model}
                    </div>
                    <div className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                      {v.bedSize} · {v.color}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <Card padding={0}>
              <Header icon={FileText} title="Orders & invoices" />
              <ul>
                {jobs.map((job, i) => {
                  const inv = getDemoInvoice(job.invoiceId)!;
                  const tot = invoiceTotals(inv);
                  const meta = JOB_BUCKET_META[job.bucket];
                  return (
                    <li
                      key={job.id}
                      style={{ borderTop: i === 0 ? undefined : "1px solid var(--color-chalk)" }}
                    >
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="flex items-center hover:bg-fog"
                        style={{ padding: "14px 22px", gap: "12px", textDecoration: "none" }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center" style={{ gap: "8px" }}>
                            <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                              {inv.number}
                            </span>
                            <StatusBadge variant={meta.variant}>{meta.short}</StatusBadge>
                          </div>
                          <div className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                            {job.vehicle} · {job.manufacturer} {job.model}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-carbon" style={{ fontSize: "14px", fontWeight: 600 }}>
                            {formatCurrency(tot.total)}
                          </div>
                          <div className="text-slate" style={{ fontSize: "11px" }}>
                            {job.billedAt ? `Billed ${formatShortDate(job.billedAt)}` : `Ordered ${formatShortDate(job.orderedAt)}`}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {jobs.length === 0 && (
                  <li className="text-slate" style={{ padding: "24px", fontSize: "13px" }}>
                    No sample jobs yet.
                  </li>
                )}
              </ul>
            </Card>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Card padding={0}>
                <Header icon={StickyNote} title="Notes" />
                <ul style={{ padding: "8px 0 16px" }}>
                  {notes.length === 0 && (
                    <li className="text-slate" style={{ padding: "8px 22px", fontSize: "13px" }}>
                      No notes.
                    </li>
                  )}
                  {notes.map((n) => (
                    <li key={n.id} style={{ padding: "10px 22px" }}>
                      <div className="text-carbon" style={{ fontSize: "13px", lineHeight: 1.45 }}>
                        {n.body}
                      </div>
                      <div className="text-slate" style={{ fontSize: "11px", marginTop: "4px" }}>
                        {n.author} · {formatShortDate(n.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card padding={0}>
                <Header icon={Activity} title="Activity" />
                <ul style={{ padding: "8px 0 16px" }}>
                  {activity.length === 0 && (
                    <li className="text-slate" style={{ padding: "8px 22px", fontSize: "13px" }}>
                      No activity.
                    </li>
                  )}
                  {activity.map((a) => (
                    <li key={a.id} style={{ padding: "10px 22px" }}>
                      <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {a.label}
                      </div>
                      <div className="text-slate" style={{ fontSize: "12px" }}>
                        {a.detail}
                      </div>
                      <div className="text-slate" style={{ fontSize: "11px", marginTop: "2px" }}>
                        {formatShortDate(a.at)}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px", marginBottom: "8px" }}>
      <Icon size={14} className="text-slate shrink-0" />
      <span className="text-carbon" style={{ fontSize: "13px" }}>
        {text}
      </span>
    </div>
  );
}

function Header({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div
      className="flex items-center"
      style={{ gap: "8px", padding: "16px 22px", borderBottom: "1px solid var(--color-chalk)" }}
    >
      <Icon size={15} className="text-signal-orange" />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>{title}</h2>
    </div>
  );
}
