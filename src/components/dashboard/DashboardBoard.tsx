"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Archive,
  CalendarClock,
  CircleDollarSign,
  Clock,
  GripVertical,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  Wrench,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card, KpiCard, PageHeader, StatusBadge } from "@/components/ui";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { formatCurrency } from "@/lib/utils";
import {
  JOB_BUCKET_META,
  type ActionKind,
  type ActionItem,
} from "@/lib/demo/crm";

const ACTION_ICON: Record<ActionKind, typeof Clock> = {
  stale_lead: Clock,
  nudge: Clock,
  arrival: Package,
  payment: CircleDollarSign,
  schedule: CalendarClock,
};

const URGENCY_LABEL = { now: "Now", today: "Today", soon: "Soon" } as const;

const DEFAULT_ORDER = ["kpis", "queue", "mix", "jump", "revenue"] as const;

type WidgetId = (typeof DEFAULT_ORDER)[number];

export function DashboardBoard({
  buckets,
  queue,
  revenue,
  usingLiveRevenue,
  momDeltaPct,
  thisMonthLabel,
}: {
  buckets: { bucket: string; count: number; value: number }[];
  queue: ActionItem[];
  revenue: { label: string; value: number }[];
  usingLiveRevenue: boolean;
  momDeltaPct: number | null;
  thisMonthLabel?: string;
}) {
  const [customizing, setCustomizing] = useState(false);
  const [order, setOrder] = useState<WidgetId[]>(() => {
    if (typeof window === "undefined") return [...DEFAULT_ORDER];
    try {
      const raw = localStorage.getItem("st-dash-layout");
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return [...DEFAULT_ORDER];
  });
  const [hour] = useState(() => new Date().getHours());
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const waitingArrival = buckets.find((g) => g.bucket === "waiting_arrival")!;
  const waitingInstall = buckets.find((g) => g.bucket === "waiting_install")!;
  const waitingPayment = buckets.find((g) => g.bucket === "waiting_payment")!;
  const paid = buckets.find((g) => g.bucket === "paid")!;

  const mfr = [
    { name: "A.R.E.", value: 52, color: "var(--color-brand-600)" },
    { name: "ATC", value: 18, color: "var(--color-brand-400)" },
    { name: "Leer", value: 17, color: "var(--color-yellow-400)" },
    { name: "Snugtop", value: 13, color: "var(--color-gray-300)" },
  ];

  const widgets: Record<WidgetId, { title: string; span: string; node: React.ReactNode }> = {
    kpis: {
      title: "Shop buckets",
      span: "col-span-12",
      node: (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <KpiCard
            label={JOB_BUCKET_META.waiting_arrival.short}
            value={waitingArrival.count}
            icon={Package}
            iconAccent="yellow"
            href="/jobs?bucket=waiting_arrival"
            contextLabel={`${formatCurrency(waitingArrival.value)} on order`}
            sparkline={[4, 3, 5, 4, 2, waitingArrival.count]}
          />
          <KpiCard
            label={JOB_BUCKET_META.waiting_install.short}
            value={waitingInstall.count}
            icon={Wrench}
            href="/jobs?bucket=waiting_install"
            contextLabel={`${formatCurrency(waitingInstall.value)} on the lot`}
            sparkline={[1, 2, 2, 3, 2, waitingInstall.count]}
          />
          <KpiCard
            label={JOB_BUCKET_META.waiting_payment.short}
            value={waitingPayment.count}
            icon={CircleDollarSign}
            iconAccent="bronze"
            tone="bad"
            href="/jobs?bucket=waiting_payment"
            contextLabel={`${formatCurrency(waitingPayment.value)} billed at install`}
            sparkline={[6, 5, 4, 3, 3, waitingPayment.count]}
          />
          <KpiCard
            label="Paid this board"
            value={paid.count}
            icon={Archive}
            href="/jobs?bucket=paid"
            deltaDirection={momDeltaPct == null ? undefined : momDeltaPct >= 0 ? "up" : "down"}
            deltaValue={momDeltaPct == null ? undefined : `${momDeltaPct > 0 ? "+" : ""}${momDeltaPct}%`}
            contextLabel={thisMonthLabel}
            sparkline={[8, 9, 7, 10, 11, paid.count || 8]}
          />
        </div>
      ),
    },
    queue: {
      title: "Action queue",
      span: "col-span-12 lg:col-span-7",
      node: (
        <Card padding={0} id="queue">
          <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gray-150)" }}>
            <div>
              <h3 className="font-display" style={{ fontSize: 14 }}>Action queue</h3>
              <p className="text-gray-500" style={{ fontSize: 12 }}>Stale leads, arrivals, money waiting</p>
            </div>
            <Link href="/jobs" className="text-brand-600 inline-flex items-center" style={{ fontSize: 13, fontWeight: 600, gap: 4 }}>
              Jobs board <ArrowRight size={14} />
            </Link>
          </div>
          <ul>
            {queue.slice(0, 8).map((item, i) => {
              const Icon = ACTION_ICON[item.kind];
              return (
                <li key={item.id} style={{ borderBottom: i < 7 ? "1px solid var(--color-gray-100)" : undefined }}>
                  <Link href={item.href} className="flex items-start hover:bg-gray-50" style={{ padding: "12px 16px", gap: 12, textDecoration: "none" }}>
                    <div
                      className="rounded-md flex items-center justify-center shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        background: item.urgency === "now" ? "var(--color-danger-bg)" : "var(--color-gray-50)",
                        color: item.urgency === "now" ? "var(--color-danger-fg)" : "var(--color-gray-600)",
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <span className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</span>
                        <StatusBadge variant={item.urgency === "now" ? "red" : item.urgency === "today" ? "amber" : "blue"}>
                          {URGENCY_LABEL[item.urgency]}
                        </StatusBadge>
                      </div>
                      <div className="text-gray-500 truncate" style={{ fontSize: 12, marginTop: 2 }}>{item.detail}</div>
                    </div>
                    {item.meta && <div className="text-gray-600 tabular shrink-0" style={{ fontSize: 12 }}>{item.meta}</div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ),
    },
    mix: {
      title: "Sales mix",
      span: "col-span-12 lg:col-span-5",
      node: (
        <DonutChartCard title="Sales mix" data={mfr} centerValue={`${mfr[0].value}%`} centerLabel={mfr[0].name} />
      ),
    },
    jump: {
      title: "Jump in",
      span: "col-span-12 lg:col-span-5",
      node: (
        <Card padding={16}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Jump in</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Jump href="/phone-agent" label="Phone AI console" icon={Phone} />
            <Jump href="/leads" label="Leads pipeline" icon={Clock} />
            <Jump href="/schedule" label="Today’s calendar" icon={CalendarClock} />
            <Jump href="/reports/historical" label="2025 vs 2026" icon={ArrowRight} />
          </div>
        </Card>
      ),
    },
    revenue: {
      title: "Revenue",
      span: "col-span-12 lg:col-span-7",
      node: <RevenueChart data={revenue} />,
    },
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrder((items) => {
      const oldIndex = items.indexOf(active.id as WidgetId);
      const newIndex = items.indexOf(over.id as WidgetId);
      const next = arrayMove(items, oldIndex, newIndex);
      localStorage.setItem("st-dash-layout", JSON.stringify(next));
      return next;
    });
  };

  const visible = order;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }]}
        title={`${greet}, Zack`}
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        actions={
          <>
            <Button variant={customizing ? "filled" : "outlined"} onClick={() => setCustomizing((v) => !v)}>
              {customizing ? "Done" : "Customize"}
            </Button>
            <Button variant="filled" leadingIcon={<Plus size={14} />} onClick={() => setCustomizing(true)}>
              Add widget
            </Button>
          </>
        }
      />
      <div style={{ padding: "20px 24px 40px" }}>
        <SampleBanner>
          Ops KPIs use labeled sample jobs and leads so the walkthrough works without production invoices.{" "}
          {usingLiveRevenue ? "Revenue chart is live trailing data." : "Supabase isn’t configured, so revenue uses sample months."}
        </SampleBanner>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={visible} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12" style={{ gap: 16 }}>
              {visible.map((id) => (
                <SortableWidget key={id} id={id} customizing={customizing} className={widgets[id].span} title={widgets[id].title}>
                  {widgets[id].node}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableWidget({
  id,
  title,
  customizing,
  className,
  children,
}: {
  id: string;
  title: string;
  customizing: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !customizing });
  return (
    <div
      ref={setNodeRef}
      className={className}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        outline: customizing ? "1px dashed var(--color-gray-300)" : undefined,
        borderRadius: 12,
      }}
    >
      {customizing && (
        <div className="flex items-center text-gray-500" style={{ padding: "4px 8px", gap: 6, fontSize: 11 }}>
          <button type="button" {...attributes} {...listeners} className="cursor-grab" style={{ border: "none", background: "transparent" }} aria-label={`Drag ${title}`}>
            <GripVertical size={14} />
          </button>
          {title}
          <MoreHorizontal size={12} className="ml-auto" />
        </div>
      )}
      {children}
    </div>
  );
}

function Jump({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Phone }) {
  return (
    <Link
      href={href}
      className="rounded-lg flex items-center hover:bg-gray-50"
      style={{
        gap: 8,
        padding: "10px 12px",
        border: "1px solid var(--color-gray-150)",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
      }}
    >
      <Icon size={14} className="text-brand-600" />
      {label}
    </Link>
  );
}
