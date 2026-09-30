"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, Button, Card, StatusBadge } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";
import {
  DEMO_APPOINTMENTS,
  formatTime,
  locationLabel,
  type DemoAppointment,
} from "@/lib/demo/crm";

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleInner />
    </Suspense>
  );
}

function ScheduleInner() {
  const params = useSearchParams();
  const initial = params.get("date") ?? new Date().toISOString().slice(0, 10);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(initial + "T12:00:00");
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(initial);
  const [location, setLocation] = useState<"both" | "suburban" | "south">("both");

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = useMemo(() => buildMonth(cursor), [cursor]);
  const selectedAppts = DEMO_APPOINTMENTS.filter((a) => {
    if (a.date !== selected) return false;
    if (location !== "both" && a.location !== location) return false;
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of DEMO_APPOINTMENTS) {
      if (location !== "both" && a.location !== location) continue;
      map.set(a.date, (map.get(a.date) ?? 0) + 1);
    }
    return map;
  }, [location]);

  const shiftMonth = (n: number) => {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + n, 1));
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Schedule" }]}
        title="Install calendar"
        subtitle="Usable month + day mock. Dual location: Colfax HQ and South / Centennial."
        actions={
          <Link href="/jobs?bucket=waiting_install">
            <Button variant="filled">Jobs waiting install</Button>
          </Link>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Replaces the Phase 4c placeholder. Arrival notify from Jobs/Stock drops you here with a date
          query. Live Google Calendar sync is still on the roadmap.
        </SampleBanner>

        <div className="flex flex-wrap items-center" style={{ gap: "8px", marginBottom: "16px" }}>
          {(["both", "suburban", "south"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className="rounded-xl"
              style={{
                height: "32px",
                padding: "0 14px",
                fontSize: "13px",
                fontWeight: 500,
                border: "none",
                background: location === loc ? "var(--color-brand-100)" : "var(--color-paper)",
                color: location === loc ? "var(--color-brand-700)" : "var(--color-gray-700)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {loc === "both" ? "Both shops" : locationLabel(loc)}
            </button>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)", gap: "16px" }}>
          <Card padding={20}>
            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
              <button type="button" onClick={() => shiftMonth(-1)} className="rounded-md hover:bg-fog" style={{ width: 32, height: 32 }} aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>{monthLabel}</h2>
              <button type="button" onClick={() => shiftMonth(1)} className="rounded-md hover:bg-fog" style={{ width: 32, height: 32 }} aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-slate text-center" style={{ fontSize: "11px", fontWeight: 600, padding: "4px 0" }}>
                  {d}
                </div>
              ))}
              {days.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} />;
                const iso = toIso(day);
                const count = countsByDay.get(iso) ?? 0;
                const isSel = iso === selected;
                const isToday = iso === new Date().toISOString().slice(0, 10);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelected(iso)}
                    className="rounded-md"
                    style={{
                      minHeight: "64px",
                      padding: "6px",
                      border: isSel ? "1.5px solid var(--color-brand-600)" : "1px solid var(--color-gray-150)",
                      background: isSel ? "var(--color-brand-50)" : isToday ? "var(--color-yellow-100)" : "var(--color-paper)",
                      textAlign: "left",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "13px", fontWeight: isToday ? 700 : 500 }}>{day.getDate()}</span>
                      {count > 0 && (
                        <span
                          className="rounded-full bg-carbon text-paper"
                          style={{ fontSize: "10px", fontWeight: 600, minWidth: 16, textAlign: "center", padding: "0 5px" }}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card padding={0}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-chalk)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </h2>
              <p className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
                {selectedAppts.length} appointment{selectedAppts.length === 1 ? "" : "s"}
              </p>
            </div>
            {selectedAppts.length === 0 ? (
              <p className="text-slate" style={{ padding: "24px 20px", fontSize: "13px" }}>
                No installs on this day. Use Jobs → Notify to drop an arrival onto the calendar.
              </p>
            ) : (
              <ul>
                {selectedAppts.map((a) => (
                  <ApptRow key={a.id} appt={a} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ApptRow({ appt }: { appt: DemoAppointment }) {
  return (
    <li style={{ padding: "14px 20px", borderTop: "1px solid var(--color-chalk)" }}>
      <div className="flex items-start justify-between" style={{ gap: "8px" }}>
        <div>
          <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
            {formatTime(appt.startTime)} · {appt.clientName}
          </div>
          <div className="text-slate" style={{ fontSize: "12px", marginTop: "2px" }}>
            {appt.vehicle}
          </div>
          <div className="text-graphite" style={{ fontSize: "12px", marginTop: "2px" }}>
            {locationLabel(appt.location)} · {appt.installer}
          </div>
        </div>
        <StatusBadge variant={appt.status === "complete" ? "green" : appt.status === "confirmed" ? "blue" : "amber"}>
          {appt.status === "complete" ? "Done" : appt.status === "confirmed" ? "Confirmed" : "Unconfirmed"}
        </StatusBadge>
      </div>
      {appt.jobId && (
        <Link href={`/jobs?focus=${appt.jobId}`} className="text-signal-orange" style={{ fontSize: "12px", fontWeight: 600 }}>
          Open job →
        </Link>
      )}
    </li>
  );
}

function buildMonth(cursor: Date): (Date | null)[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  return cells;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
