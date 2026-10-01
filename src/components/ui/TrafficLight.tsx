import type { TrafficLight } from "@/lib/demo/crm";
import { TRAFFIC_RED_DAYS, TRAFFIC_YELLOW_DAYS } from "@/lib/demo/crm";

const COLOR: Record<TrafficLight, string> = {
  green: "var(--color-status-green)",
  yellow: "var(--color-status-amber)",
  red: "var(--color-status-red)",
};

const LABEL: Record<TrafficLight, string> = {
  green: "On track",
  yellow: `Quiet ${TRAFFIC_YELLOW_DAYS}+ days`,
  red: `Stale ${TRAFFIC_RED_DAYS}+ days`,
};

export function TrafficLightDot({
  value,
  withLabel = false,
  size = 10,
}: {
  value: TrafficLight;
  withLabel?: boolean;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center" style={{ gap: "6px" }} title={LABEL[value]}>
      <span
        aria-label={LABEL[value]}
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: COLOR[value],
          boxShadow: `0 0 0 3px color-mix(in srgb, ${COLOR[value]} 22%, transparent)`,
          flexShrink: 0,
        }}
      />
      {withLabel && (
        <span className="text-graphite" style={{ fontSize: "11px", fontWeight: 600 }}>
          {LABEL[value]}
        </span>
      )}
    </span>
  );
}
