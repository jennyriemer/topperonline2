"use client";

import { useState } from "react";
import Link from "next/link";
import {
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
import { Button, PageHeader, StatusBadge } from "@/components/ui";
import { NumberWidget, StatusPieWidget, FunnelWidget } from "@/components/board";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { formatCurrency } from "@/lib/utils";
import {
  DEMO_LEADS,
  JOB_BUCKET_META,
  LEAD_STAGE_LABELS,
  LEAD_STAGES,
  type ActionKind,
  type ActionItem,
} from "@/lib/demo/crm";
import { JOB_BUCKET_STATUS, LEAD_STAGE_STATUS, MONDAY } from "@/lib/monday";

const ACTION_ICON: Record<ActionKind, typeof Clock> = {
  stale_lead: Clock,
  nudge: Clock,
  arrival: Package,
  payment: CircleDollarSign,
  schedule: CalendarClock,
};

const URGENCY_LABEL = { now: "Now", today: "Today", soon: "Soon" } as const;

const DEFAULT_ORDER = ["kpis", "funnel", "queue", "mix", "jump", "revenue"] as const;

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

  const leadSegs = LEAD_STAGES.map((s) => {
    const opt = LEAD_STAGE_STATUS.find((o) => o.id === s)!;
    return { name: LEAD_STAGE_LABELS[s], value: DEMO_LEADS.filter((l) => l.stage === s).length, color: opt.color };
  });

  const jobSegs = JOB_BUCKET_STATUS.map((s) => {
    const b = buckets.find((g) => g.bucket === s.id);
    return { name: s.label, value: b?.count ?? 0, color: s.color };
  });

  const widgets: Record<WidgetId, { title: string; span: string; node: React.ReactNode }> = {
    kpis: {
      title: "Shop buckets",
      span: "col-span-12",
      node: (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <NumberWidget
            label={JOB_BUCKET_META.waiting_arrival.short}
            value={waitingArrival.count}
            hint={`${formatCurrency(waitingArrival.value)} on order`}
            color={MONDAY.orange}
          />
          <NumberWidget
            label={JOB_BUCKET_META.waiting_install.short}
            value={waitingInstall.count}
            hint={`${formatCurrency(waitingInstall.value)} on the lot`}
            color={MONDAY.blue}
          />
          <NumberWidget
            label={JOB_BUCKET_META.waiting_payment.short}
            value={waitingPayment.count}
            hint={`${formatCurrency(waitingPayment.value)} billed`}
            color={MONDAY.red}
          />
          <NumberWidget
            label="Paid this board"
            value={paid.count}
            hint={thisMonthLabel ?? (momDeltaPct != null ? `${momDeltaPct > 0 ? "+" : ""}${momDeltaPct}% MoM` : "archive")}
            color={MONDAY.green}
          />
        </div>
      ),
    },
    funnel: {
      title: "Lead funnel",
      span: "col-span-12 lg:col-span-5",
      node: (
        <FunnelWidget
          title="Lead funnel"
          stages={leadSegs.map((s) => ({
            label: s.name,
            count: s.value,
            color: s.color,
            value: DEMO_LEADS.filter((l) => LEAD_STAGE_LABELS[l.stage] === s.name).reduce((sum, l) => sum + l.estimatedValue, 0),
          }))}
        />
      ),
    },
    queue: {
      title: "Action queue",
      span: "col-span-12 lg:col-span-7",
      node: (
        <div className="bg-white overflow-hidden" id="queue" style={{ borderRadius: 8, boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-gray-150)" }}>
            <div>
              <h3 className="font-display" style={{ fontSize: 15 }}>
                My work
              </h3>
              <p className="text-gray-500" style={{ fontSize: 12 }}>
                Stale leads, arrivals, money waiting
              </p>
            </div>
            <Link href="/jobs" className="text-brand-600" style={{ fontSize: 13, fontWeight: 700 }}>
              Jobs board
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
                        background: item.urgency === "now" ? "#e2445c" : "var(--color-gray-50)",
                        color: item.urgency === "now" ? "white" : "var(--color-gray-600)",
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <span className="truncate" style={{ fontSize: 13, fontWeight: 700 }}>
                          {item.title}
                        </span>
                        <StatusBadge variant={item.urgency === "now" ? "red" : item.urgency === "today" ? "amber" : "blue"}>
                          {URGENCY_LABEL[item.urgency]}
                        </StatusBadge>
                      </div>
                      <div className="text-gray-500 truncate" style={{ fontSize: 12, marginTop: 2 }}>
                        {item.detail}
                      </div>
                    </div>
                    {item.meta && (
                      <div className="text-gray-600 tabular shrink-0" style={{ fontSize: 12 }}>
                        {item.meta}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ),
    },
    mix: {
      title: "Jobs by bucket",
      span: "col-span-12 lg:col-span-5",
      node: <StatusPieWidget title="Jobs by status" segments={jobSegs} />,
    },
    jump: {
      title: "Jump in",
      span: "col-span-12 lg:col-span-7",
      node: (
        <div className="bg-white h-full" style={{ borderRadius: 8, padding: 16, boxShadow: "var(--shadow-card)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Jump in</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Jump href="/phone-agent" label="Phone AI console" icon={Phone} color="#007eb5" />
            <Jump href="/leads" label="Leads board" icon={Clock} color="#fdab3d" />
            <Jump href="/schedule" label="Today’s calendar" icon={CalendarClock} color="#a25ddc" />
            <Jump href="/stock" label="Stock / arrivals" icon={Package} color="#ffcb00" />
            <Jump href="/reports/historical" label="2025 vs 2026" icon={Wrench} color="#0E4CA1" />
            <Jump href="/jobs?bucket=waiting_payment" label="Waiting payment" icon={Archive} color="#e2445c" />
          </div>
        </div>
      ),
    },
    revenue: {
      title: "Revenue",
      span: "col-span-12",
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
            <Button variant="success" leadingIcon={<Plus size={14} />} onClick={() => setCustomizing(true)}>
              Add widget
            </Button>
          </>
        }
      />
      <div style={{ padding: "16px 16px 40px" }}>
        <SampleBanner>
          Ops KPIs use labeled sample jobs and leads so the walkthrough works without production invoices.{" "}
          {usingLiveRevenue ? "Revenue chart is live trailing data." : "Supabase isn’t configured, so revenue uses sample months."}
        </SampleBanner>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-12" style={{ gap: 12 }}>
              {order.map((id) => (
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
        borderRadius: 8,
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

function Jump({ href, label, icon: Icon, color }: { href: string; label: string; icon: typeof Phone; color: string }) {
  return (
    <Link
      href={href}
      className="rounded-md flex items-center hover:bg-gray-50"
      style={{
        gap: 8,
        padding: "10px 12px",
        border: "1px solid var(--color-gray-150)",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      <span className="inline-flex rounded-sm" style={{ width: 10, height: 10, background: color }} />
      <Icon size={14} className="text-gray-500" />
      {label}
    </Link>
  );
}
