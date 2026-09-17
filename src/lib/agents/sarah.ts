/**
 * "Sarah" — the AI Sales Agent (Phase 2b).
 *
 * Responsibilities:
 *   - Instantly respond to new leads (speed-to-lead)
 *   - Qualify: vehicle → fitment → in-stock options → price ballpark
 *   - Drive toward booking an appointment
 *   - Advance the Kanban stage as the conversation progresses
 *   - Log EVERY action to agent_actions (audit principle)
 *
 * Architecture:
 *   generateReply() is the brain. Today it's a deterministic rules
 *   engine over the fitment KB — good enough to demo the full loop and
 *   fully testable. It is designed to be swapped for an LLM call
 *   (see the `SarahBrain` type): the surrounding plumbing (stage
 *   transitions, audit log, SMS dispatch) does not change.
 *
 * SMS: dispatchSms() is a stub that logs to the audit trail. Swap in
 * Twilio in Phase 2b-final without touching callers.
 */

import {
  addLeadMessage,
  getLead,
  getLeadMessages,
  logAgentAction,
  updateLeadStage,
  type LeadRow,
} from "@/lib/db";

// ---------------------------------------------------------------------------
// Fitment knowledge base (starter set — grows into a real KB / DB table)
// ---------------------------------------------------------------------------

export interface TopperOption {
  manufacturer: string;
  model: string;
  priceFrom: number;
  inStockColors: string[];
  orderWeeks: number; // lead time if not in stock
  notes?: string;
}

/** Keyed by a normalized truck family token found in the lead's vehicle. */
const FITMENT_KB: Array<{ match: RegExp; truckLabel: string; options: TopperOption[] }> = [
  {
    match: /f-?150|f-?250|f-?350|superduty|ranger/i,
    truckLabel: "Ford truck",
    options: [
      { manufacturer: "ARE", model: "CX Series", priceFrom: 2800, inStockColors: ["Black", "White", "Silver"], orderWeeks: 3 },
      { manufacturer: "ARE", model: "Z Series", priceFrom: 3400, inStockColors: ["White"], orderWeeks: 4, notes: "commercial grade" },
      { manufacturer: "Leer", model: "100R", priceFrom: 2600, inStockColors: ["Black", "Charcoal"], orderWeeks: 3 },
    ],
  },
  {
    match: /tacoma/i,
    truckLabel: "Toyota Tacoma",
    options: [
      { manufacturer: "ARE", model: "Overland", priceFrom: 3900, inStockColors: ["Cement Gray"], orderWeeks: 5, notes: "very popular on Tacomas" },
      { manufacturer: "ARE", model: "CX Series", priceFrom: 2800, inStockColors: ["Black", "White"], orderWeeks: 3 },
    ],
  },
  {
    match: /tundra/i,
    truckLabel: "Toyota Tundra",
    options: [
      { manufacturer: "ARE", model: "MX Series", priceFrom: 3200, inStockColors: ["White", "Silver"], orderWeeks: 3 },
      { manufacturer: "Snugtop", model: "Hi-Liner", priceFrom: 3600, inStockColors: ["Charcoal"], orderWeeks: 6 },
    ],
  },
  {
    match: /silverado|colorado|chevy|gmc|sierra/i,
    truckLabel: "GM truck",
    options: [
      { manufacturer: "ARE", model: "V Series", priceFrom: 3000, inStockColors: ["Black", "White", "Silver"], orderWeeks: 3 },
      { manufacturer: "Leer", model: "122 Cap", priceFrom: 2500, inStockColors: ["White"], orderWeeks: 4 },
    ],
  },
  {
    match: /ram/i,
    truckLabel: "RAM truck",
    options: [
      { manufacturer: "ARE", model: "Z Series", priceFrom: 3400, inStockColors: ["Black", "White"], orderWeeks: 4 },
      { manufacturer: "ATC", model: "Colorado", priceFrom: 2900, inStockColors: ["Silver"], orderWeeks: 3 },
    ],
  },
];

export function lookupFitment(vehicle: string) {
  return FITMENT_KB.find((f) => f.match.test(vehicle)) ?? null;
}

// ---------------------------------------------------------------------------
// SMS dispatch (stub — swap for Twilio later; callers don't change)
// ---------------------------------------------------------------------------

function dispatchSms(lead: LeadRow, body: string): void {
  // TODO(Phase 2b-final): Twilio integration. For now the message is
  // persisted in lead_messages and the "send" is recorded in the audit log.
  logAgentAction({
    agent: "sarah",
    action: "send_sms",
    subjectId: lead.id,
    detail: `SMS to ${lead.phone || "(no phone)"}: ${body.slice(0, 120)}`,
    tier: "auto",
  });
}

// ---------------------------------------------------------------------------
// The brain — deterministic today, LLM-swappable tomorrow
// ---------------------------------------------------------------------------

export type SarahBrain = (ctx: {
  lead: LeadRow;
  history: Array<{ sender: string; body: string }>;
  inbound?: string;
}) => { reply: string; nextStage?: string };

const APPOINTMENT_HOOKS = /\b(appointment|come by|schedule|book|saturday|swing by|visit|stop in)\b/i;
const AFFIRMATIVE = /\b(yes|yeah|yep|sure|sounds good|ok(ay)?|interested|let's do it|book it)\b/i;
const PRICE_ASK = /\b(price|cost|how much|quote|\$)\b/i;
const COLOR_ASK = /\b(colors?|paint|finish)\b/i;

/** Rules-based brain. Returns reply text + optional stage advance. */
export const rulesBrain: SarahBrain = ({ lead, history, inbound }) => {
  const fit = lookupFitment(lead.vehicle);
  const firstName = lead.first_name;

  // --- Initial outreach (no inbound message; lead is fresh) ---
  if (!inbound) {
    if (fit) {
      const top = fit.options[0];
      const stockLine = top.inStockColors.length
        ? `We have the ${top.manufacturer} ${top.model} in stock in ${formatList(top.inStockColors)}`
        : `I can get you the ${top.manufacturer} ${top.model} in about ${top.orderWeeks} weeks`;
      return {
        reply:
          `Hi ${firstName}! This is Sarah from Suburban Toppers. I saw you were interested in ` +
          `${lead.interest || "a topper"} for your ${lead.vehicle}. ${stockLine} — ` +
          `starting around $${top.priceFrom.toLocaleString()}. Want to come by for a look, or I can answer any questions right here!`,
        nextStage: "contacted",
      };
    }
    return {
      reply:
        `Hi ${firstName}! This is Sarah from Suburban Toppers. Thanks for reaching out about ` +
        `${lead.interest || "a topper"}. What's the year, make, and model of your truck? ` +
        `I'll check exactly what fits.`,
      nextStage: "contacted",
    };
  }

  // --- Replying to an inbound customer message ---
  // Confirmation check MUST come before the offer branch: "YES" also matches
  // AFFIRMATIVE, and the last AI message ("...Saturday at 10am...reply YES to
  // confirm") also matches APPOINTMENT_HOOKS — so without this ordering the
  // bot would repeat the offer instead of booking.
  const aiJustAskedToConfirm = history
    .slice(-3)
    .some((m) => m.sender === "ai" && /reply yes to confirm/i.test(m.body));

  if (aiJustAskedToConfirm && AFFIRMATIVE.test(inbound)) {
    return {
      reply:
        `You're all set for Saturday at 10am, ${firstName}! We'll send a reminder the day before. ` +
        `Bring the truck and we'll get you measured up. See you then! 🛻`,
      nextStage: "sale_pending",
    };
  }

  const wantsAppointment = APPOINTMENT_HOOKS.test(inbound) || AFFIRMATIVE.test(inbound);
  const recentAiOfferedVisit = history
    .slice(-3)
    .some((m) => m.sender === "ai" && APPOINTMENT_HOOKS.test(m.body));

  if (wantsAppointment && recentAiOfferedVisit) {
    return {
      reply:
        `Perfect! We're at 5795 E. Colfax Ave in Denver — open Mon-Fri 8-6, Sat 9-2. ` +
        `Does Saturday at 10am work? I'll have ${firstNameOfStaff()} set aside time for you. ` +
        `Just reply YES to confirm.`,
      nextStage: "conversation",
    };
  }

  if (COLOR_ASK.test(inbound)) {
    const colors = fit?.options.flatMap((o) => o.inStockColors) ?? ["Black", "White", "Silver", "Charcoal"];
    return {
      reply:
        `Right now we have ${formatList([...new Set(colors)])} in stock. ` +
        `We can also order any factory-matched color — takes about ${fit?.options[0]?.orderWeeks ?? 4} weeks. ` +
        `Want to swing by and see them in person?`,
      nextStage: "conversation",
    };
  }

  if (PRICE_ASK.test(inbound)) {
    if (fit) {
      const lines = fit.options
        .map((o) => `${o.manufacturer} ${o.model} from $${o.priceFrom.toLocaleString()}`)
        .join(", ");
      return {
        reply:
          `For your ${fit.truckLabel}: ${lines} — installed. ` +
          `Exact price depends on options (windows, racks, headliner). ` +
          `Fastest way to a firm quote is a quick visit. Want me to set something up?`,
        nextStage: "conversation",
      };
    }
    return {
      reply:
        `Toppers typically run $2,500–$4,500 installed depending on the truck and options. ` +
        `Tell me your truck's year, make, and model and I'll narrow it down!`,
      nextStage: "conversation",
    };
  }

  // Default: acknowledge, keep the conversation moving toward a visit.
  return {
    reply:
      `Thanks, ${firstName}! Happy to help with that. Anything else you'd like to know? ` +
      `And if you'd like to see options in person, we're at 5795 E. Colfax — I can set up a time that works for you.`,
    nextStage: "conversation",
  };
};

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

function firstNameOfStaff(): string {
  return "Nate"; // most versatile salesman per the About page 🙂
}

// ---------------------------------------------------------------------------
// Public API — the plumbing that routes + audits (brain-agnostic)
// ---------------------------------------------------------------------------

const STAGE_ORDER = ["new_lead", "contacted", "conversation", "sale_pending", "in_order"];

function maybeAdvanceStage(lead: LeadRow, nextStage?: string) {
  if (!nextStage) return;
  const cur = STAGE_ORDER.indexOf(lead.stage);
  const next = STAGE_ORDER.indexOf(nextStage);
  if (next > cur) {
    updateLeadStage(lead.id, nextStage);
    logAgentAction({
      agent: "sarah",
      action: "move_stage",
      subjectId: lead.id,
      detail: `${lead.stage} → ${nextStage}`,
      tier: "auto",
    });
  }
}

/**
 * Fire Sarah's initial outreach for a brand-new lead.
 * Called right after lead creation (speed-to-lead!).
 */
export function sarahInitialOutreach(leadId: string, brain: SarahBrain = rulesBrain) {
  const lead = getLead(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);
  if (!lead.ai_handled) return null; // human-owned lead; stay out of the way

  const { reply, nextStage } = brain({ lead, history: [], inbound: undefined });
  addLeadMessage(lead.id, "ai", reply);
  dispatchSms(lead, reply);
  maybeAdvanceStage(lead, nextStage);
  return reply;
}

/**
 * Handle an inbound customer message (SMS webhook / simulator):
 * store it, generate Sarah's reply, advance the stage.
 */
export function sarahHandleInbound(leadId: string, inboundBody: string, brain: SarahBrain = rulesBrain) {
  const lead = getLead(leadId);
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  addLeadMessage(lead.id, "customer", inboundBody);

  // Customer replied — that's at least "responded"
  if (lead.stage === "contacted" || lead.stage === "ai_contacted" || lead.stage === "new_lead") {
    maybeAdvanceStage(lead, "conversation");
  }

  if (!lead.ai_handled) {
    logAgentAction({
      agent: "sarah",
      action: "skip_human_owned",
      subjectId: lead.id,
      detail: "Inbound stored; lead is human-owned, no AI reply sent",
      tier: "notify",
    });
    return null;
  }

  const history = getLeadMessages(lead.id).map((m) => ({ sender: m.sender, body: m.body }));
  const freshLead = getLead(leadId)!; // stage may have advanced above
  const { reply, nextStage } = brain({ lead: freshLead, history, inbound: inboundBody });

  addLeadMessage(lead.id, "ai", reply);
  dispatchSms(freshLead, reply);
  maybeAdvanceStage(freshLead, nextStage);
  return reply;
}
