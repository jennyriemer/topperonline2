/**
 * Additive sample CRM records for the Phase 1–4 UI mock.
 *
 * These sit alongside (never replace) live Supabase / SQLite stores.
 * IDs are prefixed `demo-` so they cannot collide with production numeric ids.
 *
 * Suburban Toppers · Denver · A.R.E., ATC, Leer, Snugtop.
 */

import { formatCurrency } from "@/lib/utils";

export const DENVER_TAX_RATE = 0.0831; // combined Denver mock rate
export const NUDGE_AFTER_DAYS = 3;
export const TRAFFIC_YELLOW_DAYS = 2;
export const TRAFFIC_RED_DAYS = 5;

export type JobBucket =
  | "waiting_arrival"
  | "waiting_install"
  | "waiting_payment"
  | "paid";

export const JOB_BUCKETS: JobBucket[] = [
  "waiting_arrival",
  "waiting_install",
  "waiting_payment",
  "paid",
];

export const JOB_BUCKET_META: Record<
  JobBucket,
  { label: string; short: string; hint: string; variant: "amber" | "blue" | "red" | "green" }
> = {
  waiting_arrival: {
    label: "Topper Ordered",
    short: "Waiting Arrival",
    hint: "Manufacturer order in transit",
    variant: "amber",
  },
  waiting_install: {
    label: "Topper In",
    short: "Waiting Install",
    hint: "On the lot — schedule the truck",
    variant: "blue",
  },
  waiting_payment: {
    label: "Topper Installed",
    short: "Waiting Payment",
    hint: "Billing date starts here · invoice considered sent",
    variant: "red",
  },
  paid: {
    label: "Invoice Received / Paid",
    short: "Paid · Archive",
    hint: "Off active boards, still searchable",
    variant: "green",
  },
};

export type LeadStage =
  | "new_lead"
  | "contacted"
  | "conversation"
  | "sale_pending"
  | "in_order";

export const LEAD_STAGES: LeadStage[] = [
  "new_lead",
  "contacted",
  "conversation",
  "sale_pending",
  "in_order",
];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  conversation: "Conversation / Ongoing",
  sale_pending: "Sale Pending",
  in_order: "In Order",
};

/** Map legacy Sarah/SQLite stages onto the client-facing pipeline. */
export const LEGACY_LEAD_STAGE_MAP: Record<string, LeadStage> = {
  new_lead: "new_lead",
  ai_contacted: "contacted",
  contacted: "contacted",
  responded: "conversation",
  conversation: "conversation",
  appointment_set: "sale_pending",
  sale_pending: "sale_pending",
  confirmed_sale: "in_order",
  in_order: "in_order",
};

export type LeadSource =
  | "website"
  | "phone_call"
  | "walk_in"
  | "referral"
  | "google_ads"
  | "facebook";

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  website: "Website",
  phone_call: "Phone",
  walk_in: "Walk-in",
  referral: "Referral",
  google_ads: "Google Ads",
  facebook: "Facebook",
};

export type TrafficLight = "green" | "yellow" | "red";

export type LineKind = "product" | "labor" | "misc";

export interface DemoVehicle {
  year: number;
  make: string;
  model: string;
  bedSize: string;
  color: string;
}

export interface DemoClient {
  id: string;
  companyName: string | null;
  firstName: string;
  lastName: string;
  type: "commercial" | "residential";
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  createdAt: string;
  vehicles: DemoVehicle[];
  sample?: boolean;
}

export interface DemoInvoiceLine {
  id: string;
  kind: LineKind;
  description: string;
  qty: number;
  unitPrice: number;
  taxable: boolean;
  manufacturer?: string;
  sku?: string;
}

export interface DemoInvoice {
  id: string;
  number: string;
  clientId: string;
  jobId: string;
  location: "suburban" | "south";
  issuedAt: string | null; // billing date — set when moved to waiting_payment
  dueAt: string | null;
  lines: DemoInvoiceLine[];
  notes: string;
  qbConnected: false;
}

export interface DemoJob {
  id: string;
  invoiceId: string;
  clientId: string;
  bucket: JobBucket;
  orderedAt: string;
  arrivedAt?: string;
  installedAt?: string;
  billedAt?: string;
  paidAt?: string;
  eta?: string;
  vehicle: string;
  manufacturer: string;
  model: string;
  color: string;
  location: "suburban" | "south";
  installer?: string;
  poNumber?: string;
  notes?: string;
}

export interface DemoLeadActivity {
  id: string;
  at: string;
  kind: "system" | "ai" | "staff" | "customer" | "email" | "nudge";
  title: string;
  body: string;
}

export interface DemoLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: LeadSource;
  vehicle: string;
  bedSize: string;
  color: string;
  interest: string;
  stage: LeadStage;
  estimatedValue: number;
  lastContactAt: string;
  createdAt: string;
  daysInStage: number;
  traffic: TrafficLight;
  aiHandled: boolean;
  intakeEmail?: { subject: string; body: string; sentAt: string };
  nudge?: { subject: string; body: string; dueDays: number };
  activity: DemoLeadActivity[];
}

export interface DemoNote {
  id: string;
  clientId: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface DemoActivity {
  id: string;
  clientId: string;
  at: string;
  label: string;
  detail: string;
}

export interface DemoAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  durationMin: number;
  clientId: string;
  clientName: string;
  vehicle: string;
  jobId?: string;
  location: "suburban" | "south";
  installer: string;
  status: "confirmed" | "unconfirmed" | "complete";
  notes?: string;
}

export interface DemoCall {
  id: string;
  startedAt: string;
  durationSec: number;
  path: "voicemail" | "intake";
  callerPhone: string;
  callerName?: string;
  status: "completed" | "live" | "missed";
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: "demo-c-01",
    companyName: null,
    firstName: "Tom",
    lastName: "Alvarez",
    type: "residential",
    phone: "(303) 903-4412",
    email: "tom.alvarez@gmail.com",
    address: "2841 S Bellaire St",
    city: "Denver",
    state: "CO",
    zip: "80222",
    notes: "Prefers Saturday installs. Referred by a coworker at Xcel.",
    createdAt: "2025-11-02",
    vehicles: [{ year: 2023, make: "Toyota", model: "Tacoma", bedSize: "5' bed", color: "Cement" }],
    sample: true,
  },
  {
    id: "demo-c-02",
    companyName: null,
    firstName: "Maya",
    lastName: "Chen",
    type: "residential",
    phone: "(303) 903-8821",
    email: "maya.chen@icloud.com",
    address: "910 S University Blvd",
    city: "Denver",
    state: "CO",
    zip: "80209",
    notes: "Wants color-matched ATC. Truck is her daily driver.",
    createdAt: "2026-03-18",
    vehicles: [{ year: 2024, make: "Ford", model: "F-150", bedSize: "5.5' bed", color: "Oxford White" }],
    sample: true,
  },
  {
    id: "demo-c-03",
    companyName: "Iron Horse Hauling",
    firstName: "Derek",
    lastName: "Walsh",
    type: "commercial",
    phone: "(303) 903-1106",
    email: "dwalsh@ironhorsehauling.com",
    address: "4580 E 60th Ave",
    city: "Commerce City",
    state: "CO",
    zip: "80022",
    notes: "Fleet of 4 trucks — keep this client warm. Net 15.",
    createdAt: "2024-06-12",
    vehicles: [
      { year: 2022, make: "RAM", model: "2500", bedSize: "6'4\" bed", color: "Bright White" },
      { year: 2021, make: "RAM", model: "1500", bedSize: "5'7\" bed", color: "Granite Crystal" },
    ],
    sample: true,
  },
  {
    id: "demo-c-04",
    companyName: "Summit Roofing",
    firstName: "Elena",
    lastName: "Vasquez",
    type: "commercial",
    phone: "(720) 441-2280",
    email: "elena@summitroofingco.com",
    address: "11900 E 33rd Ave",
    city: "Aurora",
    state: "CO",
    zip: "80010",
    notes: "Commercial Z-series. Needs ladder rack + toolboxes next cycle.",
    createdAt: "2025-01-09",
    vehicles: [{ year: 2023, make: "Chevy", model: "Silverado 2500", bedSize: "8' bed", color: "Summit White" }],
    sample: true,
  },
  {
    id: "demo-c-05",
    companyName: null,
    firstName: "Chris",
    lastName: "Nguyen",
    type: "residential",
    phone: "(720) 555-0194",
    email: "chris.nguyen.denver@gmail.com",
    address: "6320 W 38th Ave",
    city: "Wheat Ridge",
    state: "CO",
    zip: "80033",
    notes: "Overland build. Asked about roof rack crossbars.",
    createdAt: "2026-07-22",
    vehicles: [{ year: 2024, make: "Toyota", model: "Tundra", bedSize: "5.5' bed", color: "Lunar Rock" }],
    sample: true,
  },
  {
    id: "demo-c-06",
    companyName: "Prairie Electric",
    firstName: "Nate",
    lastName: "Brooks",
    type: "commercial",
    phone: "(303) 555-0177",
    email: "nate@prairieelectric.com",
    address: "2101 S Platte River Dr",
    city: "Denver",
    state: "CO",
    zip: "80223",
    notes: "Repeat commercial. Paid same week last three jobs.",
    createdAt: "2023-09-14",
    vehicles: [{ year: 2020, make: "Ford", model: "F-250", bedSize: "8' bed", color: "Oxford White" }],
    sample: true,
  },
  {
    id: "demo-c-07",
    companyName: null,
    firstName: "Jordan",
    lastName: "Pellegrino",
    type: "residential",
    phone: "(303) 720-4488",
    email: "j.pellegrino@yahoo.com",
    address: "1440 S Clayton St",
    city: "Denver",
    state: "CO",
    zip: "80210",
    notes: "Walk-in from Saturday. Wants used if we have a Tacoma cap.",
    createdAt: "2026-08-30",
    vehicles: [{ year: 2019, make: "Toyota", model: "Tacoma", bedSize: "6' bed", color: "Magnetic Gray" }],
    sample: true,
  },
  {
    id: "demo-c-08",
    companyName: "Blue Ridge Landscaping",
    firstName: "Priya",
    lastName: "Shah",
    type: "commercial",
    phone: "(720) 903-3301",
    email: "priya@blueridgeland.com",
    address: "7800 E Iliff Ave",
    city: "Denver",
    state: "CO",
    zip: "80231",
    notes: "Needs three more toppers this fall if pricing holds.",
    createdAt: "2025-04-03",
    vehicles: [{ year: 2022, make: "GMC", model: "Sierra 1500", bedSize: "5'8\" bed", color: "White Frost" }],
    sample: true,
  },
];

// ---------------------------------------------------------------------------
// Jobs + invoices
// ---------------------------------------------------------------------------

export const DEMO_JOBS: DemoJob[] = [
  {
    id: "demo-j-01",
    invoiceId: "demo-inv-01",
    clientId: "demo-c-01",
    bucket: "waiting_arrival",
    orderedAt: "2026-09-02",
    eta: "2026-09-22",
    vehicle: "2023 Toyota Tacoma 5' bed",
    manufacturer: "A.R.E.",
    model: "Overland",
    color: "Cement Gray",
    location: "suburban",
    poNumber: "ARE-88421",
    notes: "Factory color match. Customer will text when truck is free.",
  },
  {
    id: "demo-j-02",
    invoiceId: "demo-inv-02",
    clientId: "demo-c-02",
    bucket: "waiting_install",
    orderedAt: "2026-08-20",
    arrivedAt: "2026-09-14",
    vehicle: "2024 Ford F-150 5.5' bed",
    manufacturer: "ATC",
    model: "Work Cap",
    color: "Oxford White",
    location: "suburban",
    installer: "Jorge M.",
    poNumber: "ATC-11092",
    notes: "Arrived 9/14. Ready to schedule — notify Maya.",
  },
  {
    id: "demo-j-03",
    invoiceId: "demo-inv-03",
    clientId: "demo-c-03",
    bucket: "waiting_payment",
    orderedAt: "2026-07-28",
    arrivedAt: "2026-08-19",
    installedAt: "2026-09-08",
    billedAt: "2026-09-08",
    vehicle: "2022 RAM 2500 6'4\" bed",
    manufacturer: "A.R.E.",
    model: "Z Series",
    color: "Bright White",
    location: "south",
    installer: "Tom R.",
    poNumber: "ARE-87110",
    notes: "Billing started on install day. Net 15 commercial.",
  },
  {
    id: "demo-j-04",
    invoiceId: "demo-inv-04",
    clientId: "demo-c-04",
    bucket: "waiting_payment",
    orderedAt: "2026-08-01",
    arrivedAt: "2026-08-25",
    installedAt: "2026-09-11",
    billedAt: "2026-09-11",
    vehicle: "2023 Chevy Silverado 2500 8' bed",
    manufacturer: "A.R.E.",
    model: "Z Series",
    color: "Summit White",
    location: "suburban",
    installer: "Brent K.",
    notes: "Toolbox labor added on site.",
  },
  {
    id: "demo-j-05",
    invoiceId: "demo-inv-05",
    clientId: "demo-c-05",
    bucket: "waiting_arrival",
    orderedAt: "2026-09-10",
    eta: "2026-10-03",
    vehicle: "2024 Toyota Tundra 5.5' bed",
    manufacturer: "A.R.E.",
    model: "Overland",
    color: "Lunar Rock",
    location: "suburban",
    poNumber: "ARE-89002",
  },
  {
    id: "demo-j-06",
    invoiceId: "demo-inv-06",
    clientId: "demo-c-06",
    bucket: "paid",
    orderedAt: "2026-06-02",
    arrivedAt: "2026-06-20",
    installedAt: "2026-06-27",
    billedAt: "2026-06-27",
    paidAt: "2026-07-02",
    vehicle: "2020 Ford F-250 8' bed",
    manufacturer: "A.R.E.",
    model: "CX Series",
    color: "Oxford White",
    location: "south",
    installer: "Carlos D.",
  },
  {
    id: "demo-j-07",
    invoiceId: "demo-inv-07",
    clientId: "demo-c-08",
    bucket: "waiting_install",
    orderedAt: "2026-08-12",
    arrivedAt: "2026-09-15",
    vehicle: "2022 GMC Sierra 1500 5'8\" bed",
    manufacturer: "Leer",
    model: "100R",
    color: "White Frost",
    location: "south",
    notes: "Arrived this week. Call Priya to book.",
  },
  {
    id: "demo-j-08",
    invoiceId: "demo-inv-08",
    clientId: "demo-c-07",
    bucket: "paid",
    orderedAt: "2026-04-04",
    arrivedAt: "2026-04-18",
    installedAt: "2026-04-22",
    billedAt: "2026-04-22",
    paidAt: "2026-04-22",
    vehicle: "2019 Toyota Tacoma 6' bed",
    manufacturer: "Snugtop",
    model: "SB Sport",
    color: "Magnetic Gray",
    location: "suburban",
    installer: "Jorge M.",
  },
];

function linesFor(jobId: string): DemoInvoiceLine[] {
  switch (jobId) {
    case "demo-j-01":
      return [
        { id: "l-01a", kind: "product", description: "A.R.E. Overland — Tacoma 5' · Cement Gray", qty: 1, unitPrice: 3895, taxable: true, manufacturer: "A.R.E.", sku: "OV-TAC-5-CEM" },
        { id: "l-01b", kind: "product", description: "Interior headliner kit", qty: 1, unitPrice: 285, taxable: true, manufacturer: "A.R.E." },
        { id: "l-01c", kind: "labor", description: "Install labor — Overland + seal", qty: 1, unitPrice: 450, taxable: false },
        { id: "l-01d", kind: "misc", description: "Shop supplies / freight", qty: 1, unitPrice: 65, taxable: false },
      ];
    case "demo-j-02":
      return [
        { id: "l-02a", kind: "product", description: "ATC Work Cap — F-150 5.5' · Oxford White", qty: 1, unitPrice: 2740, taxable: true, manufacturer: "ATC", sku: "ATC-F150-55-W" },
        { id: "l-02b", kind: "labor", description: "Install labor", qty: 1, unitPrice: 395, taxable: false },
        { id: "l-02c", kind: "misc", description: "Catch-all: bed rail prep", qty: 1, unitPrice: 40, taxable: false },
      ];
    case "demo-j-03":
      return [
        { id: "l-03a", kind: "product", description: "A.R.E. Z Series — RAM 2500 6'4\" · Bright White", qty: 1, unitPrice: 4120, taxable: true, manufacturer: "A.R.E." },
        { id: "l-03b", kind: "product", description: "Commercial side windows (pair)", qty: 1, unitPrice: 380, taxable: true, manufacturer: "A.R.E." },
        { id: "l-03c", kind: "labor", description: "Install labor — commercial cap", qty: 1, unitPrice: 525, taxable: false },
        { id: "l-03d", kind: "misc", description: "Catch-all: after-hours shop time", qty: 1, unitPrice: 90, taxable: false },
      ];
    case "demo-j-04":
      return [
        { id: "l-04a", kind: "product", description: "A.R.E. Z Series — Silverado 2500 8' · Summit White", qty: 1, unitPrice: 4380, taxable: true, manufacturer: "A.R.E." },
        { id: "l-04b", kind: "product", description: "Crossbed toolbox", qty: 1, unitPrice: 620, taxable: true },
        { id: "l-04c", kind: "labor", description: "Install labor + toolbox mount", qty: 1, unitPrice: 575, taxable: false },
      ];
    case "demo-j-05":
      return [
        { id: "l-05a", kind: "product", description: "A.R.E. Overland — Tundra 5.5' · Lunar Rock", qty: 1, unitPrice: 4210, taxable: true, manufacturer: "A.R.E." },
        { id: "l-05b", kind: "labor", description: "Install labor", qty: 1, unitPrice: 475, taxable: false },
      ];
    case "demo-j-06":
      return [
        { id: "l-06a", kind: "product", description: "A.R.E. CX Series — F-250 8' · Oxford White", qty: 1, unitPrice: 3120, taxable: true, manufacturer: "A.R.E." },
        { id: "l-06b", kind: "labor", description: "Install labor", qty: 1, unitPrice: 425, taxable: false },
      ];
    case "demo-j-07":
      return [
        { id: "l-07a", kind: "product", description: "Leer 100R — Sierra 1500 5'8\" · White Frost", qty: 1, unitPrice: 2680, taxable: true, manufacturer: "Leer" },
        { id: "l-07b", kind: "labor", description: "Install labor", qty: 1, unitPrice: 375, taxable: false },
        { id: "l-07c", kind: "misc", description: "Catch-all: paint-match touch-up", qty: 1, unitPrice: 55, taxable: false },
      ];
    default:
      return [
        { id: "l-08a", kind: "product", description: "Snugtop SB Sport — Tacoma 6' · Magnetic Gray", qty: 1, unitPrice: 2450, taxable: true, manufacturer: "Snugtop" },
        { id: "l-08b", kind: "labor", description: "Install labor", qty: 1, unitPrice: 350, taxable: false },
      ];
  }
}

export const DEMO_INVOICES: DemoInvoice[] = DEMO_JOBS.map((job) => ({
  id: job.invoiceId,
  number: `ST-2026-${job.id.slice(-2).toUpperCase()}${job.id.replace(/\D/g, "").padStart(3, "0")}`,
  clientId: job.clientId,
  jobId: job.id,
  location: job.location,
  issuedAt: job.billedAt ?? null,
  dueAt: job.billedAt ? addDays(job.billedAt, job.clientId === "demo-c-03" || job.clientId === "demo-c-04" ? 15 : 7) : null,
  lines: linesFor(job.id),
  notes: job.notes ?? "",
  qbConnected: false,
}));

// prettier numbers: ST-2026-401 etc.
DEMO_INVOICES.forEach((inv, i) => {
  inv.number = `ST-2026-${840 + i}`;
});

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

const AI_SIG =
  "\n\n—\nSarah, AI agent on behalf of Suburban Toppers\n5795 E. Colfax Ave, Denver, CO  ·  (303) 355-0305\nThis message was sent automatically. A teammate will follow up.";

export const DEMO_LEADS: DemoLead[] = [
  {
    id: "demo-l-01",
    firstName: "Avery",
    lastName: "Kim",
    phone: "(303) 555-2210",
    email: "avery.kim.truck@gmail.com",
    source: "website",
    vehicle: "2024 Toyota Tacoma",
    bedSize: "5' bed",
    color: "Cement",
    interest: "A.R.E. Overland",
    stage: "new_lead",
    estimatedValue: 4300,
    lastContactAt: hoursAgo(4),
    createdAt: hoursAgo(5),
    daysInStage: 0,
    traffic: "green",
    aiHandled: true,
    intakeEmail: {
      subject: "Thanks for reaching out — a few quick questions about your Tacoma",
      sentAt: hoursAgo(4.5),
      body:
        `Hi Avery,\n\nThanks for the website form. I'm gathering a few details so the team can get you a tight quote on an A.R.E. Overland.\n\nCould you confirm:\n• Year / make / model — 2024 Toyota Tacoma?\n• Bed size — 5' or 6'?\n• Truck color — Cement?\n• What you're looking for — Overland with rack, windows, interior?\n\nReply to this email or text (303) 355-0305.` +
        AI_SIG,
    },
    activity: [
      { id: "a1", at: hoursAgo(5), kind: "system", title: "Website form", body: "New lead from suburbantoppers.com configurator." },
      { id: "a2", at: hoursAgo(4.5), kind: "email", title: "AI intake email sent", body: "Sarah sent the make/model/bed/color intake on behalf of Suburban Toppers." },
    ],
  },
  {
    id: "demo-l-02",
    firstName: "Luis",
    lastName: "Ortega",
    phone: "(720) 555-8833",
    email: "lortega@outlook.com",
    source: "google_ads",
    vehicle: "2023 Chevy Colorado",
    bedSize: "5'2\" bed",
    color: "Black",
    interest: "Leer 100R",
    stage: "new_lead",
    estimatedValue: 2800,
    lastContactAt: hoursAgo(30),
    createdAt: hoursAgo(32),
    daysInStage: 1,
    traffic: "green",
    aiHandled: true,
    intakeEmail: {
      subject: "Got your Google inquiry — confirming your Colorado fitment",
      sentAt: hoursAgo(31),
      body:
        `Hi Luis,\n\nThanks for clicking through from Google. Before Nate prices a Leer 100R:\n\n• 2023 Chevy Colorado — is that right?\n• Bed size?\n• Color?\n• Looking for a work cap, windows, or something more finished?\n\nI'll pass this to the team as soon as I hear back.` +
        AI_SIG,
    },
    activity: [
      { id: "a1", at: hoursAgo(32), kind: "system", title: "Google Ads lead", body: "Imported from Google Ads form." },
      { id: "a2", at: hoursAgo(31), kind: "email", title: "AI intake email sent", body: "Fitment questions queued." },
    ],
  },
  {
    id: "demo-l-03",
    firstName: "Hannah",
    lastName: "Reed",
    phone: "(303) 720-1199",
    email: "hannah.reed@gmail.com",
    source: "phone_call",
    vehicle: "2022 RAM 1500",
    bedSize: "5'7\" bed",
    color: "Billet Silver",
    interest: "ATC cap",
    stage: "contacted",
    estimatedValue: 3100,
    lastContactAt: daysAgo(1),
    createdAt: daysAgo(2),
    daysInStage: 1,
    traffic: "green",
    aiHandled: false,
    activity: [
      { id: "a1", at: daysAgo(2), kind: "system", title: "Phone lead", body: "Front desk captured after a missed call." },
      { id: "a2", at: daysAgo(1), kind: "staff", title: "Nate called", body: "Left a voicemail + texted hours." },
    ],
  },
  {
    id: "demo-l-04",
    firstName: "Marcus",
    lastName: "Diaz",
    phone: "(720) 441-0091",
    email: "marcus.diaz.co@gmail.com",
    source: "facebook",
    vehicle: "2021 Ford Ranger",
    bedSize: "5' bed",
    color: "Cactus Gray",
    interest: "Used topper if available",
    stage: "contacted",
    estimatedValue: 1200,
    lastContactAt: daysAgo(4),
    createdAt: daysAgo(6),
    daysInStage: 4,
    traffic: "yellow",
    aiHandled: true,
    nudge: {
      dueDays: NUDGE_AFTER_DAYS,
      subject: "Follow-up needed — Marcus Diaz (Ford Ranger, used topper)",
      body: `Hi Nate,\n\nMarcus hasn't replied in ${NUDGE_AFTER_DAYS}+ days. Suggested follow-up (you send this — AI will not):\n\n"Hey Marcus, it's Nate at Suburban Toppers. We just took in a Ranger-fit used cap in charcoal. Want me to hold it until Saturday?"\n\n— CRM nudge`,
    },
    activity: [
      { id: "a1", at: daysAgo(6), kind: "system", title: "Facebook lead", body: "Marketplace comment → form." },
      { id: "a2", at: daysAgo(5), kind: "ai", title: "First SMS", body: "Sarah asked about bed size and budget." },
      { id: "a3", at: daysAgo(0), kind: "nudge", title: "Staff nudge", body: "No activity for 4 days — follow-up suggested." },
    ],
  },
  {
    id: "demo-l-05",
    firstName: "Sofia",
    lastName: "Bennett",
    phone: "(303) 555-6402",
    email: "sofia.bennett@gmail.com",
    source: "website",
    vehicle: "2024 Ford F-150",
    bedSize: "6.5' bed",
    color: "Antimatter Blue",
    interest: "A.R.E. CX + carpet kit",
    stage: "conversation",
    estimatedValue: 3600,
    lastContactAt: hoursAgo(20),
    createdAt: daysAgo(5),
    daysInStage: 2,
    traffic: "green",
    aiHandled: true,
    activity: [
      { id: "a1", at: daysAgo(5), kind: "email", title: "AI intake email", body: "Confirmed 6.5' bed and Antimatter Blue." },
      { id: "a2", at: daysAgo(4), kind: "customer", title: "Customer replied", body: "Wants carpet, front window, no side sliders." },
      { id: "a3", at: hoursAgo(20), kind: "staff", title: "Nate quoted", body: "Ballpark $3,400–$3,800 installed. She's deciding on carpet." },
    ],
  },
  {
    id: "demo-l-06",
    firstName: "Owen",
    lastName: "Hart",
    phone: "(720) 555-7730",
    email: "owen.hart.mtb@gmail.com",
    source: "referral",
    vehicle: "2023 Toyota Tundra",
    bedSize: "5.5' bed",
    color: "Lunar Rock",
    interest: "A.R.E. Overland + rack",
    stage: "conversation",
    estimatedValue: 4800,
    lastContactAt: daysAgo(8),
    createdAt: daysAgo(12),
    daysInStage: 8,
    traffic: "red",
    aiHandled: false,
    nudge: {
      dueDays: NUDGE_AFTER_DAYS,
      subject: "Follow-up needed — Owen Hart (Tundra Overland)",
      body: `Hi Nate,\n\nOwen went quiet after the rack quote. Suggested human follow-up:\n\n"Hey Owen — still happy to lock the Overland + rack before the October A.R.E. price change. Want me to hold a Saturday slot?"\n\n— CRM nudge`,
    },
    activity: [
      { id: "a1", at: daysAgo(12), kind: "system", title: "Referral", body: "Referred by Chris Nguyen." },
      { id: "a2", at: daysAgo(8), kind: "staff", title: "Quote sent", body: "Overland + Yakima rack package." },
      { id: "a3", at: daysAgo(0), kind: "nudge", title: "Stale conversation", body: "8 days in stage, no activity." },
    ],
  },
  {
    id: "demo-l-07",
    firstName: "Priya",
    lastName: "Shah",
    phone: "(720) 903-3301",
    email: "priya@blueridgeland.com",
    source: "walk_in",
    vehicle: "2022 GMC Sierra 1500",
    bedSize: "5'8\" bed",
    color: "White Frost",
    interest: "Leer 100R (second truck)",
    stage: "sale_pending",
    estimatedValue: 3100,
    lastContactAt: daysAgo(1),
    createdAt: daysAgo(9),
    daysInStage: 1,
    traffic: "green",
    aiHandled: false,
    activity: [
      { id: "a1", at: daysAgo(9), kind: "staff", title: "Walk-in", body: "Measured at South shop." },
      { id: "a2", at: daysAgo(1), kind: "staff", title: "Verbal yes", body: "Waiting on PO from office manager." },
    ],
  },
  {
    id: "demo-l-08",
    firstName: "Gabe",
    lastName: "Foster",
    phone: "(303) 441-8820",
    email: "gabe.foster@gmail.com",
    source: "website",
    vehicle: "2025 Chevy Silverado 1500",
    bedSize: "5'8\" bed",
    color: "Northsky Blue",
    interest: "A.R.E. CX Series",
    stage: "sale_pending",
    estimatedValue: 3400,
    lastContactAt: daysAgo(6),
    createdAt: daysAgo(14),
    daysInStage: 6,
    traffic: "red",
    aiHandled: true,
    nudge: {
      dueDays: NUDGE_AFTER_DAYS,
      subject: "Sale pending going stale — Gabe Foster",
      body: `Hi Nate,\n\nGabe said yes on the CX but hasn't returned the signed quote. Suggested:\n\n"Gabe — we can still make the 9/24 A.R.E. truck if we send the PO tomorrow. Want me to start the order?"\n\n— CRM nudge`,
    },
    activity: [
      { id: "a1", at: daysAgo(14), kind: "email", title: "AI intake", body: "Website form + intake email completed." },
      { id: "a2", at: daysAgo(7), kind: "customer", title: "Wants to order", body: "Asked to start CX in Northsky Blue." },
    ],
  },
  {
    id: "demo-l-09",
    firstName: "Tom",
    lastName: "Alvarez",
    phone: "(303) 903-4412",
    email: "tom.alvarez@gmail.com",
    source: "website",
    vehicle: "2023 Toyota Tacoma",
    bedSize: "5' bed",
    color: "Cement Gray",
    interest: "A.R.E. Overland",
    stage: "in_order",
    estimatedValue: 4695,
    lastContactAt: daysAgo(15),
    createdAt: daysAgo(40),
    daysInStage: 15,
    traffic: "green",
    aiHandled: true,
    activity: [
      { id: "a1", at: daysAgo(40), kind: "system", title: "Converted", body: "Moved to Jobs · ST-2026-840 · waiting on arrival." },
    ],
  },
  {
    id: "demo-l-10",
    firstName: "Riley",
    lastName: "James",
    phone: "(303) 555-0199",
    email: "riley.james.den@gmail.com",
    source: "facebook",
    vehicle: "2018 Nissan Frontier",
    bedSize: "6' bed",
    color: "Arctic Blue",
    interest: "Used cap",
    stage: "new_lead",
    estimatedValue: 900,
    lastContactAt: hoursAgo(2),
    createdAt: hoursAgo(2),
    daysInStage: 0,
    traffic: "green",
    aiHandled: true,
    intakeEmail: {
      subject: "Thanks for the Facebook message — used Frontier cap",
      sentAt: hoursAgo(1.8),
      body:
        `Hi Riley,\n\nSaw your note about a used cap for a 2018 Frontier. To check trade-ins:\n\n• Bed size (5' or 6')?\n• Cab style?\n• Color you'd accept if it's not an exact match?\n\nI'll look at what's on the lot today.` +
        AI_SIG,
    },
    activity: [
      { id: "a1", at: hoursAgo(2), kind: "system", title: "Facebook", body: "Messenger → lead." },
      { id: "a2", at: hoursAgo(1.8), kind: "email", title: "AI intake email sent", body: "Used-inventory questions." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Notes + activity
// ---------------------------------------------------------------------------

export const DEMO_NOTES: DemoNote[] = [
  { id: "n1", clientId: "demo-c-01", author: "Nate Brooks", createdAt: "2026-09-02", body: "Ordered Overland Cement Gray. Customer will text when the truck is free for a Saturday." },
  { id: "n2", clientId: "demo-c-03", author: "Dan Jr.", createdAt: "2026-09-08", body: "Installed Z Series at South. Net 15 — send statement Friday if unpaid." },
  { id: "n3", clientId: "demo-c-03", author: "Zack Vivas", createdAt: "2024-06-12", body: "Has a fleet of 4 trucks — keep this client warm." },
  { id: "n4", clientId: "demo-c-02", author: "Nate Brooks", createdAt: "2026-09-14", body: "ATC arrived. Call Maya to schedule — she prefers mornings." },
  { id: "n5", clientId: "demo-c-06", author: "Lisa Chen", createdAt: "2026-07-02", body: "Paid same week. Ask about the second service body in Q4." },
];

export const DEMO_ACTIVITY: DemoActivity[] = [
  { id: "act1", clientId: "demo-c-01", at: "2026-09-02", label: "PO sent to A.R.E.", detail: "ARE-88421 · Overland Cement Gray" },
  { id: "act2", clientId: "demo-c-02", at: "2026-09-14", label: "Topper arrived", detail: "ATC Work Cap ready to schedule" },
  { id: "act3", clientId: "demo-c-03", at: "2026-09-08", label: "Installed · billing started", detail: "Invoice ST-2026-842 considered sent" },
  { id: "act4", clientId: "demo-c-03", at: "2026-09-08", label: "SMS", detail: "“Your Z Series is on. Statement goes out today.”" },
  { id: "act5", clientId: "demo-c-06", at: "2026-07-02", label: "Payment received", detail: "Archived job ST-2026-845" },
];

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

function isoDateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  { id: "ap-1", date: isoDateOffset(0), startTime: "08:00", durationMin: 90, clientId: "demo-c-02", clientName: "Maya Chen", vehicle: "2024 F-150 · ATC Work Cap", jobId: "demo-j-02", location: "suburban", installer: "Jorge M.", status: "unconfirmed", notes: "Waiting on her to confirm morning slot" },
  { id: "ap-2", date: isoDateOffset(0), startTime: "10:00", durationMin: 120, clientId: "demo-c-08", clientName: "Blue Ridge Landscaping", vehicle: "2022 Sierra · Leer 100R", jobId: "demo-j-07", location: "south", installer: "Tom R.", status: "confirmed" },
  { id: "ap-3", date: isoDateOffset(0), startTime: "13:30", durationMin: 90, clientId: "demo-c-04", clientName: "Summit Roofing", vehicle: "Warranty check · Z Series", location: "suburban", installer: "Brent K.", status: "confirmed" },
  { id: "ap-4", date: isoDateOffset(1), startTime: "09:00", durationMin: 90, clientId: "demo-c-05", clientName: "Chris Nguyen", vehicle: "Measure for Overland", location: "suburban", installer: "Jorge M.", status: "confirmed" },
  { id: "ap-5", date: isoDateOffset(2), startTime: "08:30", durationMin: 120, clientId: "demo-c-03", clientName: "Iron Horse Hauling", vehicle: "Fleet truck 3 — quote", location: "south", installer: "Carlos D.", status: "unconfirmed" },
  { id: "ap-6", date: isoDateOffset(-1), startTime: "11:00", durationMin: 90, clientId: "demo-c-06", clientName: "Prairie Electric", vehicle: "Latch adjustment", location: "south", installer: "Tom R.", status: "complete" },
  { id: "ap-7", date: isoDateOffset(4), startTime: "09:30", durationMin: 90, clientId: "demo-c-01", clientName: "Tom Alvarez", vehicle: "Hold for Overland arrival", jobId: "demo-j-01", location: "suburban", installer: "Jorge M.", status: "unconfirmed", notes: "Soft hold until ETA firms up" },
];

export const DEMO_CALLS: DemoCall[] = [
  { id: "call-01", startedAt: hoursAgo(3), durationSec: 186, path: "intake", callerPhone: "(303) 555-2210", callerName: "Avery Kim", status: "completed" },
  { id: "call-02", startedAt: hoursAgo(26), durationSec: 42, path: "voicemail", callerPhone: "(720) 441-0091", callerName: "Marcus Diaz", status: "completed" },
  { id: "call-03", startedAt: hoursAgo(0.2), durationSec: 0, path: "intake", callerPhone: "(303) 720-4488", status: "live" },
];

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

export const HISTORICAL_PERIODS = {
  "2025": {
    label: "Jan–Aug 2025",
    revenue: 1_184_000,
    installs: 312,
    newClients: 148,
    returningClients: 164,
    avgTicket: 3795,
    byBucket: { waiting_arrival: 18, waiting_install: 11, waiting_payment: 22, paid: 261 },
    manufacturers: [
      { name: "A.R.E.", revenue: 612_000, units: 158 },
      { name: "ATC", revenue: 198_000, units: 62 },
      { name: "Leer", revenue: 221_000, units: 64 },
      { name: "Snugtop", revenue: 153_000, units: 28 },
    ],
    monthly: [
      { month: "Jan", value: 118_000 },
      { month: "Feb", value: 126_000 },
      { month: "Mar", value: 154_000 },
      { month: "Apr", value: 168_000 },
      { month: "May", value: 176_000 },
      { month: "Jun", value: 162_000 },
      { month: "Jul", value: 148_000 },
      { month: "Aug", value: 132_000 },
    ],
  },
  "2026": {
    label: "Jan–Aug 2026",
    revenue: 1_346_000,
    installs: 341,
    newClients: 161,
    returningClients: 180,
    avgTicket: 3947,
    byBucket: { waiting_arrival: 14, waiting_install: 9, waiting_payment: 16, paid: 302 },
    manufacturers: [
      { name: "A.R.E.", revenue: 704_000, units: 176 },
      { name: "ATC", revenue: 246_000, units: 74 },
      { name: "Leer", revenue: 228_000, units: 61 },
      { name: "Snugtop", revenue: 168_000, units: 30 },
    ],
    monthly: [
      { month: "Jan", value: 122_000 },
      { month: "Feb", value: 138_000 },
      { month: "Mar", value: 171_000 },
      { month: "Apr", value: 188_000 },
      { month: "May", value: 201_000 },
      { month: "Jun", value: 184_000 },
      { month: "Jul", value: 176_000 },
      { month: "Aug", value: 166_000 },
    ],
  },
} as const;

export const DASHBOARD_REVENUE_FALLBACK = [
  { month: "Oct '25", value: 168_000 },
  { month: "Nov '25", value: 152_000 },
  { month: "Dec '25", value: 124_000 },
  { month: "Jan '26", value: 122_000 },
  { month: "Feb '26", value: 138_000 },
  { month: "Mar '26", value: 171_000 },
  { month: "Apr '26", value: 188_000 },
  { month: "May '26", value: 201_000 },
  { month: "Jun '26", value: 184_000 },
  { month: "Jul '26", value: 176_000 },
  { month: "Aug '26", value: 166_000 },
  { month: "Sep '26", value: 158_000 },
];

// ---------------------------------------------------------------------------
// Totals / helpers
// ---------------------------------------------------------------------------

export function lineAmount(line: DemoInvoiceLine): number {
  return line.qty * line.unitPrice;
}

export function invoiceTotals(invoice: DemoInvoice) {
  const taxable = invoice.lines.filter((l) => l.taxable).reduce((s, l) => s + lineAmount(l), 0);
  const nontaxable = invoice.lines.filter((l) => !l.taxable).reduce((s, l) => s + lineAmount(l), 0);
  const tax = Math.round(taxable * DENVER_TAX_RATE);
  const subtotal = taxable + nontaxable;
  const total = subtotal + tax;
  return { taxable, nontaxable, tax, subtotal, total, taxRate: DENVER_TAX_RATE };
}

export function jobTotal(job: DemoJob): number {
  const inv = DEMO_INVOICES.find((i) => i.id === job.invoiceId);
  return inv ? invoiceTotals(inv).total : 0;
}

export function bucketStats() {
  const active = DEMO_JOBS.filter((j) => j.bucket !== "paid");
  const groups = JOB_BUCKETS.map((bucket) => {
    const jobs = DEMO_JOBS.filter((j) => j.bucket === bucket);
    const value = jobs.reduce((s, j) => s + jobTotal(j), 0);
    return { bucket, count: jobs.length, value, jobs };
  });
  return {
    groups,
    activeCount: active.length,
    activeValue: active.reduce((s, j) => s + jobTotal(j), 0),
  };
}

export function clientDisplayName(c: DemoClient): string {
  return c.companyName ?? `${c.firstName} ${c.lastName}`;
}

export function getDemoClient(id: string): DemoClient | undefined {
  return DEMO_CLIENTS.find((c) => c.id === id);
}

export function getDemoInvoice(id: string): DemoInvoice | undefined {
  return DEMO_INVOICES.find((i) => i.id === id);
}

export function getDemoJob(id: string): DemoJob | undefined {
  return DEMO_JOBS.find((j) => j.id === id);
}

export function getDemoLead(id: string): DemoLead | undefined {
  return DEMO_LEADS.find((l) => l.id === id);
}

export function jobsForClient(clientId: string): DemoJob[] {
  return DEMO_JOBS.filter((j) => j.clientId === clientId);
}

export function invoicesForClient(clientId: string): DemoInvoice[] {
  return DEMO_INVOICES.filter((i) => i.clientId === clientId);
}

export function notesForClient(clientId: string): DemoNote[] {
  return DEMO_NOTES.filter((n) => n.clientId === clientId);
}

export function activityForClient(clientId: string): DemoActivity[] {
  return DEMO_ACTIVITY.filter((a) => a.clientId === clientId);
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function phoneMatches(phone: string, query: string): boolean {
  const q = digitsOnly(query);
  if (q.length < 3) return false;
  return digitsOnly(phone).includes(q);
}

export function fuzzyText(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export function searchDemoClients(query: string): DemoClient[] {
  const q = query.trim();
  if (!q) return DEMO_CLIENTS;
  return DEMO_CLIENTS.filter((c) => {
    if (phoneMatches(c.phone, q)) return true;
    const blob = [c.firstName, c.lastName, c.companyName ?? "", c.email, c.city].join(" ");
    return fuzzyText(blob, q);
  });
}

export function searchDemoLeads(query: string): DemoLead[] {
  const q = query.trim();
  if (!q) return DEMO_LEADS;
  return DEMO_LEADS.filter((l) => {
    if (phoneMatches(l.phone, q)) return true;
    return fuzzyText([l.firstName, l.lastName, l.email, l.vehicle, l.interest].join(" "), q);
  });
}

export function searchDemoJobs(query: string): DemoJob[] {
  const q = query.trim().toLowerCase();
  if (!q) return DEMO_JOBS;
  return DEMO_JOBS.filter((j) => {
    const client = getDemoClient(j.clientId);
    if (client && (phoneMatches(client.phone, query) || fuzzyText(clientDisplayName(client), q))) return true;
    return fuzzyText([j.vehicle, j.manufacturer, j.model, j.color, j.poNumber ?? "", j.invoiceId].join(" "), q);
  });
}

export type ActionKind = "stale_lead" | "arrival" | "payment" | "nudge" | "schedule";

export interface ActionItem {
  id: string;
  kind: ActionKind;
  urgency: "now" | "today" | "soon";
  title: string;
  detail: string;
  href: string;
  meta?: string;
}

export function actionQueue(): ActionItem[] {
  const items: ActionItem[] = [];

  for (const lead of DEMO_LEADS) {
    if (lead.traffic === "red" && lead.stage !== "in_order") {
      items.push({
        id: `aq-lead-${lead.id}`,
        kind: "stale_lead",
        urgency: "now",
        title: `${lead.firstName} ${lead.lastName} is going cold`,
        detail: `${LEAD_STAGE_LABELS[lead.stage]} · ${lead.daysInStage} days in stage · ${lead.vehicle}`,
        href: `/leads/${lead.id}`,
        meta: formatCurrency(lead.estimatedValue),
      });
    } else if (lead.nudge) {
      items.push({
        id: `aq-nudge-${lead.id}`,
        kind: "nudge",
        urgency: "today",
        title: `Follow-up needed · ${lead.firstName} ${lead.lastName}`,
        detail: lead.nudge.subject,
        href: `/leads/${lead.id}`,
        meta: `${NUDGE_AFTER_DAYS}-day nudge`,
      });
    }
  }

  for (const job of DEMO_JOBS.filter((j) => j.bucket === "waiting_install")) {
    const client = getDemoClient(job.clientId)!;
    items.push({
      id: `aq-arr-${job.id}`,
      kind: "arrival",
      urgency: "now",
      title: `${job.manufacturer} ${job.model} arrived`,
      detail: `Notify ${clientDisplayName(client)} and schedule install`,
      href: `/jobs?focus=${job.id}`,
      meta: job.arrivedAt,
    });
  }

  for (const job of DEMO_JOBS.filter((j) => j.bucket === "waiting_payment")) {
    const client = getDemoClient(job.clientId)!;
    const inv = getDemoInvoice(job.invoiceId)!;
    items.push({
      id: `aq-pay-${job.id}`,
      kind: "payment",
      urgency: "today",
      title: `${clientDisplayName(client)} · waiting on payment`,
      detail: `Billed ${job.billedAt} · ${inv.number}`,
      href: `/invoices/${inv.id}`,
      meta: formatCurrency(invoiceTotals(inv).total),
    });
  }

  const unconfirmed = DEMO_APPOINTMENTS.filter((a) => a.status === "unconfirmed" && a.date >= isoDateOffset(0));
  for (const ap of unconfirmed) {
    items.push({
      id: `aq-sch-${ap.id}`,
      kind: "schedule",
      urgency: "soon",
      title: `Unconfirmed · ${ap.clientName}`,
      detail: `${ap.date} ${ap.startTime} · ${ap.vehicle}`,
      href: `/schedule?date=${ap.date}`,
    });
  }

  const rank = { now: 0, today: 1, soon: 2 };
  return items.sort((a, b) => rank[a.urgency] - rank[b.urgency]);
}

export function trafficFromDays(days: number): TrafficLight {
  if (days >= TRAFFIC_RED_DAYS) return "red";
  if (days >= TRAFFIC_YELLOW_DAYS) return "yellow";
  return "green";
}

export function locationLabel(loc: "suburban" | "south"): string {
  return loc === "suburban" ? "Colfax (HQ)" : "South / Centennial";
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}
