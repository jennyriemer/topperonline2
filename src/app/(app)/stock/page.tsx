/**
 * Stock — wired to real data (Supabase). See src/lib/data/stock.ts for the
 * honest mapping notes: "In House Orders" comes from invoice line items
 * with a manufacturer order status, "Trade-In" from items.trade_in = 1,
 * and "Inventory" from items.amount_in_stock / restocking_level. Per-
 * location breakdown and trade-in condition were dropped — no real data
 * for either in the legacy schema.
 */

import { Suspense } from "react";
import { Plus, Download, ArrowDownToLine } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { StockTabs } from "@/components/stock/StockTabs";
import { listInHouseOrders, listTradeIns, listInventory } from "@/lib/data/stock";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const [inHouseOrders, tradeIns, inventory] = await Promise.all([
    listInHouseOrders(100),
    listTradeIns(100),
    listInventory(300),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Stock" }]}
        title="Stock"
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download size={16} strokeWidth={2} />}>
              Export
            </Button>
            <Button variant="outlined" leadingIcon={<ArrowDownToLine size={16} strokeWidth={2} />}>
              Receive Shipment
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={16} strokeWidth={2} />}>
              New Order
            </Button>
          </>
        }
      />

      <div style={{ padding: "16px 16px 32px" }}>
        <Suspense fallback={<TabFallback />}>
          <StockTabs inHouseOrders={inHouseOrders} tradeIns={tradeIns} inventory={inventory} />
        </Suspense>
      </div>
    </div>
  );
}

function TabFallback() {
  return (
    <div
      className="rounded-md"
      style={{ height: "56px", background: "var(--color-paper)", border: "1px solid var(--color-chalk)", boxShadow: "var(--shadow-card)" }}
      aria-label="Loading…"
    />
  );
}
