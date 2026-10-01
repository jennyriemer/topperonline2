"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { StatusOption } from "@/lib/monday";
import { BoardChrome, type BoardView } from "./BoardChrome";
import { DateCell, TextCell } from "./DateCell";
import { PersonCell } from "./PersonCell";
import { StatusBar, StatusCell } from "./StatusCell";
import { FunnelWidget, NumberWidget, StatusBarChartWidget, StatusPieWidget, groupsToSegments } from "./widgets";

export type ColumnKind = "item" | "status" | "person" | "date" | "text" | "number" | "custom";

export interface BoardColumn<T> {
  id: string;
  header: string;
  kind: ColumnKind;
  width?: number;
  getText?: (row: T) => string;
  getStatus?: (row: T) => string;
  statusOptions?: StatusOption[];
  onStatus?: (row: T, id: string) => void;
  getPerson?: (row: T) => string | null | undefined;
  onPerson?: (row: T, id: string) => void;
  getDate?: (row: T) => string | null | undefined;
  onDate?: (row: T, iso: string) => void;
  onText?: (row: T, text: string) => void;
  getNumber?: (row: T) => number;
  render?: (row: T) => ReactNode;
}

export interface BoardGroup<T> {
  id: string;
  title: string;
  color: string;
  items: T[];
}

export function MondayBoard<T extends { id: string }>({
  title,
  color,
  groups,
  columns,
  getName,
  onRename,
  onMove,
  onOpen,
  onNewItem,
  newItemLabel,
  search,
  onSearch,
  searchPlaceholder,
  personFilter,
  onPersonFilter,
  sortLabel,
  onSort,
  groupByLabel,
  groupByOptions,
  onGroupBy,
  filterSlot,
  actions,
  getDate,
  sumItems,
  dashboardExtra,
  view,
  onViewChange,
}: {
  title: string;
  color: string;
  groups: BoardGroup<T>[];
  columns: BoardColumn<T>[];
  getName: (row: T) => string;
  onRename?: (row: T, name: string) => void;
  onMove: (id: string, toGroup: string) => void;
  onOpen: (row: T) => void;
  onNewItem?: (groupId?: string) => void;
  newItemLabel?: string;
  search: string;
  onSearch: (q: string) => void;
  searchPlaceholder?: string;
  personFilter: string | "all";
  onPersonFilter: (id: string | "all") => void;
  getPersonId?: (row: T) => string | null | undefined;
  sortLabel?: string;
  onSort?: () => void;
  groupByLabel?: string;
  groupByOptions?: { id: string; label: string }[];
  onGroupBy?: (id: string) => void;
  filterSlot?: ReactNode;
  actions?: ReactNode;
  getDate?: (row: T) => string | null | undefined;
  sumItems?: (items: T[]) => number;
  dashboardExtra?: ReactNode;
  view: BoardView;
  onViewChange: (v: BoardView) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<T | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const itemMap = useMemo(() => {
    const m = new Map<string, { item: T; groupId: string }>();
    groups.forEach((g) => g.items.forEach((it) => m.set(it.id, { item: it, groupId: g.id })));
    return m;
  }, [groups]);

  const onDragStart = (e: DragStartEvent) => {
    setActive(itemMap.get(String(e.active.id))?.item ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const { active: a, over } = e;
    if (!over) return;
    const from = itemMap.get(String(a.id));
    if (!from) return;
    const overId = String(over.id);
    const toGroup = groups.some((g) => g.id === overId || g.id === overId.replace("col-", ""))
      ? overId.replace("col-", "")
      : itemMap.get(overId)?.groupId;
    if (toGroup && toGroup !== from.groupId) onMove(from.item.id, toGroup);
  };

  const statusCol = columns.find((c) => c.kind === "status" && c.statusOptions);

  return (
    <div>
      <BoardChrome
        title={title}
        color={color}
        view={view}
        onViewChange={onViewChange}
        onNewItem={onNewItem ? () => onNewItem() : undefined}
        newItemLabel={newItemLabel}
        search={search}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        personFilter={personFilter}
        onPersonFilter={onPersonFilter}
        sortLabel={sortLabel}
        onSort={onSort}
        groupByLabel={groupByLabel}
        groupByOptions={groupByOptions}
        onGroupBy={onGroupBy}
        filterSlot={filterSlot}
        actions={actions}
      />

      <div style={{ padding: "12px 12px 40px" }}>
        {view === "table" && (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex flex-col" style={{ gap: 28 }}>
              {groups.map((g) => (
                <GroupTable
                  key={g.id}
                  group={g}
                  collapsed={!!collapsed[g.id]}
                  onToggle={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                  columns={columns}
                  getName={getName}
                  onRename={onRename}
                  onOpen={onOpen}
                  onNewItem={onNewItem}
                  sumItems={sumItems}
                />
              ))}
            </div>
            <DragOverlay>
              {active ? (
                <div
                  className="bg-white kanban-lift"
                  style={{ padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 14, minWidth: 220 }}
                >
                  {getName(active)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {view === "kanban" && (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="flex" style={{ gap: 12, overflowX: "auto", paddingBottom: 16 }}>
              {groups.map((g) => (
                <KanbanColumn
                  key={g.id}
                  group={g}
                  getName={getName}
                  columns={columns}
                  onOpen={onOpen}
                  statusCol={statusCol}
                  sumItems={sumItems}
                />
              ))}
            </div>
            <DragOverlay>
              {active ? (
                <article className="bg-white kanban-lift" style={{ width: 260, padding: 12, borderRadius: 8 }}>
                  <div style={{ fontWeight: 600 }}>{getName(active)}</div>
                </article>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {view === "calendar" && (
          <BoardCalendar groups={groups} getName={getName} getDate={getDate} onOpen={onOpen} />
        )}

        {view === "dashboard" && (
          <BoardDash groups={groups} sumItems={sumItems} extra={dashboardExtra} />
        )}
      </div>
    </div>
  );
}

function GroupTable<T extends { id: string }>({
  group,
  collapsed,
  onToggle,
  columns,
  getName,
  onRename,
  onOpen,
  onNewItem,
  sumItems,
}: {
  group: BoardGroup<T>;
  collapsed: boolean;
  onToggle: () => void;
  columns: BoardColumn<T>[];
  getName: (row: T) => string;
  onRename?: (row: T, name: string) => void;
  onOpen: (row: T) => void;
  onNewItem?: (groupId?: string) => void;
  sumItems?: (items: T[]) => number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });
  const minWidth = 280 + columns.reduce((s, c) => s + (c.width ?? 140), 0);

  return (
    <section ref={setNodeRef}>
      <header className="flex items-center" style={{ gap: 8, marginBottom: 6, paddingLeft: 4 }}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center"
          style={{ border: "none", background: "transparent", color: group.color, gap: 6, fontWeight: 700, fontSize: 16 }}
        >
          <ChevronDown size={16} style={{ transform: collapsed ? "rotate(-90deg)" : undefined, transition: "transform 120ms" }} />
          {group.title}
        </button>
        <span className="text-gray-500" style={{ fontSize: 13, fontWeight: 500 }}>
          {group.items.length}
        </span>
      </header>

      {!collapsed && (
        <div
          className="bg-white overflow-x-auto"
          style={{
            borderRadius: 8,
            boxShadow: "var(--shadow-card)",
            outline: isOver ? "2px solid var(--color-mon-blue)" : undefined,
          }}
        >
          <div style={{ minWidth }}>
            <div
              className="flex items-center text-gray-500"
              style={{
                borderBottom: "1px solid var(--color-gray-100)",
                fontSize: 13,
                fontWeight: 600,
                background: "white",
                borderLeft: `6px solid ${group.color}`,
              }}
            >
              <div style={{ width: 36 }} />
              <div className="monday-cell" style={{ width: 240, padding: "8px 12px" }}>
                Item
              </div>
              {columns.map((c) => (
                <div key={c.id} className="monday-cell" style={{ width: c.width ?? 140, padding: "8px 8px" }}>
                  {c.header}
                </div>
              ))}
            </div>

            <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {group.items.map((row) => (
                <BoardRow
                  key={row.id}
                  row={row}
                  groupColor={group.color}
                  columns={columns}
                  name={getName(row)}
                  onRename={onRename}
                  onOpen={onOpen}
                />
              ))}
            </SortableContext>

            <button
              type="button"
              onClick={() => onNewItem?.(group.id)}
              className="flex items-center w-full text-gray-400 hover:bg-gray-25"
              style={{
                minHeight: 36,
                padding: "0 12px 0 42px",
                gap: 8,
                fontSize: 13,
                border: "none",
                background: "transparent",
                borderLeft: `6px solid ${group.color}`,
              }}
            >
              <Plus size={14} /> Add item
            </button>

            <div
              className="flex items-center"
              style={{
                borderTop: "1px solid var(--color-gray-100)",
                borderLeft: `6px solid ${group.color}`,
                minHeight: 36,
                background: "var(--color-gray-25)",
              }}
            >
              <div style={{ width: 36 }} />
              <div className="monday-cell text-gray-500" style={{ width: 240, padding: "0 12px", fontSize: 12 }}>
                {group.items.length} item{group.items.length === 1 ? "" : "s"}
                {sumItems ? ` · ${formatCurrency(sumItems(group.items))}` : ""}
              </div>
              {columns.map((c) => (
                <div key={c.id} className="monday-cell" style={{ width: c.width ?? 140, padding: 0 }}>
                  {c.kind === "status" && c.statusOptions ? (
                    <StatusBar
                      items={group.items}
                      accessor={(id) => {
                        const row = group.items.find((i) => i.id === id);
                        return row ? c.getStatus?.(row) : undefined;
                      }}
                      options={c.statusOptions}
                    />
                  ) : c.kind === "number" && sumItems ? (
                    <div className="tabular text-gray-600" style={{ fontSize: 12, padding: "0 10px", lineHeight: "36px" }}>
                      {formatCurrency(sumItems(group.items))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BoardRow<T extends { id: string }>({
  row,
  groupColor,
  columns,
  name,
  onRename,
  onOpen,
}: {
  row: T;
  groupColor: string;
  columns: BoardColumn<T>[];
  name: string;
  onRename?: (row: T, name: string) => void;
  onOpen: (row: T) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <div
      ref={setNodeRef}
      className="monday-row flex items-stretch hover:bg-[#f5f6f8]"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        borderBottom: "1px solid var(--color-gray-100)",
        borderLeft: `6px solid ${groupColor}`,
        minHeight: 36,
      }}
    >
      <button
        type="button"
        className="flex items-center justify-center text-gray-300 hover:text-gray-500"
        style={{ width: 36, border: "none", background: "transparent", cursor: "grab" }}
        aria-label="Drag item"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className="monday-cell monday-sticky flex items-center bg-white" style={{ width: 240 }}>
        <TextCell value={name} onChange={onRename ? (t) => onRename(row, t) : undefined} strong />
        <button
          type="button"
          onClick={() => onOpen(row)}
          className="text-gray-400 hover:text-brand-600 shrink-0"
          style={{ border: "none", background: "transparent", fontSize: 11, paddingRight: 8, fontWeight: 600 }}
        >
          Open
        </button>
      </div>
      {columns.map((c) => (
        <div key={c.id} className="monday-cell" style={{ width: c.width ?? 140 }}>
          <ColumnCell column={c} row={row} />
        </div>
      ))}
    </div>
  );
}

function ColumnCell<T extends { id: string }>({ column, row }: { column: BoardColumn<T>; row: T }) {
  switch (column.kind) {
    case "status":
      return (
        <StatusCell
          value={column.getStatus?.(row)}
          options={column.statusOptions ?? []}
          onChange={column.onStatus ? (id) => column.onStatus!(row, id) : undefined}
        />
      );
    case "person":
      return (
        <PersonCell
          personId={column.getPerson?.(row)}
          onChange={column.onPerson ? (id) => column.onPerson!(row, id) : undefined}
        />
      );
    case "date":
      return (
        <DateCell
          value={column.getDate?.(row)}
          onChange={column.onDate ? (iso) => column.onDate!(row, iso) : undefined}
        />
      );
    case "text":
      return (
        <TextCell
          value={column.getText?.(row) ?? ""}
          onChange={column.onText ? (t) => column.onText!(row, t) : undefined}
        />
      );
    case "number":
      return (
        <div className="tabular" style={{ fontSize: 13, fontWeight: 600, padding: "0 10px", lineHeight: "36px" }}>
          {formatCurrency(column.getNumber?.(row) ?? 0)}
        </div>
      );
    case "custom":
      return <div className="h-full flex items-center">{column.render?.(row)}</div>;
    default:
      return null;
  }
}

function KanbanColumn<T extends { id: string }>({
  group,
  getName,
  columns,
  onOpen,
  statusCol,
  sumItems,
}: {
  group: BoardGroup<T>;
  getName: (row: T) => string;
  columns: BoardColumn<T>[];
  onOpen: (row: T) => void;
  statusCol?: BoardColumn<T>;
  sumItems?: (items: T[]) => number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${group.id}` });
  const personCol = columns.find((c) => c.kind === "person");
  const numberCol = columns.find((c) => c.kind === "number");
  return (
    <section
      ref={setNodeRef}
      className="shrink-0 flex flex-col"
      style={{
        width: 272,
        background: isOver ? "#eef4ff" : "var(--color-gray-50)",
        borderRadius: 8,
        minHeight: 280,
      }}
    >
      <div
        className="flex items-center justify-between text-white"
        style={{ background: group.color, borderRadius: "8px 8px 0 0", padding: "8px 12px", fontWeight: 700, fontSize: 14 }}
      >
        <span className="truncate">{group.title}</span>
        <span
          className="inline-flex items-center justify-center"
          style={{ minWidth: 22, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.25)", fontSize: 12, padding: "0 6px" }}
        >
          {group.items.length}
        </span>
      </div>
      {sumItems && (
        <div className="tabular text-gray-600" style={{ fontSize: 12, padding: "6px 12px 0" }}>
          {formatCurrency(sumItems(group.items))}
        </div>
      )}
      <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col" style={{ gap: 8, padding: 8, flex: 1 }}>
          {group.items.map((row) => (
            <KanbanCard key={row.id} row={row} getName={getName} onOpen={onOpen} statusCol={statusCol} personCol={personCol} numberCol={numberCol} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function KanbanCard<T extends { id: string }>({
  row,
  getName,
  onOpen,
  statusCol,
  personCol,
  numberCol,
}: {
  row: T;
  getName: (row: T) => string;
  onOpen: (row: T) => void;
  statusCol?: BoardColumn<T>;
  personCol?: BoardColumn<T>;
  numberCol?: BoardColumn<T>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <article
      ref={setNodeRef}
      className="bg-white overflow-hidden"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        borderRadius: 8,
        boxShadow: "var(--shadow-xs)",
        cursor: "grab",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(row)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen(row);
        }}
        style={{ padding: 12 }}
      >
        <div style={{ fontSize: 14, fontWeight: 700 }}>{getName(row)}</div>
        {numberCol && (
          <div className="tabular text-gray-600" style={{ fontSize: 12, marginTop: 4 }}>
            {formatCurrency(numberCol.getNumber?.(row) ?? 0)}
          </div>
        )}
      </div>
      {statusCol && (
        <StatusCell
          value={statusCol.getStatus?.(row)}
          options={statusCol.statusOptions ?? []}
          onChange={statusCol.onStatus ? (id) => statusCol.onStatus!(row, id) : undefined}
        />
      )}
      {personCol && (
        <div style={{ borderTop: "1px solid var(--color-gray-100)" }}>
          <PersonCell
            personId={personCol.getPerson?.(row)}
            onChange={personCol.onPerson ? (id) => personCol.onPerson!(row, id) : undefined}
          />
        </div>
      )}
    </article>
  );
}

function BoardCalendar<T extends { id: string }>({
  groups,
  getName,
  getDate,
  onOpen,
}: {
  groups: BoardGroup<T>[];
  getName: (row: T) => string;
  getDate?: (row: T) => string | null | undefined;
  onOpen: (row: T) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const items = groups.flatMap((g) => g.items.map((it) => ({ it, color: g.color })));
  const byDay = new Map<string, { it: T; color: string }[]>();
  for (const row of items) {
    const raw = getDate?.(row.it);
    if (!raw) continue;
    const iso = raw.includes("T") ? raw.slice(0, 10) : raw;
    const list = byDay.get(iso) ?? [];
    list.push(row);
    byDay.set(iso, list);
  }
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  const label = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-white" style={{ borderRadius: 8, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", fontSize: 18 }}>
          ‹
        </button>
        <h2 className="font-display" style={{ fontSize: 18 }}>
          {label}
        </h2>
        <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", fontSize: 18 }}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7" style={{ gap: 6 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-gray-500 text-center" style={{ fontSize: 11, fontWeight: 700 }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`p-${i}`} />;
          const y = day.getFullYear();
          const m = String(day.getMonth() + 1).padStart(2, "0");
          const dd = String(day.getDate()).padStart(2, "0");
          const iso = `${y}-${m}-${dd}`;
          const list = byDay.get(iso) ?? [];
          return (
            <div
              key={iso}
              className="rounded-md"
              style={{ minHeight: 88, border: "1px solid var(--color-gray-100)", padding: 6, background: "white" }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{day.getDate()}</div>
              {list.slice(0, 3).map((row) => (
                <button
                  key={row.it.id}
                  type="button"
                  onClick={() => onOpen(row.it)}
                  className="w-full truncate text-left text-white"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: row.color,
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 6px",
                    marginBottom: 3,
                  }}
                >
                  {getName(row.it)}
                </button>
              ))}
              {list.length > 3 && (
                <div className="text-gray-500" style={{ fontSize: 10 }}>
                  +{list.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoardDash<T>({
  groups,
  sumItems,
  extra,
}: {
  groups: BoardGroup<T>[];
  sumItems?: (items: T[]) => number;
  extra?: ReactNode;
}) {
  const segs = groupsToSegments(groups);
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const value = sumItems ? groups.reduce((s, g) => s + sumItems(g.items), 0) : null;
  return (
    <div className="grid" style={{ gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
      <NumberWidget label="Items on this board" value={total} color="var(--color-brand-600)" />
      {value != null && <NumberWidget label="Pipeline value" value={formatCurrency(value)} color="#00c875" />}
      <NumberWidget label="Groups" value={groups.length} color="#fdab3d" />
      <div className="col-span-full grid" style={{ gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <StatusPieWidget title="By group" segments={segs} />
        <StatusBarChartWidget title="Volume" segments={segs} />
        <FunnelWidget
          title="Funnel"
          stages={groups.map((g) => ({
            label: g.title,
            count: g.items.length,
            color: g.color,
            value: sumItems ? sumItems(g.items) : undefined,
          }))}
        />
      </div>
      {extra && <div className="col-span-full">{extra}</div>}
    </div>
  );
}

