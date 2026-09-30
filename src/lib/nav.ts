import {
  Home,
  Bell,
  CheckSquare,
  Calendar,
  PhoneCall,
  Users,
  Package,
  FileText,
  Truck,
  Factory,
  Sparkles,
  ClipboardList,
  BarChart3,
  Wrench,
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
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Action queue", href: "/dashboard#queue", icon: Bell },
  { label: "Tasks", href: "/dashboard#queue", icon: CheckSquare },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Phone AI", href: "/phone-agent", icon: PhoneCall },
];

export const PIPELINES: NavItem[] = [
  { label: "Leads & Outreach", href: "/leads", icon: Sparkles, tile: { bg: "#FC811F", fg: "#fff" } },
  { label: "Jobs board", href: "/jobs", icon: ClipboardList, tile: { bg: "#0E4CA1", fg: "#fff" } },
];

export const RECORDS: NavItem[] = [
  { label: "Clients", href: "/clients", icon: Users, tile: { bg: "#0E4CA1", fg: "#fff" } },
  { label: "Vehicles", href: "/clients", icon: Truck, tile: { bg: "#9B69FF", fg: "#fff" } },
  { label: "Stock", href: "/stock", icon: Package, tile: { bg: "#FFD504", fg: "#1C1D1F" } },
  { label: "Invoices", href: "/jobs", icon: FileText, tile: { bg: "#03B071", fg: "#fff" } },
  { label: "Manufacturers", href: "/maintenance/manufacturers", icon: Factory, tile: { bg: "#00B5E6", fg: "#fff" } },
];

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

/** @deprecated kept for any leftover imports */
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
