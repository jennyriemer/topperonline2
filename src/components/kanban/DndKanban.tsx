"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export type KanbanColumn<T> = {
  id: string;
  title: string;
  hint?: string;
  dot: string;
  items: T[];
  sum?: number;
};

export function DndKanban<T extends { id: string }>({
  columns,
  onMove,
  renderCard,
  renderOverlay,
}: {
  columns: KanbanColumn<T>[];
  onMove: (id: string, toColumn: string) => void;
  renderCard: (item: T, columnId: string) => React.ReactNode;
  renderOverlay?: (item: T) => React.ReactNode;
}) {
  const [active, setActive] = useState<T | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const itemMap = useMemo(() => {
    const m = new Map<string, { item: T; columnId: string }>();
    columns.forEach((c) => c.items.forEach((it) => m.set(it.id, { item: it, columnId: c.id })));
    return m;
  }, [columns]);

  const onDragStart = (e: DragStartEvent) => {
    const found = itemMap.get(String(e.active.id));
    setActive(found?.item ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const { active: a, over } = e;
    if (!over) return;
    const from = itemMap.get(String(a.id));
    if (!from) return;
    const overId = String(over.id);
    const toCol = columns.some((c) => c.id === overId) ? overId : itemMap.get(overId)?.columnId;
    if (toCol && toCol !== from.columnId) onMove(from.item.id, toCol);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div
        className="flex"
        style={{ gap: 8, overflowX: "auto", paddingBottom: 12, marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}
      >
        {columns.map((col) => (
          <KanbanCol key={col.id} column={col} renderCard={renderCard} />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="kanban-lift" style={{ width: 272 }}>
            {renderOverlay ? renderOverlay(active) : renderCard(active, "")}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanCol<T extends { id: string }>({
  column,
  renderCard,
}: {
  column: KanbanColumn<T>;
  renderCard: (item: T, columnId: string) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section
      ref={setNodeRef}
      className="flex flex-col shrink-0"
      style={{
        width: 272,
        borderRadius: 12,
        background: isOver ? "var(--color-brand-50)" : "var(--color-gray-50)",
        border: isOver ? "1px solid var(--color-brand-200)" : "1px solid transparent",
        minHeight: 280,
        padding: 8,
        transition: "background 150ms var(--ease-attio)",
      }}
    >
      <header className="flex items-start" style={{ padding: "6px 6px 10px", gap: 8 }}>
        <span className="rounded-full shrink-0" style={{ width: 8, height: 8, marginTop: 5, background: column.dot }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{column.title}</span>
            <span
              className="inline-flex items-center justify-center"
              style={{ minWidth: 20, height: 18, borderRadius: 999, background: "var(--color-gray-100)", fontSize: 11, fontWeight: 600, padding: "0 6px" }}
            >
              {column.items.length}
            </span>
          </div>
          {column.sum != null && (
            <div className="text-gray-600 tabular" style={{ fontSize: 12, marginTop: 2 }}>
              {formatCurrency(column.sum)}
            </div>
          )}
          {column.hint && <div className="text-gray-400" style={{ fontSize: 11, marginTop: 2 }}>{column.hint}</div>}
        </div>
        <button type="button" className="text-gray-400 hover:text-ink" style={{ border: "none", background: "transparent" }} aria-label="Add">
          <Plus size={14} />
        </button>
      </header>
      <SortableContext items={column.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col" style={{ gap: 8, flex: 1 }}>
          {column.items.map((item) => (
            <SortableCard key={item.id} id={item.id}>
              {renderCard(item, column.id)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
      }}
      className={cn(isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function KanbanCardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <article
      className={cn("bg-white", className)}
      style={{
        borderRadius: 10,
        padding: 12,
        border: "1px solid var(--color-gray-150)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {children}
    </article>
  );
}
