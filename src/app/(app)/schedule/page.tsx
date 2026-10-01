"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MondayBoard, ItemPanel, type BoardColumn, type BoardGroup, type BoardView } from "@/components/board";
import { Button } from "@/components/ui";
import {
  DEMO_APPOINTMENTS,
  formatTime,
  locationLabel,
  type DemoAppointment,
} from "@/lib/demo/crm";
import { APPT_STATUS, LOCATION_STATUS, defaultJobOwner } from "@/lib/monday";

type ApptRow = DemoAppointment & { ownerId: string };

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
  const [appts, setAppts] = useState<ApptRow[]>(() =>
    DEMO_APPOINTMENTS.map((a) => ({ ...a, ownerId: defaultJobOwner(a.installer) }))
  );
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState<string | "all">("all");
  const [view, setView] = useState<BoardView>(params.get("date") ? "calendar" : "table");
  const [openId, setOpenId] = useState<string | null>(null);
  const [location, setLocation] = useState<"both" | "suburban" | "south">("both");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return appts.filter((a) => {
      if (location !== "both" && a.location !== location) return false;
      if (personFilter !== "all" && a.ownerId !== personFilter) return false;
      if (!q) return true;
      return [a.clientName, a.vehicle, a.installer].join(" ").toLowerCase().includes(q);
    });
  }, [appts, search, personFilter, location]);

  const groups: BoardGroup<ApptRow>[] = APPT_STATUS.map((s) => ({
    id: s.id,
    title: s.label,
    color: s.color,
    items: filtered.filter((a) => a.status === s.id),
  }));

  const columns: BoardColumn<ApptRow>[] = [
    {
      id: "status",
      header: "Status",
      kind: "status",
      width: 140,
      getStatus: (r) => r.status,
      statusOptions: APPT_STATUS,
      onStatus: (r, id) => setAppts((list) => list.map((a) => (a.id === r.id ? { ...a, status: id as ApptRow["status"] } : a))),
    },
    {
      id: "owner",
      header: "Installer",
      kind: "person",
      width: 140,
      getPerson: (r) => r.ownerId,
      onPerson: (r, id) => setAppts((list) => list.map((a) => (a.id === r.id ? { ...a, ownerId: id } : a))),
    },
    {
      id: "shop",
      header: "Shop",
      kind: "status",
      width: 160,
      getStatus: (r) => r.location,
      statusOptions: LOCATION_STATUS,
      onStatus: (r, id) => setAppts((list) => list.map((a) => (a.id === r.id ? { ...a, location: id as ApptRow["location"] } : a))),
    },
    {
      id: "date",
      header: "Date",
      kind: "date",
      width: 130,
      getDate: (r) => r.date,
      onDate: (r, iso) => setAppts((list) => list.map((a) => (a.id === r.id ? { ...a, date: iso } : a))),
    },
    {
      id: "time",
      header: "Start",
      kind: "text",
      width: 110,
      getText: (r) => formatTime(r.startTime),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      kind: "text",
      width: 200,
      getText: (r) => r.vehicle,
      onText: (r, t) => setAppts((list) => list.map((a) => (a.id === r.id ? { ...a, vehicle: t } : a))),
    },
  ];

  const open = appts.find((a) => a.id === openId) ?? null;

  return (
    <div>
      <MondayBoard
        title="Install calendar"
        color="#a25ddc"
        groups={groups}
        columns={columns}
        getName={(r) => r.clientName}
        onMove={(id, to) => setAppts((list) => list.map((a) => (a.id === id ? { ...a, status: to as ApptRow["status"] } : a)))}
        onOpen={(r) => setOpenId(r.id)}
        onNewItem={() => {
          const id = `ap-new-${Date.now()}`;
          setAppts((list) => [
            {
              id,
              date: initial,
              startTime: "09:00",
              durationMin: 90,
              clientId: "demo-c-01",
              clientName: "New appointment",
              vehicle: "",
              location: "suburban",
              installer: "Jorge M.",
              status: "unconfirmed",
              ownerId: "jorge",
            },
            ...list,
          ]);
          setOpenId(id);
        }}
        newItemLabel="New appointment"
        search={search}
        onSearch={setSearch}
        personFilter={personFilter}
        onPersonFilter={setPersonFilter}
        getDate={(r) => r.date}
        view={view}
        onViewChange={setView}
        filterSlot={
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as typeof location)}
            style={{ height: 32, border: "1px solid var(--color-gray-150)", borderRadius: 4, padding: "0 8px", fontSize: 13, background: "white" }}
          >
            <option value="both">Both shops</option>
            <option value="suburban">Colfax HQ</option>
            <option value="south">South / Centennial</option>
          </select>
        }
        actions={
          <Link href="/jobs?bucket=waiting_install">
            <Button variant="filled">Jobs waiting install</Button>
          </Link>
        }
      />
      <ItemPanel
        open={!!open}
        title={open?.clientName ?? ""}
        subtitle={open ? `${open.date} ${formatTime(open.startTime)} · ${locationLabel(open.location)}` : ""}
        onClose={() => setOpenId(null)}
        updates={
          open
            ? [
                {
                  id: "1",
                  at: open.date,
                  author: open.installer,
                  title: open.status,
                  body: open.notes ?? `${open.vehicle} · ${open.durationMin} min slot.`,
                },
              ]
            : []
        }
        files={open ? [{ name: `install-${open.id}.ics`, size: "2 KB", kind: "doc" as const }] : []}
        info={
          open
            ? [
                { label: "Client", value: open.clientName },
                { label: "Vehicle", value: open.vehicle },
                { label: "Shop", value: locationLabel(open.location) },
                { label: "Installer", value: open.installer },
                { label: "When", value: `${open.date} ${formatTime(open.startTime)}` },
                { label: "Status", value: open.status },
              ]
            : []
        }
        footer={
          open?.jobId ? (
            <Link href={`/jobs?focus=${open.jobId}`}>
              <Button variant="filled" className="w-full">
                Open job
              </Button>
            </Link>
          ) : null
        }
      />
    </div>
  );
}
