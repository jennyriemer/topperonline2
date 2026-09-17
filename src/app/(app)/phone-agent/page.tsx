"use client";

import { useMemo, useState } from "react";
import { PageHeader, Button, Card, StatusBadge, EmailPreview } from "@/components/ui";
import { SampleBanner, SampleBadge } from "@/components/demo/SampleBadge";
import { DEMO_CALLS, formatShortDate } from "@/lib/demo/crm";

type Path = "voicemail" | "intake";
type Step = "intro" | "collect" | "confirm" | "done";

interface Intake {
  name: string;
  phone: string;
  email: string;
  makeModel: string;
  bedSize: string;
  color: string;
  lookingFor: string;
}

const EMPTY: Intake = {
  name: "",
  phone: "(303) 720-4488",
  email: "",
  makeModel: "",
  bedSize: "",
  color: "",
  lookingFor: "",
};

export default function PhoneAgentPage() {
  const [path, setPath] = useState<Path | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [intake, setIntake] = useState<Intake>(EMPTY);
  const [prompt, setPrompt] = useState("");

  const transcript = useMemo(() => buildTranscript(path, step, intake, prompt), [path, step, intake, prompt]);
  const email = useMemo(() => buildBossEmail(path, intake, transcript), [path, intake, transcript]);

  const reset = () => {
    setPath(null);
    setStep("intro");
    setIntake(EMPTY);
    setPrompt("");
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Suburban Toppers" }, { label: "Phone AI" }]}
        title="After-hours phone agent"
        subtitle="Intro + two options: leave a voicemail, or walk through intake. Every path emails a transcript to the boss. No auto lead create this phase."
        actions={
          <Button variant="outlined" onClick={reset}>
            Reset call
          </Button>
        }
      />

      <div style={{ padding: "0 32px 40px 32px" }}>
        <SampleBanner>
          Clickable mock of the voice agent. Confirm make, bed size, and color out loud. Summary is
          forwarded to the team for <strong>manual</strong> lead creation.
        </SampleBanner>

        <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)", gap: "16px" }}>
          <Card padding={22}>
            <div className="flex items-center" style={{ gap: "8px", marginBottom: "14px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>Live script</h2>
              <SampleBadge />
              <StatusBadge variant={path ? "green" : "blue"}>{path ? "On the call" : "Ringing"}</StatusBadge>
            </div>

            <ScriptLine>
              Thanks for calling Suburban Toppers, Denver’s truck topper shop since 1985. I’m the after-hours
              assistant. I can take a voicemail for the team, or I can grab a few details so they’re ready in
              the morning.
            </ScriptLine>

            {step === "intro" && (
              <div className="flex flex-wrap" style={{ gap: "8px", marginTop: "16px" }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPath("voicemail");
                    setStep("done");
                  }}
                >
                  Leave a voicemail
                </Button>
                <Button
                  variant="filled"
                  onClick={() => {
                    setPath("intake");
                    setStep("collect");
                  }}
                >
                  Guide intake
                </Button>
              </div>
            )}

            {path === "intake" && step !== "intro" && (
              <div className="flex flex-col" style={{ gap: "10px", marginTop: "18px" }}>
                <Field label="Name" value={intake.name} onChange={(v) => setIntake({ ...intake, name: v })} placeholder="Jordan Pellegrino" />
                <Field label="Phone" value={intake.phone} onChange={(v) => setIntake({ ...intake, phone: v })} />
                <Field label="Email" value={intake.email} onChange={(v) => setIntake({ ...intake, email: v })} placeholder="j.pellegrino@yahoo.com" />
                <Field label="Year / make / model" value={intake.makeModel} onChange={(v) => setIntake({ ...intake, makeModel: v })} placeholder="2019 Toyota Tacoma" />
                <Field label="Bed size" value={intake.bedSize} onChange={(v) => setIntake({ ...intake, bedSize: v })} placeholder="6' bed" />
                <Field label="Color" value={intake.color} onChange={(v) => setIntake({ ...intake, color: v })} placeholder="Magnetic Gray" />
                <Field label="What they’re looking for" value={intake.lookingFor} onChange={(v) => setIntake({ ...intake, lookingFor: v })} placeholder="Used cap if you have one, or a Snugtop" />
                <Field
                  label="Agent prompt (optional extra)"
                  value={prompt}
                  onChange={setPrompt}
                  placeholder="Ask if they need a roof rack…"
                />
                <div className="flex" style={{ gap: "8px", marginTop: "6px" }}>
                  <Button variant="outlined" onClick={() => setStep("confirm")}>
                    Read back to confirm
                  </Button>
                  <Button variant="filled" onClick={() => setStep("done")}>
                    End call & email boss
                  </Button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <ScriptLine accent>
                Just to confirm: {intake.name || "the caller"}, {intake.phone}, truck is a{" "}
                {intake.makeModel || "(make/model missing)"}, {intake.bedSize || "(bed size missing)"}, color{" "}
                {intake.color || "(color missing)"}. Looking for {intake.lookingFor || "a topper"}. Did I get
                that right?
              </ScriptLine>
            )}

            {step === "done" && (
              <div
                className="rounded-md"
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  background: "color-mix(in srgb, var(--color-status-green) 10%, white)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Call wrapped. Transcript emailed to Dan / Brad. <strong>Not</strong> auto-created as a CRM
                lead — forwarded to the team for manual lead creation.
              </div>
            )}
          </Card>

          <div className="flex flex-col" style={{ gap: "16px" }}>
            <Card padding={22}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, marginBottom: "10px" }}>
                Transcript
              </h2>
              <pre
                className="text-carbon"
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  background: "var(--color-fog)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  minHeight: "160px",
                }}
              >
                {transcript}
              </pre>
            </Card>

            {step === "done" && (
              <EmailPreview
                from="Phone AI on behalf of Suburban Toppers <voice@suburbantoppers.com>"
                to="dan@suburbantoppers.com, brad@suburbantoppers.com"
                subject={email.subject}
                body={email.body}
                sentLabel="Queued to boss"
              />
            )}

            <Card padding={0}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-chalk)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
                Recent after-hours calls
              </div>
              <ul>
                {DEMO_CALLS.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between"
                    style={{ padding: "12px 18px", borderTop: "1px solid var(--color-chalk)", gap: "8px" }}
                  >
                    <div>
                      <div className="text-carbon" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {c.callerName ?? c.callerPhone}
                      </div>
                      <div className="text-slate" style={{ fontSize: "12px" }}>
                        {c.path === "voicemail" ? "Voicemail" : "Intake"} · {formatShortDate(c.startedAt)}
                      </div>
                    </div>
                    <StatusBadge variant={c.status === "live" ? "green" : "blue"}>
                      {c.status === "live" ? "Live" : "Completed"}
                    </StatusBadge>
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-carbon" style={{ fontSize: "12px", fontWeight: 500 }}>
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md"
        style={{
          display: "block",
          width: "100%",
          marginTop: "4px",
          height: "36px",
          padding: "0 10px",
          border: "1px solid var(--color-chalk)",
          fontSize: "13px",
          outline: "none",
        }}
      />
    </label>
  );
}

function ScriptLine({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p
      className="rounded-md"
      style={{
        fontSize: "14px",
        lineHeight: 1.55,
        padding: "12px 14px",
        background: accent
          ? "color-mix(in srgb, var(--color-signal-orange) 8%, white)"
          : "var(--color-fog)",
        color: "var(--color-carbon)",
      }}
    >
      {children}
    </p>
  );
}

function buildTranscript(path: Path | null, step: Step, intake: Intake, prompt: string): string {
  const lines = [
    "Agent: Thanks for calling Suburban Toppers… voicemail or intake?",
  ];
  if (!path) return lines.join("\n");
  if (path === "voicemail") {
    lines.push("Caller: I’ll just leave a message.");
    lines.push("Agent: Go ahead after the tone. I’ll email a transcript to the owners.");
    lines.push("Caller: Hey, this is Marcus, 720-441-0091. Still looking at a used Ranger cap. Call me tomorrow.");
    return lines.join("\n");
  }
  lines.push("Caller: Let’s do the questions.");
  if (intake.name) lines.push(`Agent: Name?  /  Caller: ${intake.name}`);
  if (intake.makeModel) lines.push(`Agent: Year, make, model?  /  Caller: ${intake.makeModel}`);
  if (intake.bedSize) lines.push(`Agent: Bed size?  /  Caller: ${intake.bedSize}`);
  if (intake.color) lines.push(`Agent: Color?  /  Caller: ${intake.color}`);
  if (intake.lookingFor) lines.push(`Agent: What are you looking for?  /  Caller: ${intake.lookingFor}`);
  if (prompt) lines.push(`Agent (extra): ${prompt}`);
  if (step === "confirm" || step === "done") {
    lines.push(
      `Agent: Confirming ${intake.makeModel || "truck"}, ${intake.bedSize || "bed"}, ${intake.color || "color"}.`
    );
    lines.push("Caller: That’s right.");
  }
  if (step === "done") {
    lines.push("Agent: I’ll email this to the team. Someone will create the lead by hand in the morning. Thanks for calling Suburban Toppers.");
  }
  return lines.join("\n");
}

function buildBossEmail(path: Path | null, intake: Intake, transcript: string) {
  if (path === "voicemail") {
    return {
      subject: "After-hours voicemail transcript — Marcus (Ranger, used cap)",
      body: `Path: Voicemail\nCaller: Marcus Diaz · (720) 441-0091\n\nPlease create a lead manually if this is new.\n\n--- Transcript ---\n${transcript}`,
    };
  }
  return {
    subject: `After-hours intake — ${intake.name || "unknown caller"} ${intake.makeModel ? "· " + intake.makeModel : ""}`,
    body: `Path: Guided intake\nName: ${intake.name || "—"}\nPhone: ${intake.phone}\nEmail: ${intake.email || "—"}\nVehicle: ${intake.makeModel || "—"}\nBed size: ${intake.bedSize || "—"}\nColor: ${intake.color || "—"}\nLooking for: ${intake.lookingFor || "—"}\n\nDo not auto-create a CRM lead. Forwarded for manual lead creation.\n\n--- Transcript ---\n${transcript}`,
  };
}
