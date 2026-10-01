"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { STAFF, staffById, type StaffPerson } from "@/lib/monday";

export function PersonCell({
  personId,
  people = STAFF,
  onChange,
}: {
  personId: string | null | undefined;
  people?: StaffPerson[];
  onChange?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const person = staffById(personId) ?? people.find((p) => p.id === personId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative h-full w-full min-h-[36px]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onChange) setOpen((v) => !v);
        }}
        className="h-full w-full flex items-center"
        style={{
          gap: 8,
          padding: "0 10px",
          border: "none",
          background: "transparent",
          fontSize: 13,
          minHeight: 36,
        }}
      >
        {person ? (
          <>
            <Avatar name={person.name} size={24} />
            <span className="truncate hidden sm:inline" style={{ fontWeight: 500 }}>
              {person.name.split(" ")[0]}
            </span>
          </>
        ) : (
          <span
            className="inline-flex items-center justify-center rounded-full text-gray-400"
            style={{ width: 24, height: 24, border: "1px dashed var(--color-gray-300)", fontSize: 12 }}
          >
            +
          </span>
        )}
      </button>
      {open && onChange && (
        <div
          className="absolute z-50 bg-white overflow-hidden"
          style={{
            top: "100%",
            left: 0,
            minWidth: 200,
            boxShadow: "var(--shadow-lg)",
            borderRadius: 8,
            border: "1px solid var(--color-gray-150)",
            padding: 6,
          }}
        >
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(p.id);
                setOpen(false);
              }}
              className="w-full flex items-center rounded-md hover:bg-gray-50"
              style={{ gap: 8, padding: "6px 8px", border: "none", background: personId === p.id ? "var(--color-gray-50)" : "transparent", fontSize: 13 }}
            >
              <Avatar name={p.name} size={22} />
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
