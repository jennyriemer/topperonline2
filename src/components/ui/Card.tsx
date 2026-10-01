/**
 * Card primitives — the elevation mechanism for the entire app.
 *
 * From DESIGN.md:
 *   - Cards always on Mist canvas (#efefef) with Paper (#ffffff) surfaces
 *   - 8px corner radius
 *   - Elevation comes from gentle background shifts, not heavy shadows
 *   - Resting:  0 1px 3px rgba(32,32,32,0.04), 0 4px 12px rgba(32,32,32,0.03)
 *   - Hover:    0 2px 6px rgba(32,32,32,0.06), 0 8px 20px rgba(32,32,32,0.05)
 *
 * Three variants:
 *   - Card:           basic Paper surface, resting shadow
 *   - CardHoverable:  same but with hover shadow for interactive cards
 *   - SectionCard:    Card + header (title left, actions right) + 1px Chalk divider
 */

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Override the default 24px padding */
  padding?: number | string;
  /** Visual hover treatment (slight shadow lift) */
  hoverable?: boolean;
}

export function Card({ children, padding = 24, hoverable, className, style, ...rest }: CardProps) {
  const paddingValue = typeof padding === "number" ? `${padding}px` : padding;
  return (
    <div
      className={cn(
        "bg-paper rounded-lg",
        hoverable && "transition-shadow hover:shadow-card-hover cursor-pointer",
        className
      )}
      style={{
        padding: paddingValue,
        boxShadow: hoverable
          ? "var(--shadow-card)"
          : "var(--shadow-card)",
        transition: hoverable ? "box-shadow 160ms ease-out" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SectionCardProps extends Omit<CardProps, "padding" | "title"> {
  /** Title (left of header) */
  title: ReactNode;
  /** Optional subtitle below title */
  subtitle?: ReactNode;
  /** Right-side action cluster (buttons, search, etc.) */
  actions?: ReactNode;
  /** Card body padding override (default 24px) */
  bodyPadding?: number;
  /** Whether to remove the bottom border (when the body is also a table header) */
  noHeaderBorder?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  actions,
  bodyPadding = 24,
  noHeaderBorder,
  children,
  className,
  ...rest
}: SectionCardProps) {
  return (
    <div
      className={cn("bg-paper rounded-md overflow-hidden", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
      {...rest}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "20px 24px",
          borderBottom: noHeaderBorder ? "none" : "1px solid var(--color-chalk)",
          gap: "16px",
        }}
      >
        <div className="min-w-0">
          <div
            className="text-carbon"
            style={{
              fontFamily: "var(--font-inter)",
              fontOpticalSizing: "auto",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div className="text-slate mt-4" style={{ fontSize: "13px", lineHeight: 1.2 }}>
              {subtitle}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center shrink-0" style={{ gap: "8px" }}>{actions}</div>}
      </div>

      {/* Body */}
      <div style={{ padding: `${bodyPadding}px` }}>{children}</div>
    </div>
  );
}
