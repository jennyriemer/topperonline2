import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";

const REPORTS = [
  {
    href: "/reports/historical",
    title: "Historical Comparison",
    blurb: "Hero report — Jan–Aug 2025 vs 2026, buckets, manufacturers, new vs returning.",
    hero: true,
  },
  { href: "/reports/install", title: "Ready for Install", blurb: "Toppers on the lot waiting for a calendar slot." },
  { href: "/reports/day-end", title: "Day End", blurb: "Installs completed, cash, and open balances today." },
  { href: "/reports/sales-analysis", title: "Sales Analysis", blurb: "Units and dollars by truck brand and model." },
  { href: "/reports/ar", title: "Accounts Receivable", blurb: "Waiting-on-payment jobs and aging." },
  { href: "/reports/manufacturer", title: "Manufacturer", blurb: "A.R.E., ATC, Leer, Snugtop mix." },
  { href: "/reports/taxable", title: "Taxable / Non-Taxable", blurb: "Product tax vs labor/catch-all." },
  { href: "/reports/labor", title: "Labor", blurb: "Non-taxable install hours and catch-all lines." },
];

export default function ReportsHubPage() {
  const hero = REPORTS[0];
  const rest = REPORTS.slice(1);
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Reports" }]}
        title="Reports"
        subtitle="Historical comparison is the headline. Other reports are light, navigable stubs."
      />
      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>No production report tables were dropped. These routes replace the old placeholders.</SampleBanner>
        <Link href={hero.href} className="block" style={{ textDecoration: "none", marginBottom: 16 }}>
          <Card hoverable padding={0} className="overflow-hidden">
            <div style={{ height: 8, background: "#0E4CA1" }} />
            <div style={{ padding: 24 }}>
            <div className="flex items-start justify-between" style={{ gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0E4CA1" }}>
                  Hero report
                </div>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                  {hero.title}
                </h2>
                <p className="text-gray-600" style={{ fontSize: 14, marginTop: 6, lineHeight: 1.45 }}>
                  {hero.blurb}
                </p>
              </div>
              <ArrowRight className="text-brand-600 shrink-0" />
            </div>
            </div>
          </Card>
        </Link>
        <div className="grid max-md:grid-cols-1" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {rest.map((r, i) => (
            <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
              <Card hoverable padding={0} className="h-full overflow-hidden">
                <div style={{ height: 6, background: ["#fdab3d", "#00c875", "#e2445c", "#579bfc", "#a25ddc", "#ffcb00", "#007eb5"][i % 7] }} />
                <div style={{ padding: 20 }}>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                  <BarChart3 size={16} className="text-brand-600" />
                  <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>{r.title}</h3>
                </div>
                <p className="text-gray-500" style={{ fontSize: 13, lineHeight: 1.45 }}>
                  {r.blurb}
                </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
