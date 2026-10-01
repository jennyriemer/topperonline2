import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Button, Card, EmailPreview } from "@/components/ui";
import { StatusCell } from "@/components/board";
import { SampleBanner } from "@/components/demo/SampleBadge";
import { formatCurrency, formatPhone } from "@/lib/utils";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STAGE_LABELS,
  NUDGE_AFTER_DAYS,
  formatShortDate,
  getDemoLead,
} from "@/lib/demo/crm";
import { HEALTH_STATUS, LEAD_STAGE_STATUS, SOURCE_STATUS } from "@/lib/monday";

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
        subtitle={`${lead.vehicle} · ${formatCurrency(lead.estimatedValue)}`}
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

      <div style={{ padding: "16px 16px 40px" }}>
        <SampleBanner>
          AI intake is a log entry, not a pipeline column. Nudges draft an email for a human to send — the agent does not auto-message after {NUDGE_AFTER_DAYS} quiet days.
        </SampleBanner>

        <div className="grid max-md:grid-cols-1" style={{ gridTemplateColumns: "minmax(260px, 0.7fr) minmax(0, 1.3fr)", gap: 16 }}>
          <Card padding={0} className="overflow-hidden">
            <div style={{ height: 8, background: LEAD_STAGE_STATUS.find((s) => s.id === lead.stage)?.color }} />
            <div style={{ padding: 20 }}>
              <h2 className="font-display" style={{ fontSize: 16, marginBottom: 12 }}>
                Lead
              </h2>
              <div style={{ marginBottom: 10 }}>
                <div className="text-gray-500" style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  STATUS
                </div>
                <StatusCell value={lead.stage} options={LEAD_STAGE_STATUS} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <StatusCell value={lead.traffic} options={HEALTH_STATUS} />
                <StatusCell value={lead.source} options={SOURCE_STATUS} />
              </div>
              <Meta label="Phone" value={formatPhone(lead.phone)} />
              <Meta label="Email" value={lead.email} />
              <Meta label="Source" value={LEAD_SOURCE_LABEL[lead.source]} />
              <Meta label="Vehicle" value={lead.vehicle} />
              <Meta label="Bed / color" value={`${lead.bedSize || "—"} · ${lead.color || "—"}`} />
              <Meta label="Want" value={lead.interest} />
              <Meta label="Stage" value={LEAD_STAGE_LABELS[lead.stage]} />
              <Meta label="In stage" value={`${lead.daysInStage} day${lead.daysInStage === 1 ? "" : "s"}`} />
              <Meta label="AI intake" value={lead.aiHandled ? "On" : "Human-owned"} />
            </div>
          </Card>

          <div className="flex flex-col" style={{ gap: 16 }}>
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
              <div className="font-display" style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-gray-150)", fontWeight: 700 }}>
                Updates
              </div>
              <ul>
                {lead.activity.map((a, i) => (
                  <li key={a.id} style={{ padding: "12px 20px", borderTop: i === 0 ? undefined : "1px solid var(--color-gray-100)" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{a.title}</span>
                      <span className="text-gray-500" style={{ fontSize: 11 }}>
                        {formatShortDate(a.at)}
                      </span>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>
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
    <div className="flex justify-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--color-gray-100)", gap: 12 }}>
      <span className="text-gray-500" style={{ fontSize: 12 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}
