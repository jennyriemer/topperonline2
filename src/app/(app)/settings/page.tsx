"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Button, Card } from "@/components/ui";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { NUDGE_AFTER_DAYS, TRAFFIC_RED_DAYS, TRAFFIC_YELLOW_DAYS } from "@/lib/demo/crm";

export default function SettingsPage() {
  const [yellow, setYellow] = useState(TRAFFIC_YELLOW_DAYS);
  const [red, setRed] = useState(TRAFFIC_RED_DAYS);
  const [nudge, setNudge] = useState(NUDGE_AFTER_DAYS);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Settings" }]}
        title="Settings"
        subtitle="The sidebar gear now lands here. Thresholds are shown in the leads UI; this page is a light stub."
      />
      <div style={{ padding: "0 32px 40px 32px", maxWidth: 720 }}>
        <SampleBanner>
          Configurable traffic-light and nudge thresholds. Values are local to this mock session and do
          not write production config.
        </SampleBanner>
        <Card padding={24}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Lead traffic lights
          </h2>
          <Row label="Yellow after (days)" value={yellow} onChange={setYellow} />
          <Row label="Red after (days)" value={red} onChange={setRed} />
          <Row label="Staff nudge after (days)" value={nudge} onChange={setNudge} />
          <p className="text-slate" style={{ fontSize: 13, marginTop: 16, lineHeight: 1.5 }}>
            Green while activity is inside the yellow window. QuickBooks remains disconnected. PIN auth is
            unchanged.
          </p>
          <div className="flex" style={{ gap: 8, marginTop: 16 }}>
            <Link href="/leads">
              <Button variant="filled">View pipeline</Button>
            </Link>
            <Link href="/maintenance/locations">
              <Button variant="outlined">Maintenance</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex items-center justify-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--color-chalk)" }}>
      <span className="text-carbon" style={{ fontSize: 14 }}>
        {label}
      </span>
      <input
        type="number"
        min={1}
        max={30}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md"
        style={{
          width: 72,
          height: 36,
          padding: "0 10px",
          border: "1px solid var(--color-chalk)",
          fontSize: 14,
          textAlign: "right",
        }}
      />
    </label>
  );
}
