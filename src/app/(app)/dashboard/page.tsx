import { DashboardBoard } from "@/components/dashboard/DashboardBoard";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";
import { actionQueue, bucketStats, DASHBOARD_REVENUE_FALLBACK } from "@/lib/demo/crm";

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

  return (
    <DashboardBoard
      buckets={buckets.groups}
      queue={queue}
      revenue={revenue}
      usingLiveRevenue={usingLiveRevenue}
      momDeltaPct={momDeltaPct}
      thisMonthLabel={thisMonth ? `${formatCurrency(thisMonth.value)} trailing month` : "archived, searchable"}
    />
  );
}
