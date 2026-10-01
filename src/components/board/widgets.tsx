"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { StatusOption } from "@/lib/monday";

export function NumberWidget({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
}) {
  return (
    <div
      className="bg-white h-full"
      style={{
        borderRadius: 8,
        padding: 16,
        boxShadow: "var(--shadow-card)",
        borderTop: `4px solid ${color ?? "var(--color-brand-600)"}`,
      }}
    >
      <div className="text-gray-500" style={{ fontSize: 13, fontWeight: 500 }}>
        {label}
      </div>
      <div className="font-display tabular" style={{ fontSize: 32, lineHeight: 1.15, marginTop: 8 }}>
        {value}
      </div>
      {hint && (
        <div className="text-gray-500" style={{ fontSize: 12, marginTop: 6 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function StatusPieWidget({
  title,
  segments,
}: {
  title: string;
  segments: { name: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="bg-white h-full" style={{ borderRadius: 8, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-display" style={{ fontSize: 15, marginBottom: 8 }}>
        {title}
      </h3>
      <div className="flex items-center" style={{ gap: 16 }}>
        <div style={{ width: 140, height: 140, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={segments} dataKey="value" innerRadius={42} outerRadius={64} stroke="none" startAngle={90} endAngle={-270}>
                {segments.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="font-display tabular" style={{ fontSize: 20 }}>
              {segments.reduce((s, d) => s + d.value, 0)}
            </div>
            <div className="text-gray-500" style={{ fontSize: 11 }}>
              items
            </div>
          </div>
        </div>
        <ul className="flex-1 min-w-0" style={{ fontSize: 12 }}>
          {segments.map((d) => (
            <li key={d.name} className="flex items-center" style={{ gap: 8, padding: "3px 0" }}>
              <span className="rounded-sm shrink-0" style={{ width: 10, height: 10, background: d.color }} />
              <span className="truncate flex-1">{d.name}</span>
              <span className="tabular text-gray-600">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function StatusBarChartWidget({
  title,
  segments,
}: {
  title: string;
  segments: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="bg-white h-full" style={{ borderRadius: 8, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-display" style={{ fontSize: 15, marginBottom: 8 }}>
        {title}
      </h3>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={segments}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {segments.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FunnelWidget({
  title,
  stages,
}: {
  title: string;
  stages: { label: string; count: number; color: string; value?: number }[];
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="bg-white h-full" style={{ borderRadius: 8, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-display" style={{ fontSize: 15, marginBottom: 12 }}>
        {title}
      </h3>
      <div className="flex flex-col" style={{ gap: 8 }}>
        {stages.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between" style={{ fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
              <span className="tabular text-gray-600">
                {s.count}
                {s.value != null ? ` · ${formatCurrency(s.value)}` : ""}
              </span>
            </div>
            <div className="overflow-hidden" style={{ height: 18, borderRadius: 4, background: "var(--color-gray-50)" }}>
              <div style={{ width: `${Math.max(8, (s.count / max) * 100)}%`, height: "100%", background: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function groupsToSegments<T>(
  groups: { title: string; color: string; items: T[] }[]
): { name: string; value: number; color: string }[] {
  return groups.map((g) => ({ name: g.title, value: g.items.length, color: g.color }));
}

export function statusCounts<T>(
  items: T[],
  accessor: (row: T) => string,
  options: StatusOption[]
): { name: string; value: number; color: string }[] {
  return options.map((o) => ({
    name: o.label,
    value: items.filter((i) => accessor(i) === o.id).length,
    color: o.color,
  }));
}
