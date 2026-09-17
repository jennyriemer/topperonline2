/**
 * Metric KPI Card — the dashboard stat tile.
 *
 * Design rules (from DESIGN.md):
 *   - White (Paper) card, 8px radius, 24px padding, resting elevation shadow
 *   - Top row: label in Inter 14px weight 500 Slate; small circular icon
 *     (20px) in Signal Orange or Sienna Bronze, right-aligned
 *   - Middle: value in Space Grotesk 32px weight 600 Carbon, letter-spacing -0.64px
 *   - Bottom row: delta indicator (small arrow + Inter 12px text)
 *     - Positive delta: Status Green
 *     - Negative delta: Status Red
 *     - Neutral: Slate
 *   - Followed by a short context label in Inter 12px Slate
 *     (e.g. "vs. last month", "this week")
 */

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

export type KpiDeltaDirection = "up" | "down" | "neutral";
/**
 * `tone` controls whether a rising direction is good (green) or bad (red).
 * Use "good" for revenue, completed installs, etc.
 * Use "bad"  for overdue, churn, outstanding complaints, etc.
 * Defaults to "good".
 */
export type KpiDeltaTone = "good" | "bad";

interface KpiCardProps {
  /** Top-row label (e.g. "Today's Installs") */
  label: string;
  /** Main value to display (e.g. "12", "$48,200") */
  value: string | number;
  /** Optional icon (Lucide component) */
  icon?: LucideIcon;
  /** Icon accent color — defaults to Signal Orange */
  iconAccent?: "orange" | "bronze";
  /** Delta direction (up = positive, down = negative) */
  deltaDirection?: KpiDeltaDirection;
  /** Delta value as a string (e.g. "+12%", "-$1,200", "0%") */
  deltaValue?: string;
  /** Context label after the delta (e.g. "vs. last month") */
  contextLabel?: string;
  /** Optional href to make the card a link */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Whether a rising direction is good (green) or bad (red). Default "good". */
  tone?: KpiDeltaTone;
}

const ACCENT_VAR = {
  orange: "var(--color-signal-orange)",
  bronze: "var(--color-sienna-bronze)",
};

const DELTA_TEXT = {
  up: "text-status-green",
  down: "text-status-red",
  neutral: "text-slate",
};

const DELTA_BG = {
  up: "color-mix(in srgb, var(--color-status-green) 12%, transparent)",
  down: "color-mix(in srgb, var(--color-status-red) 12%, transparent)",
  neutral: "var(--color-fog)",
};

const DeltaIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/**
 * Flip direction-to-color for "bad" tone metrics. Returns the actual
 * StatusVariant the pill should be rendered with.
 */
function effectiveVariant(dir: KpiDeltaDirection, tone: KpiDeltaTone): KpiDeltaDirection {
  if (tone === "good" || dir === "neutral") return dir;
  // tone === "bad": rising is bad -> show red, falling is good -> show green
  return dir === "up" ? "down" : "up";
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconAccent = "orange",
  deltaDirection,
  deltaValue,
  contextLabel,
  href,
  onClick,
  tone = "good",
}: KpiCardProps) {
  const inner = (
    <>
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between" style={{ marginBottom: "12px" }}>
        <span
          className="text-slate"
          style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.2 }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: "28px",
              height: "28px",
              background: iconAccent === "orange"
                ? "color-mix(in srgb, var(--color-signal-orange) 12%, transparent)"
                : "color-mix(in srgb, var(--color-sienna-bronze) 12%, transparent)",
            }}
            aria-hidden="true"
          >
            <Icon size={16} strokeWidth={2} style={{ color: ACCENT_VAR[iconAccent] }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="text-carbon"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "32px",
          fontWeight: 600,
          lineHeight: 1.0,
          letterSpacing: "-0.64px",
          marginBottom: "12px",
        }}
      >
        {value}
      </div>

      {/* Delta + context */}
      {(deltaDirection || contextLabel) && (
        <div className="flex items-center" style={{ gap: "6px" }}>
          {deltaDirection && deltaValue && (() => {
            // For "bad" tone, invert the visual variant so up=red, down=green
            const variant = effectiveVariant(deltaDirection, tone);
            return (
              <span
                className={cn("inline-flex items-center", DELTA_TEXT[variant])}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: DELTA_BG[variant],
                  gap: "2px",
                }}
              >
                {(() => {
                  const DIcon = DeltaIcon[variant];
                  return <DIcon size={12} strokeWidth={2.5} />;
                })()}
                {deltaValue}
              </span>
            );
          })()}
          {contextLabel && (
            <span
              className="text-slate"
              style={{ fontSize: "12px", lineHeight: 1.2 }}
            >
              {contextLabel}
            </span>
          )}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card padding={24} hoverable className="h-full">
          {inner}
        </Card>
      </Link>
    );
  }

  if (onClick) {
    const interactiveProps = {
      role: "button" as const,
      tabIndex: 0,
      onClick,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      },
    };
    return (
      <Card padding={24} hoverable {...interactiveProps} className="block">
        {inner}
      </Card>
    );
  }

  return <Card padding={24}>{inner}</Card>;
}
