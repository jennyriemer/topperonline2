import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-xl text-sienna-bronze", className)}
      style={{
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 8px",
        background: "color-mix(in srgb, var(--color-sienna-bronze) 12%, transparent)",
      }}
    >
      Sample
    </span>
  );
}

export function SampleBanner({ children }: { children?: ReactNode }) {
  return (
    <div
      className="rounded-md flex items-start"
      style={{
        gap: "10px",
        padding: "10px 14px",
        marginBottom: "20px",
        background: "color-mix(in srgb, var(--color-signal-orange) 8%, white)",
        border: "1px solid color-mix(in srgb, var(--color-signal-orange) 22%, transparent)",
        fontSize: "13px",
        lineHeight: 1.45,
        color: "var(--color-graphite)",
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: "8px",
          height: "8px",
          marginTop: "5px",
          background: "var(--color-signal-orange)",
        }}
      />
      <div>
        {children ?? (
          <>
            Showing labeled sample records for the layout mock. Live production data is not overwritten.
          </>
        )}
      </div>
    </div>
  );
}
