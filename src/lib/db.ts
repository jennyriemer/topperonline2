/**
 * SQLite data layer for Toppers Online.
 *
 * Phase 2b/2c: replaces mock-data for LEADS with real persistence.
 * The DB file lives at .data/toppers.db (gitignored).
 *
 * Design notes:
 *   - better-sqlite3 is synchronous, which is fine for a small shop's
 *     traffic and keeps the code simple inside Next.js route handlers.
 *   - A single shared connection via a module-level singleton
 *     (Next.js dev hot-reload safe via globalThis stash).
 *   - agent_actions is the audit log: EVERY action an agent takes is
 *     recorded here (roadmap architectural principle #1).
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------------------------
// Connection singleton
// ---------------------------------------------------------------------------

// On Vercel (serverless) the project filesystem is read-only — only /tmp is
// writable. The DB there is EPHEMERAL (resets on cold start): fine for demos,
// not for production. Real persistence = Turso/Neon (see ROADMAP backlog).
const DB_DIR = process.env.VERCEL
  ? "/tmp/toppers-data"
  : path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "toppers.db");

declare global {
  var __toppersDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (globalThis.__toppersDb) return globalThis.__toppersDb;

  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  migrate(db);
  seedIfEmpty(db);

  globalThis.__toppersDb = db;
  return db;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id            TEXT PRIMARY KEY,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      phone         TEXT NOT NULL DEFAULT '',
      email         TEXT NOT NULL DEFAULT '',
      source        TEXT NOT NULL DEFAULT 'website',
      vehicle       TEXT NOT NULL DEFAULT '',
      interest      TEXT NOT NULL DEFAULT '',
      stage         TEXT NOT NULL DEFAULT 'new_lead',
      ai_handled    INTEGER NOT NULL DEFAULT 1,
      estimated_value INTEGER NOT NULL DEFAULT 0,
      last_contact_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lead_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id    TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      sender     TEXT NOT NULL CHECK (sender IN ('ai','customer','system','staff')),
      body       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_lead_messages_lead ON lead_messages(lead_id);

    -- Audit log: every agent action, per roadmap principle #1.
    CREATE TABLE IF NOT EXISTS agent_actions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      agent      TEXT NOT NULL,              -- 'sarah' | 'briefing' | ...
      action     TEXT NOT NULL,              -- 'send_sms' | 'move_stage' | ...
      subject_id TEXT,                       -- lead id, invoice id, etc.
      detail     TEXT NOT NULL DEFAULT '',   -- human-readable summary
      tier       TEXT NOT NULL DEFAULT 'auto' CHECK (tier IN ('auto','notify','approve')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions(agent);
  `);

  // Additive remap: old Sarah columns → client-facing pipeline. Does not delete rows.
  db.exec(`
    UPDATE leads SET stage = 'contacted' WHERE stage = 'ai_contacted';
    UPDATE leads SET stage = 'conversation' WHERE stage = 'responded';
    UPDATE leads SET stage = 'sale_pending' WHERE stage = 'appointment_set';
    UPDATE leads SET stage = 'in_order' WHERE stage = 'confirmed_sale';
  `);
}

// ---------------------------------------------------------------------------
// Seed (only when the leads table is empty) — mirrors the Phase 1 mock data
// so the Kanban board looks alive on first run.
// ---------------------------------------------------------------------------

const SEED_LEADS: Array<{
  id: string; first: string; last: string; phone: string; email: string;
  source: string; vehicle: string; interest: string; stage: string;
  value: number; messages: Array<{ sender: string; body: string }>;
}> = [
  {
    id: "L-2001", first: "Mike", last: "Henderson", phone: "(303) 555-2001",
    email: "mike.henderson@gmail.com", source: "website",
    vehicle: "2024 Ford F-150", interest: "ARE CX Series topper",
    stage: "new_lead", value: 3400,
    messages: [{ sender: "system", body: "Lead created from website form" }],
  },
  {
    id: "L-2002", first: "Sarah", last: "Martinez", phone: "(720) 555-2002",
    email: "sarah.martinez@gmail.com", source: "google_ads",
    vehicle: "2023 Toyota Tacoma", interest: "ARE Overland",
    stage: "contacted", value: 4100,
    messages: [
      { sender: "system", body: "Lead created from Google Ads" },
      { sender: "ai", body: "Hi! This is Sarah from Suburban Toppers. I saw you were looking at the ARE Overland for your 2023 Tacoma. Do you have a few minutes to chat?" },
    ],
  },
  {
    id: "L-2003", first: "Tom", last: "Walker", phone: "(303) 555-2003",
    email: "tom.walker@gmail.com", source: "facebook",
    vehicle: "2023 Chevy Silverado", interest: "Leer 100R topper",
    stage: "conversation", value: 2900,
    messages: [
      { sender: "ai", body: "Hi! This is Sarah from Suburban Toppers. I saw you were looking at the Leer 100R for your Silverado." },
      { sender: "customer", body: "Yes, I'm interested. What colors do you have in stock?" },
      { sender: "ai", body: "Great question! We have Black, White, Silver, and Charcoal in stock right now. Want to come by for a look?" },
    ],
  },
  {
    id: "L-2004", first: "Jennifer", last: "Chen", phone: "(720) 555-2004",
    email: "jennifer.chen@gmail.com", source: "referral",
    vehicle: "2024 RAM 1500", interest: "ARE Z Series",
    stage: "sale_pending", value: 3800,
    messages: [
      { sender: "ai", body: "Hi Jennifer! Just confirming your appointment for Saturday at 10am." },
      { sender: "customer", body: "Confirmed, see you then." },
      { sender: "system", body: "Appointment confirmed via SMS for Sat 10:00am" },
    ],
  },
  {
    id: "L-2005", first: "David", last: "O'Brien", phone: "(303) 555-2005",
    email: "david.obrien@gmail.com", source: "walk_in",
    vehicle: "2023 Ford F-250", interest: "ARE RT Series",
    stage: "in_order", value: 4600,
    messages: [
      { sender: "ai", body: "Thanks for choosing Suburban Toppers! Your order is confirmed." },
      { sender: "system", body: "Invoice INV-2026-0847 created — $4,600" },
    ],
  },
  {
    id: "L-2006", first: "Lisa", last: "Patel", phone: "(720) 555-2006",
    email: "lisa.patel@gmail.com", source: "website",
    vehicle: "2024 Chevy Colorado", interest: "Snugtop Hi-Liner",
    stage: "new_lead", value: 3100,
    messages: [{ sender: "system", body: "Lead created from website form" }],
  },
];

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM leads").get() as { n: number }).n;
  if (count > 0) return;

  const insertLead = db.prepare(`
    INSERT INTO leads (id, first_name, last_name, phone, email, source, vehicle,
                       interest, stage, ai_handled, estimated_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const insertMsg = db.prepare(`
    INSERT INTO lead_messages (lead_id, sender, body) VALUES (?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const l of SEED_LEADS) {
      insertLead.run(l.id, l.first, l.last, l.phone, l.email, l.source,
        l.vehicle, l.interest, l.stage, l.value);
      for (const m of l.messages) insertMsg.run(l.id, m.sender, m.body);
    }
  });
  tx();
}

// ---------------------------------------------------------------------------
// Row types (DB-shaped; API layer maps to camelCase)
// ---------------------------------------------------------------------------

export interface LeadRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  source: string;
  vehicle: string;
  interest: string;
  stage: string;
  ai_handled: number;
  estimated_value: number;
  last_contact_at: string;
  created_at: string;
}

export interface LeadMessageRow {
  id: number;
  lead_id: string;
  sender: "ai" | "customer" | "system" | "staff";
  body: string;
  created_at: string;
}

export interface AgentActionRow {
  id: number;
  agent: string;
  action: string;
  subject_id: string | null;
  detail: string;
  tier: "auto" | "notify" | "approve";
  created_at: string;
}

// ---------------------------------------------------------------------------
// Lead queries
// ---------------------------------------------------------------------------

export function listLeads(): LeadRow[] {
  return getDb()
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as LeadRow[];
}

export function getLead(id: string): LeadRow | undefined {
  return getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
}

export function getLeadMessages(leadId: string): LeadMessageRow[] {
  return getDb()
    .prepare("SELECT * FROM lead_messages WHERE lead_id = ? ORDER BY id ASC")
    .all(leadId) as LeadMessageRow[];
}

let leadCounter = 0;

export function createLead(input: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  source?: string;
  vehicle?: string;
  interest?: string;
  estimatedValue?: number;
}): LeadRow {
  const db = getDb();
  // Generate next L-XXXX id
  const maxRow = db
    .prepare("SELECT id FROM leads WHERE id LIKE 'L-%' ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1")
    .get() as { id: string } | undefined;
  const maxNum = maxRow ? parseInt(maxRow.id.slice(2), 10) : 2000;
  const id = `L-${Math.max(maxNum + 1, 2000 + ++leadCounter)}`;

  db.prepare(`
    INSERT INTO leads (id, first_name, last_name, phone, email, source, vehicle, interest, estimated_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.firstName,
    input.lastName,
    input.phone ?? "",
    input.email ?? "",
    input.source ?? "website",
    input.vehicle ?? "",
    input.interest ?? "",
    input.estimatedValue ?? 0
  );

  addLeadMessage(id, "system", `Lead created from ${(input.source ?? "website").replace(/_/g, " ")}`);
  return getLead(id)!;
}

export function updateLeadStage(id: string, stage: string): LeadRow | undefined {
  getDb()
    .prepare("UPDATE leads SET stage = ?, last_contact_at = datetime('now') WHERE id = ?")
    .run(stage, id);
  return getLead(id);
}

export function addLeadMessage(
  leadId: string,
  sender: LeadMessageRow["sender"],
  body: string
): LeadMessageRow {
  const db = getDb();
  const info = db
    .prepare("INSERT INTO lead_messages (lead_id, sender, body) VALUES (?, ?, ?)")
    .run(leadId, sender, body);
  db.prepare("UPDATE leads SET last_contact_at = datetime('now') WHERE id = ?").run(leadId);
  return db
    .prepare("SELECT * FROM lead_messages WHERE id = ?")
    .get(info.lastInsertRowid) as LeadMessageRow;
}

// ---------------------------------------------------------------------------
// Agent audit log
// ---------------------------------------------------------------------------

export function logAgentAction(input: {
  agent: string;
  action: string;
  subjectId?: string;
  detail?: string;
  tier?: "auto" | "notify" | "approve";
}): void {
  getDb()
    .prepare(
      "INSERT INTO agent_actions (agent, action, subject_id, detail, tier) VALUES (?, ?, ?, ?, ?)"
    )
    .run(input.agent, input.action, input.subjectId ?? null, input.detail ?? "", input.tier ?? "auto");
}

export function listAgentActions(limit = 50): AgentActionRow[] {
  return getDb()
    .prepare("SELECT * FROM agent_actions ORDER BY id DESC LIMIT ?")
    .all(limit) as AgentActionRow[];
}
