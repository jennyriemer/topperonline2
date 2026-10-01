"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  LayoutGrid,
  LayoutDashboard,
  Plus,
  Search,
  Table2,
  UserRound,
  ArrowUpDown,
  Group,
} from "lucide-react";
import { STAFF, type StaffPerson } from "@/lib/monday";

export type BoardView = "table" | "kanban" | "calendar" | "dashboard";

export function BoardChrome({
  title,
  color,
  view,
  onViewChange,
  onNewItem,
  newItemLabel = "New item",
  search,
  onSearch,
  searchPlaceholder = "Search",
  personFilter,
  onPersonFilter,
  people = STAFF,
  sortLabel,
  onSort,
  groupByLabel,
  groupByOptions,
  onGroupBy,
  filterSlot,
  actions,
}: {
  title: string;
  color: string;
  view: BoardView;
  onViewChange: (v: BoardView) => void;
  onNewItem?: () => void;
  newItemLabel?: string;
  search: string;
  onSearch: (q: string) => void;
  searchPlaceholder?: string;
  personFilter: string | "all";
  onPersonFilter: (id: string | "all") => void;
  people?: StaffPerson[];
  sortLabel?: string;
  onSort?: () => void;
  groupByLabel?: string;
  groupByOptions?: { id: string; label: string }[];
  onGroupBy?: (id: string) => void;
  filterSlot?: ReactNode;
  actions?: ReactNode;
}) {
  const views: { id: BoardView; label: string; icon: typeof Table2 }[] = [
    { id: "table", label: "Main table", icon: Table2 },
    { id: "kanban", label: "Kanban", icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="bg-white" style={{ borderBottom: "1px solid var(--color-gray-150)" }}>
      <div className="flex items-center flex-wrap" style={{ padding: "10px 16px 4px", gap: 10 }}>
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={{ width: 28, height: 28, borderRadius: 6, background: color }}
        >
          <Table2 size={14} color="#fff" />
        </span>
        <h1 className="font-display truncate" style={{ fontSize: 22, lineHeight: "28px" }}>
          {title}
        </h1>
        <span
          className="hidden sm:inline-flex items-center rounded-md"
          style={{
            height: 22,
            padding: "0 8px",
            fontSize: 12,
            fontWeight: 600,
            background: "var(--color-yellow-400)",
            color: "#323338",
          }}
        >
          Demo
        </span>
        <div className="ml-auto flex items-center" style={{ gap: 8 }}>
          {actions}
        </div>
      </div>

      <div
        className="flex items-center overflow-x-auto"
        style={{ padding: "0 12px", gap: 4, borderBottom: "1px solid var(--color-gray-150)" }}
      >
        {views.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className="inline-flex items-center shrink-0"
              style={{
                height: 40,
                padding: "0 12px",
                gap: 6,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--color-brand-600)" : "var(--color-gray-600)",
                border: "none",
                background: "transparent",
                borderBottom: active ? "3px solid var(--color-brand-600)" : "3px solid transparent",
              }}
            >
              <Icon size={14} />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center flex-wrap" style={{ padding: "8px 12px", gap: 8 }}>
        {onNewItem && (
          <button
            type="button"
            onClick={onNewItem}
            className="inline-flex items-center text-white"
            style={{
              height: 32,
              padding: "0 12px",
              gap: 6,
              borderRadius: 4,
              background: "#00c875",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Plus size={14} />
            {newItemLabel}
            <ChevronDown size={12} />
          </button>
        )}

        <label
          className="flex items-center bg-white"
          style={{
            height: 32,
            padding: "0 10px",
            gap: 6,
            borderRadius: 4,
            border: "1px solid var(--color-gray-150)",
            minWidth: 140,
            flex: "1 1 160px",
            maxWidth: 280,
          }}
        >
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0"
            style={{ border: "none", outline: "none", fontSize: 13, background: "transparent" }}
          />
        </label>

        <PersonFilter value={personFilter} onChange={onPersonFilter} people={people} />

        <ToolBtn icon={<Filter size={14} />}>Filter</ToolBtn>
        {filterSlot}

        <ToolBtn icon={<ArrowUpDown size={14} />} onClick={onSort}>
          {sortLabel ?? "Sort"}
        </ToolBtn>

        {groupByOptions && onGroupBy ? (
          <label className="inline-flex items-center" style={{ height: 32, gap: 4, fontSize: 13 }}>
            <Group size={14} className="text-gray-500" />
            <select
              value={groupByOptions.find((g) => g.id === groupByLabel)?.id ?? groupByOptions[0]?.id}
              onChange={(e) => onGroupBy(e.target.value)}
              style={{
                height: 32,
                border: "1px solid var(--color-gray-150)",
                borderRadius: 4,
                padding: "0 8px",
                fontSize: 13,
                background: "white",
              }}
            >
              {groupByOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  Group by {g.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <ToolBtn icon={<Group size={14} />}>{groupByLabel ?? "Group by"}</ToolBtn>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center hover:bg-gray-50"
      style={{
        height: 32,
        padding: "0 10px",
        gap: 6,
        borderRadius: 4,
        border: "1px solid var(--color-gray-150)",
        background: "white",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-gray-700)",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function PersonFilter({
  value,
  onChange,
  people,
}: {
  value: string | "all";
  onChange: (id: string | "all") => void;
  people: StaffPerson[];
}) {
  return (
    <label className="inline-flex items-center" style={{ height: 32, gap: 4 }}>
      <UserRound size={14} className="text-gray-500" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 32,
          border: "1px solid var(--color-gray-150)",
          borderRadius: 4,
          padding: "0 8px",
          fontSize: 13,
          background: "white",
          maxWidth: 140,
        }}
      >
        <option value="all">Person</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
