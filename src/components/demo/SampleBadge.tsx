import type { ReactNode } from "react";

export function SampleBadge(props?: { className?: string }) {
  void props;
  return null;
}

export function SampleBanner({ children }: { children?: ReactNode }) {
  return (
    <div
      className="flex items-start"
      style={{
        gap: 10,
        padding: "10px 12px",
        marginBottom: 16,
        background: "var(--color-brand-50)",
        border: "1px solid var(--color-brand-100)",
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.45,
        color: "var(--color-gray-700)",
      }}
    >
      <span className="rounded-full shrink-0" style={{ width: 8, height: 8, marginTop: 5, background: "var(--color-brand-600)" }} />
      <div>{children ?? "Showing demo records for the layout mock. Live production data is not overwritten."}</div>
    </div>
  );
}
