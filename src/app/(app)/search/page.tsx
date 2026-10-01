"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { formatPhone } from "@/lib/utils";
import {
  JOB_BUCKET_META,
  LEAD_STAGE_LABELS,
  clientDisplayName,
  searchDemoClients,
  searchDemoJobs,
  searchDemoLeads,
} from "@/lib/demo/crm";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const clients = q ? searchDemoClients(q) : [];
  const jobs = q ? searchDemoJobs(q) : [];
  const leads = q ? searchDemoLeads(q) : [];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Search" }]}
        title={q ? `Results for “${q}”` : "Search"}
        subtitle="Phone-first. Partial digits match — 303-903 finds the Alvarez / Chen / Iron Horse sample records."
      />
      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Global search scans sample clients, jobs, and leads. Live client search on the Clients page
          still queries production when Supabase is configured.
        </SampleBanner>

        {!q && (
          <Card>
            <p className="text-graphite" style={{ fontSize: "14px" }}>
              Type a phone fragment in the header (try <strong>303-903</strong>) or a last name.
            </p>
          </Card>
        )}

        {q && (
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <ResultGroup title={`Clients (${clients.length})`}>
              {clients.map((c) => (
                <Row
                  key={c.id}
                  href={`/clients/${c.id}`}
                  title={clientDisplayName(c)}
                  detail={`${formatPhone(c.phone)} · ${c.city}, ${c.state}`}
                  badge="Client"
                />
              ))}
            </ResultGroup>
            <ResultGroup title={`Jobs (${jobs.length})`}>
              {jobs.map((j) => (
                <Row
                  key={j.id}
                  href={`/invoices/${j.invoiceId}`}
                  title={`${j.manufacturer} ${j.model} · ${j.vehicle}`}
                  detail={JOB_BUCKET_META[j.bucket].label}
                  badge={JOB_BUCKET_META[j.bucket].short}
                />
              ))}
            </ResultGroup>
            <ResultGroup title={`Leads (${leads.length})`}>
              {leads.map((l) => (
                <Row
                  key={l.id}
                  href={`/leads/${l.id}`}
                  title={`${l.firstName} ${l.lastName}`}
                  detail={`${formatPhone(l.phone)} · ${l.vehicle}`}
                  badge={LEAD_STAGE_LABELS[l.stage]}
                />
              ))}
            </ResultGroup>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding={0}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-chalk)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
        {title}
      </div>
      <div>{children}</div>
    </Card>
  );
}

function Row({
  href,
  title,
  detail,
  badge,
}: {
  href: string;
  title: string;
  detail: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between hover:bg-fog"
      style={{ padding: "12px 20px", textDecoration: "none", borderTop: "1px solid var(--color-chalk)", gap: "12px" }}
    >
      <div className="min-w-0">
        <div className="text-carbon" style={{ fontSize: "14px", fontWeight: 600 }}>
          {title}
        </div>
        <div className="text-slate" style={{ fontSize: "12px" }}>
          {detail}
        </div>
      </div>
      <StatusBadge variant="blue">{badge}</StatusBadge>
    </Link>
  );
}
