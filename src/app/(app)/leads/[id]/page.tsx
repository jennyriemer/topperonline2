import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Button, Card, StatusBadge, EmailPreview } from "@/components/ui";
import { TrafficLightDot } from "@/components/ui/TrafficLight";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STAGE_LABELS,
  NUDGE_AFTER_DAYS,
  formatShortDate,
  getDemoLead,
} from "@/lib/demo/crm";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getDemoLead(id);
  if (!lead) notFound();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Suburban Toppers" },
          { label: "Leads", href: "/leads" },
          { label: `${lead.firstName} ${lead.lastName}` },
        ]}
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle={`${LEAD_STAGE_LABELS[lead.stage]} · ${lead.vehicle} · ${formatCurrency(lead.estimatedValue)}`}
        actions={
          <>
            <Link href="/leads">
              <Button variant="outlined">Back to board</Button>
            </Link>
            {lead.stage === "in_order" && (
              <Link href="/jobs">
                <Button variant="filled">Open jobs board</Button>
              </Link>
            )}
          </>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          AI intake is a log entry, not a pipeline column. Nudges draft an email for a human to send —
          the agent does not auto-message after {NUDGE_AFTER_DAYS} quiet days.
        </SampleBanner>

        <div className="grid" style={{ gridTemplateColumns: "minmax(260px, 0.7fr) minmax(0, 1.3fr)", gap: "16px" }}>
          <Card padding={22}>
            <div className="flex items-center" style={{ gap: "8px", marginBottom: "12px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>Lead</h2>
              <SampleBadge />
              <TrafficLightDot value={lead.traffic} withLabel />
            </div>
            <Meta label="Phone" value={formatPhone(lead.phone)} />
            <Meta label="Email" value={lead.email} />
            <Meta label="Source" value={LEAD_SOURCE_LABEL[lead.source]} />
            <Meta label="Vehicle" value={lead.vehicle} />
            <Meta label="Bed / color" value={`${lead.bedSize || "—"} · ${lead.color || "—"}`} />
            <Meta label="Want" value={lead.interest} />
            <Meta label="Stage" value={LEAD_STAGE_LABELS[lead.stage]} />
            <Meta label="In stage" value={`${lead.daysInStage} day${lead.daysInStage === 1 ? "" : "s"}`} />
            <div style={{ marginTop: "12px" }}>
              <StatusBadge variant="purple">{lead.aiHandled ? "AI intake on" : "Human-owned"}</StatusBadge>
            </div>
          </Card>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            {lead.intakeEmail && (
              <EmailPreview
                from="Sarah, AI agent on behalf of Suburban Toppers <sarah@suburbantoppers.com>"
                to={lead.email}
                subject={lead.intakeEmail.subject}
                body={lead.intakeEmail.body}
                sentLabel={formatShortDate(lead.intakeEmail.sentAt)}
              />
            )}
            {lead.nudge && (
              <EmailPreview
                from="Suburban Toppers CRM <ops@suburbantoppers.com>"
                to="nate@suburbantoppers.com"
                subject={lead.nudge.subject}
                body={lead.nudge.body}
                sentLabel={`Staff nudge · after ${lead.nudge.dueDays} quiet days`}
              />
            )}
            <Card padding={0}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-chalk)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                Activity
              </div>
              <ul>
                {lead.activity.map((a, i) => (
                  <li
                    key={a.id}
                    style={{
                      padding: "12px 20px",
                      borderTop: i === 0 ? undefined : "1px solid var(--color-chalk)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {a.title}
                      </span>
                      <span className="text-slate" style={{ fontSize: "11px" }}>
                        {formatShortDate(a.at)}
                      </span>
                    </div>
                    <p className="text-graphite" style={{ fontSize: "13px", marginTop: "4px", lineHeight: 1.45 }}>
                      {a.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--color-chalk)", gap: "12px" }}>
      <span className="text-slate" style={{ fontSize: "12px" }}>
        {label}
      </span>
      <span className="text-carbon" style={{ fontSize: "13px", fontWeight: 500, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
