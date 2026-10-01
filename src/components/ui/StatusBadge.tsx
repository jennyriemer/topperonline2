import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusVariant = "green" | "amber" | "red" | "blue" | "purple" | "neutral" | "yellow";

interface StatusBadgeProps {
  variant?: StatusVariant;
  withDot?: boolean;
  children: ReactNode;
  className?: string;
}

const STYLES: Record<StatusVariant, { bg: string; fg: string }> = {
  green: { bg: "#00c875", fg: "#ffffff" },
  amber: { bg: "#fdab3d", fg: "#ffffff" },
  yellow: { bg: "#ffcb00", fg: "#323338" },
  red: { bg: "#e2445c", fg: "#ffffff" },
  blue: { bg: "#579bfc", fg: "#ffffff" },
  purple: { bg: "#a25ddc", fg: "#ffffff" },
  neutral: { bg: "#c4c4c4", fg: "#323338" },
};

export function StatusBadge({
  variant = "green",
  withDot = false,
  children,
  className,
}: StatusBadgeProps) {
  const s = STYLES[variant] ?? STYLES.neutral;
  return (
    <span
      className={cn("inline-flex items-center font-semibold", className)}
      style={{
        height: 22,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 4,
        background: s.bg,
        color: s.fg,
        fontSize: 12,
        lineHeight: 1,
        gap: 6,
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
            background: s.fg,
            flexShrink: 0,
            opacity: 0.9,
          }}
        />
      )}
      {children}
    </span>
  );
}
