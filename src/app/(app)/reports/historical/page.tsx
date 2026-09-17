"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Button, Card, StatusBadge } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { formatCurrency } from "@/lib/utils";
import { HISTORICAL_PERIODS, JOB_BUCKET_META, type JobBucket } from "@/lib/demo/crm";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PeriodKey = "2025" | "2026";

export default function HistoricalReportPage() {
  const [left, setLeft] = useState<PeriodKey>("2025");
  const [right, setRight] = useState<PeriodKey>("2026");
  const a = HISTORICAL_PERIODS[left];
  const b = HISTORICAL_PERIODS[right];

  const chart = useMemo(
    () =>
      a.monthly.map((m, i) => ({
        month: m.month,
        left: m.value,
        right: b.monthly[i]?.value ?? 0,
      })),
    [a, b]
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Reports", href: "/reports" },
          { label: "Historical Comparison" },
        ]}
        title="Historical comparison"
        subtitle="Side-by-side periods: revenue, installs, clients by bucket, manufacturers, new vs returning."
        actions={
          <Link href="/reports">
            <Button variant="outlined">All reports</Button>
          </Link>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Hero report for Phase 4. Numbers are realistic sample totals for Jan–Aug, not a wipe of
          production invoices. Swap the two periods to compare any pair.
        </SampleBanner>

        <div className="flex flex-wrap items-center" style={{ gap: "12px", marginBottom: "16px" }}>
          <PeriodToggle label="Left" value={left} onChange={setLeft} />
          <span className="text-slate" style={{ fontSize: "13px" }}>
            vs
          </span>
          <PeriodToggle label="Right" value={right} onChange={setRight} />
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginBottom: "16px" }}>
          <DeltaCard label="Revenue" a={a.revenue} b={b.revenue} money />
          <DeltaCard label="Installs" a={a.installs} b={b.installs} />
          <DeltaCard label="New clients" a={a.newClients} b={b.newClients} />
          <DeltaCard label="Avg ticket" a={a.avgTicket} b={b.avgTicket} money />
        </div>

        <Card padding={20} className="mb-16">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
            Monthly revenue · {a.label} vs {b.label}
          </h2>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chalk)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-slate)" }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(n) => `$${Math.round(n / 1000)}k`}
                  tick={{ fontSize: 12, fill: "var(--color-slate)" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--color-chalk)", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="left" name={a.label} stroke="var(--color-graphite)" fill="var(--color-chalk)" strokeWidth={2} />
                <Area type="monotone" dataKey="right" name={b.label} stroke="var(--color-signal-orange)" fill="color-mix(in srgb, var(--color-signal-orange) 18%, transparent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Card padding={20}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
              Clients by job bucket
            </h2>
            {(Object.keys(JOB_BUCKET_META) as JobBucket[]).map((k) => (
              <div key={k} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-chalk)" }}>
                <StatusBadge variant={JOB_BUCKET_META[k].variant}>{JOB_BUCKET_META[k].short}</StatusBadge>
                <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {a.byBucket[k]} → {b.byBucket[k]}
                </div>
              </div>
            ))}
            <div className="text-slate" style={{ fontSize: "12px", marginTop: "12px" }}>
              New vs returning: {a.newClients}/{a.returningClients} → {b.newClients}/{b.returningClients}
            </div>
          </Card>
          <Card padding={20}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
              Top manufacturers
            </h2>
            {b.manufacturers.map((m, i) => {
              const prev = a.manufacturers.find((x) => x.name === m.name);
              return (
                <div key={m.name} style={{ marginBottom: "12px" }}>
                  <div className="flex justify-between" style={{ fontSize: "13px", marginBottom: "4px" }}>
                    <span className="text-carbon" style={{ fontWeight: 600 }}>
                      {m.name}
                    </span>
                    <span className="text-graphite">
                      {formatCurrency(prev?.revenue ?? 0)} → {formatCurrency(m.revenue)}
                    </span>
                  </div>
                  <div className="rounded-full" style={{ height: 8, background: "var(--color-fog)" }}>
                    <div
                      className="rounded-full"
                      style={{
                        height: 8,
                        width: `${Math.round((m.revenue / b.manufacturers[0].revenue) * 100)}%`,
                        background: i === 0 ? "var(--color-signal-orange)" : "var(--color-graphite)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

function PeriodToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <span className="text-slate" style={{ fontSize: "12px", fontWeight: 600 }}>
        {label}
      </span>
      {(["2025", "2026"] as PeriodKey[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className="rounded-xl"
          style={{
            height: 32,
            padding: "0 12px",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            background: value === p ? "var(--color-carbon)" : "var(--color-paper)",
            color: value === p ? "white" : "var(--color-graphite)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          Jan–Aug {p}
        </button>
      ))}
    </div>
  );
}

function DeltaCard({ label, a, b, money }: { label: string; a: number; b: number; money?: boolean }) {
  const pct = a === 0 ? 0 : Math.round(((b - a) / a) * 1000) / 10;
  const up = pct >= 0;
  const fmt = (n: number) => (money ? formatCurrency(n) : n.toLocaleString());
  return (
    <Card padding={18}>
      <div className="text-slate" style={{ fontSize: "12px", fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600, marginTop: 6 }}>
        {fmt(b)}
      </div>
      <div className="text-slate" style={{ fontSize: "12px", marginTop: 4 }}>
        vs {fmt(a)}{" "}
        <span style={{ color: up ? "var(--color-status-green)" : "var(--color-status-red)", fontWeight: 600 }}>
          {up ? "+" : ""}
          {pct}%
        </span>
      </div>
    </Card>
  );
}
