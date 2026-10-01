import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { Sparkline } from "./Sparkline";

export type KpiDeltaDirection = "up" | "down" | "neutral";
export type KpiDeltaTone = "good" | "bad";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconAccent?: "orange" | "bronze" | "blue" | "yellow";
  deltaDirection?: KpiDeltaDirection;
  deltaValue?: string;
  contextLabel?: string;
  href?: string;
  onClick?: () => void;
  tone?: KpiDeltaTone;
  sparkline?: number[];
}

const ICON_BG: Record<NonNullable<KpiCardProps["iconAccent"]>, { bg: string; fg: string }> = {
  orange: { bg: "var(--color-info-bg)", fg: "var(--color-brand-600)" },
  blue: { bg: "var(--color-info-bg)", fg: "var(--color-brand-600)" },
  bronze: { bg: "var(--color-warning-bg)", fg: "var(--color-yellow-700)" },
  yellow: { bg: "var(--color-yellow-100)", fg: "var(--color-yellow-700)" },
};

function effectiveVariant(dir: KpiDeltaDirection, tone: KpiDeltaTone): KpiDeltaDirection {
  if (tone === "good" || dir === "neutral") return dir;
  return dir === "up" ? "down" : "up";
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconAccent = "blue",
  deltaDirection,
  deltaValue,
  contextLabel,
  href,
  onClick,
  tone = "good",
  sparkline,
}: KpiCardProps) {
  const accent = ICON_BG[iconAccent] ?? ICON_BG.blue;
  const inner = (
    <>
      <div className="flex items-start justify-between" style={{ marginBottom: 10 }}>
        <span className="text-gray-600" style={{ fontSize: 13, fontWeight: 500 }}>
          {label}
        </span>
        {Icon && (
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{ width: 28, height: 28, background: accent.bg, color: accent.fg }}
          >
            <Icon size={14} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between" style={{ gap: 8 }}>
        <div>
          <div className="font-display text-ink tabular" style={{ fontSize: 28, lineHeight: 1.1 }}>
            {value}
          </div>
          {(deltaDirection || contextLabel) && (
            <div className="flex items-center" style={{ gap: 6, marginTop: 8 }}>
              {deltaDirection && deltaValue && (() => {
                const variant = effectiveVariant(deltaDirection, tone);
                return (
                  <span
                    className={cn("inline-flex items-center")}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 6,
                      gap: 2,
                      background: variant === "up" ? "var(--color-success-bg)" : variant === "down" ? "var(--color-danger-bg)" : "var(--color-gray-100)",
                      color: variant === "up" ? "var(--color-success-fg)" : variant === "down" ? "var(--color-danger-fg)" : "var(--color-gray-700)",
                    }}
                  >
                    {variant === "up" ? <TrendingUp size={12} /> : variant === "down" ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {deltaValue}
                  </span>
                );
              })()}
              {contextLabel && <span className="text-gray-500" style={{ fontSize: 12 }}>{contextLabel}</span>}
            </div>
          )}
        </div>
        {sparkline && <Sparkline values={sparkline} />}
      </div>
    </>
  );

  const card = <Card padding={16} hoverable={!!(href || onClick)} className="h-full">{inner}</Card>;
  if (href) return <Link href={href} className="block">{card}</Link>;
  if (onClick) {
    return (
      <Card padding={16} hoverable role="button" tabIndex={0} onClick={onClick} className="block">
        {inner}
      </Card>
    );
  }
  return <Card padding={16}>{inner}</Card>;
}
