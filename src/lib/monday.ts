/**
 * monday.com-inspired CRM tokens for Suburban Toppers.
 * Chrome uses brand blue / yellow; labels use monday's vivid status palette.
 */

export const MONDAY = {
  green: "#00c875",
  orange: "#fdab3d",
  red: "#e2445c",
  blue: "#579bfc",
  purple: "#a25ddc",
  yellow: "#ffcb00",
  lime: "#9cd326",
  sky: "#007eb5",
  navy: "#225091",
  pink: "#ff5ac4",
  gray: "#c4c4c4",
  dark: "#323338",
  brand: "#0E4CA1",
  gold: "#FFD504",
} as const;

export type StatusOption = { id: string; label: string; color: string };

export type StaffPerson = { id: string; name: string };

export const STAFF: StaffPerson[] = [
  { id: "nate", name: "Nate Brooks" },
  { id: "zack", name: "Zack Vivas" },
  { id: "dan", name: "Dan Jr." },
  { id: "lisa", name: "Lisa Chen" },
  { id: "jorge", name: "Jorge M." },
  { id: "sarah", name: "Sarah AI" },
];

export function staffById(id: string | null | undefined): StaffPerson | undefined {
  if (!id) return undefined;
  return STAFF.find((s) => s.id === id);
}

export const LEAD_STAGE_STATUS: StatusOption[] = [
  { id: "new_lead", label: "New Lead", color: MONDAY.blue },
  { id: "contacted", label: "Contacted", color: MONDAY.sky },
  { id: "conversation", label: "Conversation", color: MONDAY.purple },
  { id: "sale_pending", label: "Sale Pending", color: MONDAY.orange },
  { id: "in_order", label: "In Order", color: MONDAY.green },
];

export const JOB_BUCKET_STATUS: StatusOption[] = [
  { id: "waiting_arrival", label: "Waiting Arrival", color: MONDAY.orange },
  { id: "waiting_install", label: "Waiting Install", color: MONDAY.blue },
  { id: "waiting_payment", label: "Waiting Payment", color: MONDAY.red },
  { id: "paid", label: "Paid", color: MONDAY.green },
];

export const SOURCE_STATUS: StatusOption[] = [
  { id: "website", label: "Website", color: MONDAY.blue },
  { id: "phone_call", label: "Phone", color: MONDAY.green },
  { id: "walk_in", label: "Walk-in", color: MONDAY.purple },
  { id: "referral", label: "Referral", color: MONDAY.yellow },
  { id: "google_ads", label: "Google Ads", color: MONDAY.pink },
  { id: "facebook", label: "Facebook", color: MONDAY.sky },
];

export const HEALTH_STATUS: StatusOption[] = [
  { id: "green", label: "On track", color: MONDAY.green },
  { id: "yellow", label: "Follow up", color: MONDAY.orange },
  { id: "red", label: "Stale", color: MONDAY.red },
];

export const PRIORITY_STATUS: StatusOption[] = [
  { id: "low", label: "Low", color: MONDAY.blue },
  { id: "medium", label: "Medium", color: MONDAY.yellow },
  { id: "high", label: "High", color: MONDAY.orange },
  { id: "urgent", label: "Urgent", color: MONDAY.red },
];

export const CLIENT_TYPE_STATUS: StatusOption[] = [
  { id: "residential", label: "Residential", color: MONDAY.blue },
  { id: "commercial", label: "Commercial", color: MONDAY.purple },
];

export const APPT_STATUS: StatusOption[] = [
  { id: "unconfirmed", label: "Unconfirmed", color: MONDAY.orange },
  { id: "confirmed", label: "Confirmed", color: MONDAY.blue },
  { id: "complete", label: "Done", color: MONDAY.green },
];

export const LOCATION_STATUS: StatusOption[] = [
  { id: "suburban", label: "Colfax HQ", color: MONDAY.brand },
  { id: "south", label: "South / Centennial", color: MONDAY.sky },
];

const LEAD_OWNERS: Record<string, string> = {
  "demo-l-01": "sarah",
  "demo-l-02": "sarah",
  "demo-l-03": "nate",
  "demo-l-04": "zack",
  "demo-l-05": "nate",
  "demo-l-06": "lisa",
  "demo-l-07": "nate",
  "demo-l-08": "zack",
  "demo-l-09": "nate",
  "demo-l-10": "sarah",
};

export function defaultLeadOwner(id: string): string {
  return LEAD_OWNERS[id] ?? (id.includes("demo") ? "nate" : "zack");
}

export function defaultJobOwner(installer?: string): string {
  if (!installer) return "nate";
  const lower = installer.toLowerCase();
  if (lower.startsWith("jorge")) return "jorge";
  if (lower.startsWith("tom")) return "dan";
  if (lower.startsWith("brent")) return "zack";
  if (lower.startsWith("carlos")) return "jorge";
  return "nate";
}

export function contrastText(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length < 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? "#323338" : "#ffffff";
}

export function optionById(options: StatusOption[], id: string | null | undefined): StatusOption | undefined {
  if (!id) return undefined;
  return options.find((o) => o.id === id);
}
