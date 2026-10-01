"use client";

/**
 * StockTabs — client-side interactive content for the Stock page's 3 tabs.
 * Wired to real data (Supabase) — see src/lib/data/stock.ts for exactly
 * what each tab maps to in the legacy schema and what was honestly dropped
 * (per-location breakdown, trade-in condition) because there's no real
 * source data for it.
 */

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Package, ArrowDownToLine, Boxes, Search, X, Bell } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, Tabs, Button, Modal } from "@/components/ui";
import { textColumn, dateColumn, currencyColumn } from "@/lib/columns";
import { formatCurrency } from "@/lib/utils";
import type { InHouseOrderRow, TradeInRow, InventoryRow } from "@/lib/data/stock";

interface StockTabsProps {
  inHouseOrders: InHouseOrderRow[];
  tradeIns: TradeInRow[];
  inventory: InventoryRow[];
}

const ITEM_STATUS_VARIANT: Record<string, "green" | "blue" | "amber" | "red"> = {
  "In Stock": "green",
  "Sent to Mfg": "blue",
  "Confirmed by Mfg": "blue",
  "Recvd with Conditions": "amber",
};

export function StockTabs({ inHouseOrders, tradeIns, inventory }: StockTabsProps) {
  const [notifyOpen, setNotifyOpen] = useState(false);
  const hasLive = inHouseOrders.length + tradeIns.length + inventory.length > 0;

  return (
    <>
      <div className="flex justify-end" style={{ marginBottom: 12 }}>
        <Button size="sm" variant="outlined" leadingIcon={<Bell size={14} />} onClick={() => setNotifyOpen(true)}>
          Topper arrived — notify
        </Button>
      </div>
      {!hasLive && (
        <p className="text-slate" style={{ fontSize: 13, marginBottom: 12 }}>
          Live stock RPCs aren’t returning rows in this environment. Sample arrival flow still works below.
        </p>
      )}
      <Tabs
        tabs={[
          {
            value: "in_house",
            label: "In House Orders",
            count: inHouseOrders.length,
            content: <InHouseOrdersTab orders={inHouseOrders} onArrive={() => setNotifyOpen(true)} />,
          },
          {
            value: "trade_in",
            label: "Trade-In",
            count: tradeIns.length,
            content: <TradeInTab tradeIns={tradeIns} />,
          },
          {
            value: "inventory",
            label: "Inventory",
            count: inventory.length,
            content: <InventoryTab inventory={inventory} />,
          },
        ]}
      />
      <Modal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        title="Topper arrived — notify & schedule"
        subtitle="ATC Work Cap · Maya Chen · (303) 903-8821"
        footer={
          <>
            <Button variant="outlined" onClick={() => setNotifyOpen(false)}>
              Later
            </Button>
            <Link href="/jobs?focus=demo-j-02&bucket=waiting_install">
              <Button variant="outlined">Open job</Button>
            </Link>
            <Link href="/schedule">
              <Button variant="filled">Put on calendar</Button>
            </Link>
          </>
        }
      >
        <p className="text-graphite" style={{ fontSize: 14, lineHeight: 1.5 }}>
          Light stock loop: the cap is on the lot, text the customer, then book the bay. This does not
          write production inventory.
        </p>
        <div className="rounded-md" style={{ marginTop: 12, padding: 12, background: "var(--color-fog)", fontSize: 13, lineHeight: 1.5 }}>
          Hi Maya — Suburban Toppers. Your ATC Work Cap is in at the Colfax shop. Want a morning install this
          week?
        </div>
      </Modal>
    </>
  );
}

// ============================================================================
// In House Orders tab — invoice_items with a manufacturer order status
// ============================================================================

function InHouseOrdersTab({ orders, onArrive }: { orders: InHouseOrderRow[]; onArrive: () => void }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.color ?? "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  const columns: ColumnDef<InHouseOrderRow>[] = useMemo(
    () => [
      textColumn<InHouseOrderRow>({ key: "invoiceNumber", header: "Invoice #" }),
      dateColumn<InHouseOrderRow>({ key: "orderDate", header: "Order Date" }),
      {
        id: "description",
        header: "Description",
        accessorKey: "description",
        cell: (info) => {
          const order = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {order.description}
              </div>
              {order.color && (
                <span
                  className="rounded-md text-graphite"
                  style={{
                    display: "inline-block", fontSize: "10px", fontWeight: 600, padding: "2px 6px",
                    background: "var(--color-chalk)", textTransform: "uppercase", letterSpacing: "0.04em",
                    marginTop: "4px",
                  }}
                >
                  {order.color.trim()}
                </span>
              )}
            </div>
          );
        },
      },
      currencyColumn<InHouseOrderRow>({ key: "price", header: "Price" }),
      dateColumn<InHouseOrderRow>({ key: "deliveryDate", header: "Delivery Date" }),
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.itemStatus;
          const variant = ITEM_STATUS_VARIANT[status] ?? "blue";
          return (
            <span
              className="rounded-full inline-flex items-center"
              style={{
                gap: "6px", fontSize: "12px", fontWeight: 500, padding: "3px 10px",
                background: `color-mix(in srgb, var(--color-status-${variant}) 12%, transparent)`,
                color: `var(--color-status-${variant})`,
              }}
            >
              <span className="rounded-full" style={{ width: "6px", height: "6px", background: `var(--color-status-${variant})` }} />
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <StockTableShell
      title={`In House Orders (${orders.length})`}
      icon={<Package size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={orders.length}
      rightSlot={
        <Button size="sm" variant="ghost" leadingIcon={<Bell size={14} />} onClick={onArrive}>
          Mark a unit arrived
        </Button>
      }
    >
      <DataTable<InHouseOrderRow>
        data={filtered}
        columns={columns}
        getRowId={(o) => String(o.id)}
        emptyTitle="No in-house orders"
        emptyDescription="Items sent to or confirmed by manufacturers will appear here."
      />
    </StockTableShell>
  );
}

// ============================================================================
// Trade-In tab — items.trade_in = 1
// ============================================================================

function TradeInTab({ tradeIns }: { tradeIns: TradeInRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return tradeIns;
    return tradeIns.filter(
      (t) =>
        (t.partNumber ?? "").toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.color ?? "").toLowerCase().includes(q)
    );
  }, [tradeIns, search]);

  const columns: ColumnDef<TradeInRow>[] = useMemo(
    () => [
      textColumn<TradeInRow>({ key: "partNumber", header: "Stock / Serial #", render: (t) => t.partNumber || "—" }),
      {
        id: "description",
        header: "Description",
        accessorKey: "description",
        cell: (info) => {
          const t = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {t.description}
              </div>
              {t.color && (
                <span
                  className="rounded-md text-graphite"
                  style={{
                    display: "inline-block", fontSize: "10px", fontWeight: 600, padding: "2px 6px",
                    background: "var(--color-chalk)", textTransform: "uppercase", letterSpacing: "0.04em",
                    marginTop: "4px",
                  }}
                >
                  {t.color.trim()}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "cost",
        header: "Cost",
        accessorKey: "cost",
        cell: (info) => {
          const v = info.row.original.cost;
          return <span style={{ fontVariantNumeric: "tabular-nums" }}>{v != null ? formatCurrency(v) : "—"}</span>;
        },
        meta: { align: "right", mono: true },
      },
      {
        id: "sold",
        header: "Status",
        cell: ({ row }) => {
          const sold = row.original.sold;
          return (
            <span
              className="rounded-full inline-flex items-center"
              style={{
                gap: "6px", fontSize: "12px", fontWeight: 500, padding: "3px 10px",
                background: sold ? "var(--color-fog)" : "color-mix(in srgb, var(--color-status-green) 12%, transparent)",
                color: sold ? "var(--color-slate)" : "var(--color-status-green)",
              }}
            >
              {sold ? "Sold" : "On Lot"}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <StockTableShell
      title={`Trade-In (${tradeIns.length})`}
      icon={<ArrowDownToLine size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={tradeIns.length}
    >
      <DataTable<TradeInRow>
        data={filtered}
        columns={columns}
        getRowId={(t) => String(t.id)}
        emptyTitle="No trade-ins"
        emptyDescription="Customer trade-in items will appear here."
      />
    </StockTableShell>
  );
}

// ============================================================================
// Inventory tab — items.amount_in_stock / restocking_level
// ============================================================================

function InventoryTab({ inventory }: { inventory: InventoryRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return inventory;
    return inventory.filter(
      (i) =>
        (i.partNumber ?? "").toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.manufacturer ?? "").toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const columns: ColumnDef<InventoryRow>[] = useMemo(
    () => [
      textColumn<InventoryRow>({ key: "partNumber", header: "Part #", render: (i) => i.partNumber || "—" }),
      {
        id: "item",
        header: "Item",
        accessorKey: "description",
        cell: (info) => {
          const item = info.row.original;
          return (
            <div>
              <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                {item.description}
              </div>
              {item.manufacturer && (
                <div className="text-slate" style={{ fontSize: "11px", lineHeight: 1.3, marginTop: "2px" }}>
                  {item.manufacturer.trim()}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "amountInStock",
        header: "On Hand",
        accessorKey: "amountInStock",
        cell: (info) => {
          const item = info.row.original;
          const qty = info.getValue() as number;
          const low = item.restockingLevel != null && qty <= item.restockingLevel;
          return (
            <span
              className={low ? "text-status-red" : "text-carbon"}
              style={{ fontSize: "13px", fontWeight: low ? 600 : 500, fontVariantNumeric: "tabular-nums" }}
            >
              {qty}
            </span>
          );
        },
        enableSorting: true,
        meta: { align: "right" },
      },
      {
        id: "restockingLevel",
        header: "Reorder At",
        accessorKey: "restockingLevel",
        cell: (info) => (
          <span className="text-slate" style={{ fontSize: "13px", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            {(info.getValue() as number | null) ?? "—"}
          </span>
        ),
        enableSorting: true,
        meta: { align: "right" },
      },
    ],
    []
  );

  const lowStockCount = inventory.filter((i) => i.restockingLevel != null && i.amountInStock <= i.restockingLevel).length;

  return (
    <StockTableShell
      title={`Inventory (${inventory.length})`}
      icon={<Boxes size={16} strokeWidth={2} />}
      search={search}
      onSearchChange={setSearch}
      filteredCount={filtered.length}
      totalCount={inventory.length}
      rightSlot={
        lowStockCount > 0 ? (
          <div
            className="rounded-md"
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
              background: "color-mix(in srgb, var(--color-status-red) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-status-red) 30%, transparent)",
              color: "var(--color-status-red)", fontSize: "12px", fontWeight: 600,
            }}
          >
            <span className="rounded-full" style={{ width: "6px", height: "6px", background: "var(--color-status-red)" }} />
            {lowStockCount} item{lowStockCount === 1 ? "" : "s"} at or below reorder level
          </div>
        ) : null
      }
    >
      <DataTable<InventoryRow>
        data={filtered}
        columns={columns}
        getRowId={(i) => String(i.id)}
        emptyTitle="No inventory items"
        emptyDescription="Stock items will appear here once added to inventory."
      />
    </StockTableShell>
  );
}

// ============================================================================
// StockTableShell — shared card wrapper for the 3 stock tabs
// ============================================================================

function StockTableShell({
  title,
  icon,
  search,
  onSearchChange,
  filteredCount,
  totalCount,
  rightSlot,
  children,
}: {
  title: string;
  icon: ReactNode;
  search: string;
  onSearchChange: (v: string) => void;
  filteredCount: number;
  totalCount: number;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-paper rounded-md" style={{ boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
      <div
        className="flex items-center"
        style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-chalk)", gap: "16px" }}
      >
        <div className="flex items-center text-carbon shrink-0" style={{ gap: "8px" }}>
          <span className="text-graphite">{icon}</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }}>
            {title}
          </h2>
          {filteredCount !== totalCount && (
            <span className="text-slate" style={{ fontSize: "12px", fontWeight: 500 }}>
              ({filteredCount} of {totalCount})
            </span>
          )}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        <div className="flex-1" />
        <div className="relative">
          <Search
            size={14}
            strokeWidth={2}
            className="text-slate"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-md"
            style={{
              height: "32px", width: "240px", paddingLeft: "32px", paddingRight: search ? "32px" : "12px",
              border: "1px solid var(--color-chalk)", fontSize: "13px", color: "var(--color-carbon)",
              outline: "none", background: "var(--color-paper)",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              style={{
                position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: "var(--color-slate)",
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
