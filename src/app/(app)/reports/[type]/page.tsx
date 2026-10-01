import Link from "next/link";
import { Construction } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui";

const COPY: Record<string, { title: string; description: string }> = {
  install: {
    title: "Ready for Install",
    description: "Jobs in the Topper In / Waiting Install bucket. Use the Jobs board for the live mock.",
  },
  "day-end": {
    title: "Day End",
    description: "End-of-day cash, completed installs, and unconfirmed appointments. Calendar mock is on Schedule.",
  },
  "sales-analysis": {
    title: "Sales Analysis",
    description: "Truck brand/model mix. Historical Comparison carries the sample 2025 vs 2026 figures.",
  },
  ar: {
    title: "Accounts Receivable",
    description: "Waiting on Payment is the billing bucket — billing date starts at install. Open the Jobs board.",
  },
  confirmation: {
    title: "Confirmation",
    description: "Unconfirmed calendar holds. See Schedule for the dual-shop day list.",
  },
  manufacturer: {
    title: "Manufacturer",
    description: "A.R.E. / ATC / Leer / Snugtop mix is charted on Historical Comparison.",
  },
  zip: {
    title: "Zip Code",
    description: "Geographic demand stub. Sample clients are Denver-metro (802xx / 800xx).",
  },
  taxable: {
    title: "Taxable / Non-Taxable",
    description: "Product lines taxable; labor and catch-all default non-taxable. Toggle lives on each invoice.",
  },
  labor: {
    title: "Labor",
    description: "Non-taxable install labor and misc catch-all rows. Open a sample invoice to see the split.",
  },
};

export default async function ReportStubPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const meta = COPY[type] ?? { title: type, description: "Light stub for this report type." };
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Reports", href: "/reports" },
          { label: meta.title },
        ]}
        title={meta.title}
        actions={
          <Link href="/reports/historical">
            <Button variant="filled">Open historical comparison</Button>
          </Link>
        }
      />
      <div style={{ padding: "0 32px 40px 32px" }}>
        <Card padding={28} className="max-w-2xl">
          <div className="flex items-start" style={{ gap: 16 }}>
            <div className="rounded-md bg-fog flex items-center justify-center shrink-0" style={{ width: 48, height: 48 }}>
              <Construction size={22} className="text-slate" />
            </div>
            <div>
              <p className="text-carbon" style={{ fontSize: 16, fontWeight: 500 }}>
                Light stub
              </p>
              <p className="text-graphite" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
                {meta.description}
              </p>
              <div className="flex" style={{ gap: 8, marginTop: 16 }}>
                <Link href="/jobs">
                  <Button variant="outlined" size="sm">
                    Jobs board
                  </Button>
                </Link>
                <Link href="/invoices/demo-inv-03">
                  <Button variant="outlined" size="sm">
                    Sample invoice
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
