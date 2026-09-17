import { Bot } from "lucide-react";

export function EmailPreview({
  from,
  to,
  subject,
  body,
  sentLabel,
}: {
  from: string;
  to: string;
  subject: string;
  body: string;
  sentLabel?: string;
}) {
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: "1px solid var(--color-chalk)", background: "var(--color-paper)" }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "10px 14px", background: "var(--color-fog)", borderBottom: "1px solid var(--color-chalk)" }}
      >
        <div className="flex items-center" style={{ gap: "6px" }}>
          <Bot size={14} strokeWidth={2} className="text-signal-orange" />
          <span className="text-carbon" style={{ fontSize: "12px", fontWeight: 600 }}>
            Email preview
          </span>
        </div>
        {sentLabel && (
          <span className="text-slate" style={{ fontSize: "11px" }}>
            {sentLabel}
          </span>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <Row label="From" value={from} />
        <Row label="To" value={to} />
        <Row label="Subject" value={subject} last />
        <pre
          className="text-carbon"
          style={{
            marginTop: "12px",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-inter)",
            fontSize: "13px",
            lineHeight: 1.5,
            background: "var(--color-fog)",
            padding: "12px 14px",
            borderRadius: "8px",
          }}
        >
          {body}
        </pre>
      </div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex"
      style={{
        gap: "12px",
        fontSize: "12px",
        padding: "4px 0",
        borderBottom: last ? undefined : "1px solid var(--color-chalk)",
      }}
    >
      <span className="text-slate" style={{ width: "64px", flexShrink: 0, fontWeight: 500 }}>
        {label}
      </span>
      <span className="text-carbon" style={{ fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
