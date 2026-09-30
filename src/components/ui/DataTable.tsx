"use client";

/**
 * DataTable — the primary data display for lists across the CRM.
 *
 * Wraps TanStack Table v8 (headless) for sort + pagination, with bespoke
 * styling per DESIGN.md:
 *
 *   - Card header (SectionCard pattern) with title + actions
 *   - Header row: Fog background, Inter 13px weight 500 Slate, uppercase,
 *     letter-spacing 0.04em
 *   - Data rows: Paper (odd) / Fog (even) alternating, 48px height
 *   - Hover: Chalk background
 *   - Selected: Signal Orange 8% opacity background + 2px Signal Orange left border
 *   - 1px Chalk horizontal row borders (no vertical cell borders)
 *   - 16px horizontal cell padding
 *   - Sortable columns: chevron on hover; active sort = solid Signal Orange chevron
 *   - Last column: action icons (eye/pencil/trash) appear only on row hover
 *
 * Built on @tanstack/react-table v8.
 */

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import type { LucideIcon } from "lucide-react";

export interface DataTableProps<T> {
  /** Column definitions (TanStack ColumnDef[]) */
  columns: ColumnDef<T>[];
  /** Row data */
  data: T[];
  /** Unique row id accessor — used for selection state */
  getRowId?: (row: T, index: number) => string;
  /** Optional icon for the empty state */
  emptyIcon?: LucideIcon;
  /** Title for the empty state */
  emptyTitle?: string;
  /** Description for the empty state */
  emptyDescription?: string;
  /** Optional CTA inside the empty state */
  emptyAction?: { label: string; onClick?: () => void };
  /** Whether to enable row selection (checkbox column) */
  enableSelection?: boolean;
  /** Controlled row selection */
  rowSelection?: RowSelectionState;
  /** Callback for row selection changes */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Whether to enable pagination (default: true for > 10 rows) */
  enablePagination?: boolean;
  /** Default page size */
  pageSize?: number;
  /** Row click handler — when set, rows become clickable */
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
  enableSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enablePagination,
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const handleRowSelectionChange = (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
    const next = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
    if (onRowSelectionChange) {
      onRowSelectionChange(next);
    } else {
      setInternalRowSelection(next);
    }
  };

  const shouldPaginate = enablePagination ?? data.length > pageSize;

  const finalColumns: ColumnDef<T>[] = enableSelection
    ? [
        {
          id: "_select",
          header: ({ table }) => (
            <input
              type="checkbox"
              aria-label="Select all rows"
              checked={table.getIsAllRowsSelected()}
              ref={(el) => {
                if (el) el.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="cursor-pointer"
              style={{ accentColor: "var(--color-carbon)" }}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label={`Select row ${row.index + 1}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer"
              style={{ accentColor: "var(--color-carbon)" }}
            />
          ),
          enableSorting: false,
          size: 40,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    getRowId: getRowId ? (row, index) => getRowId(row as T, index) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: shouldPaginate ? getPaginationRowModel() : undefined,
    initialState: shouldPaginate ? { pagination: { pageSize } } : undefined,
    enableRowSelection: enableSelection,
  });

  const rowModel = table.getRowModel();
  const isEmpty = rowModel.rows.length === 0;

  return (
    <div
      className="bg-paper rounded-md overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ background: "var(--color-fog)" }}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  const align = (header.column.columnDef.meta as { align?: "left" | "right" | "center" } | undefined)?.align ?? "left";
                  return (
                    <th
                      key={header.id}
                      style={{
                        textAlign: align,
                        padding: "12px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: "var(--color-gray-600)",
                        textTransform: "none",
                        letterSpacing: "0",
                        width: header.id === "_select" ? "40px" : header.getSize() || undefined,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center",
                            align === "right" && "flex-row-reverse",
                            align === "center" && "justify-center"
                          )}
                          style={{
                            gap: "4px",
                            color: sortDir ? "var(--color-signal-orange)" : "var(--color-slate)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            font: "inherit",
                            textTransform: "inherit",
                            letterSpacing: "inherit",
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ChevronUp size={12} strokeWidth={2.5} />
                          ) : sortDir === "desc" ? (
                            <ChevronDown size={12} strokeWidth={2.5} />
                          ) : (
                            <ChevronsUpDown size={12} strokeWidth={2} style={{ opacity: 0.5 }} />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {!isEmpty &&
              rowModel.rows.map((row, rowIdx) => {
                const selected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        (e.currentTarget as HTMLElement).style.background = "var(--color-chalk)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        const bg = rowIdx % 2 === 0 ? "var(--color-paper)" : "var(--color-fog)";
                        (e.currentTarget as HTMLElement).style.background = bg;
                      }
                    }}
                    style={{
                      background: selected
                        ? "color-mix(in srgb, var(--color-signal-orange) 8%, transparent)"
                        : rowIdx % 2 === 0
                        ? "var(--color-paper)"
                        : "var(--color-fog)",
                      borderTop: "1px solid var(--color-chalk)",
                      cursor: onRowClick ? "pointer" : undefined,
                      position: "relative",
                      transition: "background 120ms ease-out",
                    }}
                  >
                    {selected && (
                      <td
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "2px",
                          background: "var(--color-signal-orange)",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    {row.getVisibleCells().map((cell) => {
                      const align = (cell.column.columnDef.meta as { align?: "left" | "right" | "center" } | undefined)?.align ?? "left";
                      return (
                        <td
                          key={cell.id}
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "var(--color-carbon)",
                            textAlign: align,
                            verticalAlign: "middle",
                            height: "48px",
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Empty state */}
        {isEmpty && (
          <EmptyState
            icon={emptyIcon ?? ChevronsUpDown}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        )}
      </div>

      {/* Pagination */}
      {shouldPaginate && !isEmpty && (
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--color-chalk)",
            background: "var(--color-paper)",
          }}
        >
          <span className="text-slate" style={{ fontSize: "13px" }}>
            {(() => {
              const total = table.getFilteredRowModel().rows.length;
              const pageIndex = table.getState().pagination.pageIndex;
              const pageSize2 = table.getState().pagination.pageSize;
              const start = pageIndex * pageSize2 + 1;
              const end = Math.min(start + pageSize2 - 1, total);
              return `${start}–${end} of ${total}`;
            })()}
          </span>
          <Pagination table={table} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination sub-component
// ---------------------------------------------------------------------------

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Table } from "@tanstack/react-table";

function Pagination<T>({ table }: { table: Table<T> }) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  // Build a windowed page list: always show first, last, current, ±1 around current
  const pages: (number | "ellipsis")[] = [];
  const add = (p: number | "ellipsis") => {
    if (!pages.includes(p)) pages.push(p);
  };
  for (let i = 0; i < pageCount; i++) {
    if (i === 0 || i === pageCount - 1 || Math.abs(i - currentPage) <= 1) {
      add(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      add("ellipsis");
    }
  }

  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      {/* Page size */}
      <label className="flex items-center text-slate" style={{ fontSize: "13px", gap: "6px" }}>
        Per page:
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="bg-paper text-carbon"
          style={{
            height: "28px",
            padding: "0 24px 0 8px",
            fontSize: "13px",
            border: "1px solid var(--color-chalk)",
            borderRadius: "8px",
            appearance: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* Prev */}
      <button
        type="button"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="text-carbon bg-paper border border-chalk rounded-xl transition-colors"
        style={{
          height: "28px",
          padding: "0 10px",
          fontSize: "13px",
          fontWeight: 500,
          cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
          opacity: table.getCanPreviousPage() ? 1 : 0.4,
        }}
      >
        <ChevronLeft size={14} strokeWidth={2} style={{ verticalAlign: "middle", marginRight: "2px" }} />
        Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="text-slate" style={{ fontSize: "13px", padding: "0 4px" }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => table.setPageIndex(p)}
            className="rounded-xl"
            style={{
              minWidth: "28px",
              height: "28px",
              padding: "0 8px",
              fontSize: "13px",
              fontWeight: 500,
              background: p === currentPage ? "var(--color-carbon)" : "var(--color-paper)",
              color: p === currentPage ? "var(--color-paper)" : "var(--color-carbon)",
              border: p === currentPage ? "1px solid var(--color-carbon)" : "1px solid var(--color-chalk)",
              cursor: "pointer",
            }}
          >
            {p + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="text-carbon bg-paper border border-chalk rounded-xl transition-colors"
        style={{
          height: "28px",
          padding: "0 10px",
          fontSize: "13px",
          fontWeight: 500,
          cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
          opacity: table.getCanNextPage() ? 1 : 0.4,
        }}
      >
        Next
        <ChevronRight size={14} strokeWidth={2} style={{ verticalAlign: "middle", marginLeft: "2px" }} />
      </button>
    </div>
  );
}

export { Pagination };
