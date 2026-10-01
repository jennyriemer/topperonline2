/**
 * /api/leads/[id] — read one lead (with conversation) + PATCH stage.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLead, getLeadMessages, updateLeadStage, logAgentAction } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_STAGES = [
  "new_lead",
  "contacted",
  "conversation",
  "sale_pending",
  "in_order",
  // legacy aliases still accepted and stored; UI maps them
  "ai_contacted",
  "responded",
  "appointment_set",
  "confirmed_sale",
];

function serialize(id: string) {
  const row = getLead(id);
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    source: row.source,
    vehicle: row.vehicle,
    interest: row.interest,
    stage: row.stage,
    aiHandled: !!row.ai_handled,
    estimatedValue: row.estimated_value,
    lastContactAt: row.last_contact_at,
    createdAt: row.created_at,
    conversation: getLeadMessages(row.id).map((m) => ({
      id: String(m.id),
      from: m.sender,
      text: m.body,
      timestamp: m.created_at,
    })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = serialize(id);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!getLead(id)) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.stage === "string") {
    if (!VALID_STAGES.includes(body.stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(", ")}` },
        { status: 400 }
      );
    }
    updateLeadStage(id, body.stage);
    // Staff-initiated move (vs. Sarah's automatic moves) — still audited.
    logAgentAction({
      agent: "staff",
      action: "move_stage",
      subjectId: id,
      detail: `Stage set to ${body.stage} via CRM UI/API`,
      tier: "auto",
    });
  }

  return NextResponse.json({ lead: serialize(id) });
}
