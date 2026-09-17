import Link from "next/link";
import {
  ArrowRight,
  Package,
  Wrench,
  CircleDollarSign,
  Archive,
  AlertTriangle,
  Clock,
  Phone,
  CalendarClock,
} from "lucide-react";
import { PageHeader, KpiCard, Card, StatusBadge } from "@/components/ui";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  actionQueue,
  bucketStats,
  DASHBOARD_REVENUE_FALLBACK,
  JOB_BUCKET_META,
  type ActionKind,
} from "@/lib/demo/crm";

const ACTION_ICON: Record<ActionKind, typeof AlertTriangle> = {
  stale_lead: Clock,
  nudge: AlertTriangle,
  arrival: Package,
  payment: CircleDollarSign,
  schedule: CalendarClock,
};

const URGENCY_LABEL = { now: "Now", today: "Today", soon: "Soon" } as const;

export default async function DashboardPage() {
  const live = await getDashboardData();
  const buckets = bucketStats();
  const queue = actionQueue();
  const revenue =
    live.monthlyRevenue.length >= 4
      ? live.monthlyRevenue.map((m) => ({ label: m.month, value: m.value }))
      : DASHBOARD_REVENUE_FALLBACK.map((m) => ({ label: m.month, value: m.value }));

  const usingLiveRevenue = live.monthlyRevenue.length >= 4;
  const thisMonth = revenue[revenue.length - 1];
  const lastMonth = revenue[revenue.length - 2];
  const momDeltaPct =
    thisMonth && lastMonth && lastMonth.value > 0
      ? Math.round(((thisMonth.value - lastMonth.value) / lastMonth.value) * 1000) / 10
      : null;

  const mfr = [
    { name: "A.R.E.", value: 52, color: "var(--color-signal-orange)" },
    { name: "ATC", value: 18, color: "var(--color-sienna-bronze)" },
    { name: "Leer", value: 17, color: "var(--color-graphite)" },
    { name: "Snugtop", value: 13, color: "var(--color-slate)" },
  ];

  const waitingArrival = buckets.groups.find((g) => g.bucket === "waiting_arrival")!;
  const waitingInstall = buckets.groups.find((g) => g.bucket === "waiting_install")!;
  const waitingPayment = buckets.groups.find((g) => g.bucket === "waiting_payment")!;
  const paid = buckets.groups.find((g) => g.bucket === "paid")!;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Dashboard" }]}
        title="Today at the shop"
        subtitle="Bucket counts first. Revenue is context — not the only number on the wall."
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Ops KPIs and the action queue use labeled sample jobs and leads so the A→B walkthrough
          works without touching production invoices.{" "}
          {usingLiveRevenue
            ? "The revenue chart is live trailing data from Supabase."
            : "Supabase isn’t configured here, so the revenue chart uses sample trailing months."}
        </SampleBanner>

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", marginBottom: "24px" }}
        >
          <KpiCard
            label={JOB_BUCKET_META.waiting_arrival.short}
            value={waitingArrival.count}
            icon={Package}
            href="/jobs?bucket=waiting_arrival"
            contextLabel={`${formatCurrency(waitingArrival.value)} on order`}
          />
          <KpiCard
            label={JOB_BUCKET_META.waiting_install.short}
            value={waitingInstall.count}
            icon={Wrench}
            href="/jobs?bucket=waiting_install"
            contextLabel={`${formatCurrency(waitingInstall.value)} on the lot`}
          />
          <KpiCard
            label={JOB_BUCKET_META.waiting_payment.short}
            value={waitingPayment.count}
            icon={CircleDollarSign}
            iconAccent="bronze"
            tone="bad"
            href="/jobs?bucket=waiting_payment"
            contextLabel={`${formatCurrency(waitingPayment.value)} billed at install`}
          />
          <KpiCard
            label="Paid this board"
            value={paid.count}
            icon={Archive}
            href="/jobs?bucket=paid"
            deltaDirection={momDeltaPct == null ? undefined : momDeltaPct >= 0 ? "up" : "down"}
            deltaValue={momDeltaPct == null ? undefined : `${momDeltaPct > 0 ? "+" : ""}${momDeltaPct}%`}
            contextLabel={thisMonth ? `${formatCurrency(thisMonth.value)} trailing month` : "archived, searchable"}
          />
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "16px", marginBottom: "24px" }}
        >
          <Card padding={0}>
            <div
              className="flex items-center justify-between"
              style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-chalk)" }}
            >
              <div>
                <h3
                  className="text-carbon"
                  style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}
                >
                  Action queue
                </h3>
                <p className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                  Stale leads, arrivals to schedule, money waiting.
                </p>
              </div>
              <Link
                href="/jobs"
                className="text-signal-orange inline-flex items-center"
                style={{ fontSize: "13px", fontWeight: 600, gap: "4px" }}
              >
                Jobs board
                <ArrowRight size={14} />
              </Link>
            </div>
            <ul>
              {queue.slice(0, 8).map((item, i) => {
                const Icon = ACTION_ICON[item.kind];
                return (
                  <li key={item.id} style={{ borderBottom: i < 7 ? "1px solid var(--color-chalk)" : undefined }}>
                    <Link
                      href={item.href}
                      className="flex items-start hover:bg-fog transition-colors"
                      style={{ padding: "12px 22px", gap: "12px", textDecoration: "none" }}
                    >
                      <div
                        className="rounded-md flex items-center justify-center shrink-0"
                        style={{
                          width: "32px",
                          height: "32px",
                          background:
                            item.urgency === "now"
                              ? "color-mix(in srgb, var(--color-signal-orange) 12%, transparent)"
                              : "var(--color-fog)",
                          color:
                            item.urgency === "now" ? "var(--color-signal-orange)" : "var(--color-graphite)",
                        }}
                      >
                        <Icon size={15} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center" style={{ gap: "8px" }}>
                          <span className="text-carbon truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                            {item.title}
                          </span>
                          <StatusBadge
                            variant={item.urgency === "now" ? "red" : item.urgency === "today" ? "amber" : "blue"}
                          >
                            {URGENCY_LABEL[item.urgency]}
                          </StatusBadge>
                        </div>
                        <div className="text-slate truncate" style={{ fontSize: "12px", marginTop: "2px" }}>
                          {item.detail}
                        </div>
                      </div>
                      {item.meta && (
                        <div className="text-graphite shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>
                          {item.meta}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <DonutChartCard
              title="Sales mix"
              data={mfr}
              centerValue={`${mfr[0].value}%`}
              centerLabel={mfr[0].name}
            />
            <Card padding={20}>
              <div className="text-slate" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Jump in
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                <Jump href="/phone-agent" label="Phone AI console" icon={Phone} />
                <Jump href="/leads" label="Leads pipeline" icon={Clock} />
                <Jump href="/schedule" label="Today’s calendar" icon={CalendarClock} />
                <Jump href="/reports/historical" label="2025 vs 2026" icon={ArrowRight} />
              </div>
            </Card>
          </div>
        </div>

        <RevenueChart data={revenue} />
      </div>
    </div>
  );
}

function Jump({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Phone }) {
  return (
    <Link
      href={href}
      className="rounded-md flex items-center hover:bg-fog"
      style={{
        gap: "8px",
        padding: "10px 12px",
        border: "1px solid var(--color-chalk)",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--color-carbon)",
        textDecoration: "none",
      }}
    >
      <Icon size={14} className="text-signal-orange" />
      {label}
    </Link>
  );
}
