import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusVariant = "green" | "amber" | "red" | "blue" | "purple" | "neutral" | "yellow";

interface StatusBadgeProps {
  variant?: StatusVariant;
  withDot?: boolean;
  children: ReactNode;
  className?: string;
}

const STYLES: Record<StatusVariant, { bg: string; fg: string; dot: string }> = {
  green: { bg: "var(--color-success-bg)", fg: "var(--color-success-fg)", dot: "var(--color-success)" },
  amber: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-fg)", dot: "var(--color-warning)" },
  yellow: { bg: "var(--color-yellow-100)", fg: "var(--color-yellow-700)", dot: "var(--color-yellow-400)" },
  red: { bg: "var(--color-danger-bg)", fg: "var(--color-danger-fg)", dot: "var(--color-danger)" },
  blue: { bg: "var(--color-info-bg)", fg: "var(--color-info-fg)", dot: "var(--color-brand-600)" },
  purple: { bg: "var(--color-purple-bg)", fg: "var(--color-purple-fg)", dot: "var(--color-purple)" },
  neutral: { bg: "var(--color-gray-100)", fg: "var(--color-gray-700)", dot: "var(--color-gray-500)" },
};

export function StatusBadge({
  variant = "green",
  withDot = true,
  children,
  className,
}: StatusBadgeProps) {
  const s = STYLES[variant] ?? STYLES.neutral;
  return (
    <span
      className={cn("inline-flex items-center font-medium", className)}
      style={{
        height: "22px",
        paddingLeft: withDot ? "8px" : "8px",
        paddingRight: "8px",
        borderRadius: "6px",
        background: s.bg,
        color: s.fg,
        fontSize: "12px",
        lineHeight: 1,
        gap: "6px",
        whiteSpace: "nowrap",
      }}
    >
      {withDot && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: s.dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
