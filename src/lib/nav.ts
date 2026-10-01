import {
  Home,
  Calendar,
  PhoneCall,
  Users,
  Package,
  ClipboardList,
  Sparkles,
  BarChart3,
  Wrench,
  CheckSquare,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type NavLeaf = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type RecordIcon = {
  bg: string;
  fg: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  tile?: RecordIcon;
  color?: string;
};

export const WORKSPACE_BOARDS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home, color: "#FFD504" },
  { label: "My work", href: "/dashboard#queue", icon: CheckSquare, color: "#579bfc" },
  { label: "Action queue", href: "/dashboard#queue", icon: Bell, color: "#e2445c" },
];

export const PIPELINE_BOARDS: NavItem[] = [
  { label: "Leads", href: "/leads", icon: Sparkles, color: "#fdab3d", tile: { bg: "#fdab3d", fg: "#fff" } },
  { label: "Jobs", href: "/jobs", icon: ClipboardList, color: "#579bfc", tile: { bg: "#579bfc", fg: "#fff" } },
  { label: "Clients", href: "/clients", icon: Users, color: "#00c875", tile: { bg: "#00c875", fg: "#fff" } },
  { label: "Schedule", href: "/schedule", icon: Calendar, color: "#a25ddc", tile: { bg: "#a25ddc", fg: "#fff" } },
  { label: "Stock", href: "/stock", icon: Package, color: "#ffcb00", tile: { bg: "#ffcb00", fg: "#323338" } },
  { label: "Phone AI", href: "/phone-agent", icon: PhoneCall, color: "#007eb5", tile: { bg: "#007eb5", fg: "#fff" } },
];

export const PRIMARY_NAV: NavItem[] = [...WORKSPACE_BOARDS];

export const PIPELINES: NavItem[] = PIPELINE_BOARDS.filter((b) => b.href === "/leads" || b.href === "/jobs");

export const RECORDS: NavItem[] = PIPELINE_BOARDS.filter((b) => !["/leads", "/jobs", "/phone-agent"].includes(b.href));

export const REPORTS: NavLeaf[] = [
  { label: "Historical comparison", href: "/reports/historical", icon: BarChart3 },
  { label: "Ready for install", href: "/reports/install", icon: BarChart3 },
  { label: "Day end", href: "/reports/day-end", icon: BarChart3 },
  { label: "Sales analysis", href: "/reports/sales-analysis", icon: BarChart3 },
  { label: "AR", href: "/reports/ar", icon: BarChart3 },
  { label: "Manufacturer", href: "/reports/manufacturer", icon: BarChart3 },
  { label: "Taxable / non-taxable", href: "/reports/taxable", icon: BarChart3 },
  { label: "Labor", href: "/reports/labor", icon: BarChart3 },
];

export const MAINTENANCE: NavLeaf[] = [
  { label: "Locations", href: "/maintenance/locations", icon: Wrench },
  { label: "Users", href: "/maintenance/users", icon: Wrench },
  { label: "Pricing", href: "/maintenance/pricing", icon: Wrench },
  { label: "Manufacturers", href: "/maintenance/manufacturers", icon: Wrench },
  { label: "Items", href: "/maintenance/items", icon: Wrench },
];

/** @deprecated kept for leftover imports */
export const NAV_ITEMS = [
  ...PRIMARY_NAV,
  ...PIPELINES,
  ...RECORDS,
  { label: "Reports", icon: BarChart3, children: REPORTS },
  { label: "Maintenance", icon: Wrench, children: MAINTENANCE },
];

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavLeaf[];
};
export type NavItemLegacy = NavGroup;
