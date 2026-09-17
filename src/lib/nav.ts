/**
 * Centralized navigation config for the CRM sidebar.
 */

import {
  LayoutDashboard,
  Users,
  Sparkles,
  Package,
  Calendar,
  BarChart3,
  Wrench,
  ChevronRight,
  ClipboardList,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

export type NavLeaf = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavLeaf[];
  shortLabel?: string;
};

export type NavItem = NavGroup;

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Jobs", icon: ClipboardList, href: "/jobs" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Leads & Outreach", icon: Sparkles, href: "/leads" },
  { label: "Phone AI", icon: PhoneCall, href: "/phone-agent" },
  { label: "Stock", icon: Package, href: "/stock" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Historical Comparison", href: "/reports/historical", icon: ChevronRight },
      { label: "Ready for Install", href: "/reports/install", icon: ChevronRight },
      { label: "Day End", href: "/reports/day-end", icon: ChevronRight },
      { label: "Sales Analysis", href: "/reports/sales-analysis", icon: ChevronRight },
      { label: "AR", href: "/reports/ar", icon: ChevronRight },
      { label: "Manufacturer", href: "/reports/manufacturer", icon: ChevronRight },
      { label: "Taxable / Non-Taxable", href: "/reports/taxable", icon: ChevronRight },
      { label: "Labor", href: "/reports/labor", icon: ChevronRight },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    children: [
      { label: "Locations", href: "/maintenance/locations", icon: ChevronRight },
      { label: "Users", href: "/maintenance/users", icon: ChevronRight },
      { label: "Pricing", href: "/maintenance/pricing", icon: ChevronRight },
      { label: "Manufacturers", href: "/maintenance/manufacturers", icon: ChevronRight },
      { label: "Items", href: "/maintenance/items", icon: ChevronRight },
    ],
  },
];
