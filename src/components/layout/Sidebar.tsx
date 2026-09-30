"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeft,
  Search,
  Settings,
  Star,
} from "lucide-react";
import { MAINTENANCE, PIPELINES, PRIMARY_NAV, RECORDS, REPORTS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { actionQueue } from "@/lib/demo/crm";

const STORAGE_KEY = "st-sidebar-collapsed";
const TOGGLE_EVENT = "st-sidebar-toggle";
const GROUPS_KEY = "st-sidebar-groups";
const SHOP_KEY = "st-shop";
const FAV_KEY = "st-favorites";

function subscribeCollapsed(cb: () => void) {
  window.addEventListener(TOGGLE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(TOGGLE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
const readCollapsed = () => localStorage.getItem(STORAGE_KEY) === "true";
function writeCollapsed(value: boolean) {
  localStorage.setItem(STORAGE_KEY, String(value));
  window.dispatchEvent(new Event(TOGGLE_EVENT));
}

const SHOPS = [
  { id: "suburban", label: "Colfax HQ" },
  { id: "south", label: "South Centennial" },
  { id: "both", label: "Both shops" },
] as const;

const DEFAULT_FAVS = [
  { label: "Tom Alvarez", href: "/clients/demo-c-01" },
  { label: "Waiting payment", href: "/jobs?bucket=waiting_payment" },
  { label: "Owen Hart", href: "/leads/demo-l-08" },
];

export function Sidebar({ onCommand }: { onCommand?: () => void }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [shopOpen, setShopOpen] = useState(false);
  const [shop, setShop] = useState<(typeof SHOPS)[number]["id"]>(() => {
    if (typeof window === "undefined") return "both";
    return (localStorage.getItem(SHOP_KEY) as (typeof SHOPS)[number]["id"]) || "both";
  });
  const [groups, setGroups] = useState<{
    pipelines: boolean;
    records: boolean;
    reports: boolean;
    favorites: boolean;
    maintenance: boolean;
  }>(() => {
    const fallback = { pipelines: true, records: true, reports: false, favorites: true, maintenance: false };
    if (typeof window === "undefined") return fallback;
    try {
      const g = localStorage.getItem(GROUPS_KEY);
      return g ? { ...fallback, ...JSON.parse(g) } : fallback;
    } catch {
      return fallback;
    }
  });
  const [favs, setFavs] = useState<{ label: string; href: string }[]>(() => {
    if (typeof window === "undefined") return DEFAULT_FAVS;
    try {
      const f = localStorage.getItem(FAV_KEY);
      return f ? (JSON.parse(f) as { label: string; href: string }[]) : DEFAULT_FAVS;
    } catch {
      return DEFAULT_FAVS;
    }
  });
  const queueCount = actionQueue().filter((a) => a.urgency === "now").length;

  useEffect(() => {
    document.documentElement.dataset.sidebar = collapsed ? "collapsed" : "expanded";
  }, [collapsed]);

  const toggleGroup = (key: keyof typeof groups) => {
    setGroups((g) => {
      const next = { ...g, [key]: !g[key] };
      localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth/pin";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const width = collapsed ? 56 : 240;
  const shopLabel = SHOPS.find((s) => s.id === shop)?.label ?? "Both shops";

  return (
    <aside
      className="fixed top-0 left-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        width,
        background: "var(--color-gray-25)",
        borderRight: "1px solid var(--color-gray-150)",
        transition: "width 150ms var(--ease-attio)",
      }}
      aria-label="Primary navigation"
    >
      <div className="relative shrink-0" style={{ height: 48, padding: collapsed ? "8px" : "8px 10px" }}>
        <button
          type="button"
          onClick={() => setShopOpen((o) => !o)}
          className={cn("w-full flex items-center rounded-md hover:bg-gray-50", collapsed && "justify-center")}
          style={{ height: 32, gap: 8, padding: collapsed ? 0 : "0 6px" }}
        >
          <span
            className="inline-flex items-center justify-center shrink-0 overflow-hidden"
            style={{ width: 24, height: 24, borderRadius: 6, background: "#0E4CA1" }}
          >
            <img src="/suburban-toppers-logo.svg" alt="" width={22} height={8} />
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                Suburban Toppers
              </span>
              <ChevronDown size={14} className="text-gray-500" />
            </>
          )}
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={() => writeCollapsed(true)}
            className="absolute text-gray-500 hover:bg-gray-50 rounded-md"
            style={{ right: 8, top: 10, width: 28, height: 28 }}
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={16} className="mx-auto" />
          </button>
        )}
        {shopOpen && !collapsed && (
          <div
            className="absolute bg-white z-50"
            style={{
              top: 44,
              left: 8,
              right: 8,
              borderRadius: 12,
              border: "1px solid var(--color-gray-150)",
              boxShadow: "var(--shadow-md)",
              padding: 6,
            }}
          >
            {SHOPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setShop(s.id);
                  localStorage.setItem(SHOP_KEY, s.id);
                  setShopOpen(false);
                }}
                className="w-full text-left rounded-md hover:bg-gray-50"
                style={{
                  padding: "8px 10px",
                  fontSize: 13,
                  fontWeight: shop === s.id ? 600 : 500,
                  background: shop === s.id ? "var(--color-gray-50)" : "transparent",
                  border: "none",
                }}
              >
                {s.label}
              </button>
            ))}
            <div style={{ height: 1, background: "var(--color-gray-150)", margin: "4px 0" }} />
            <Link href="/settings" onClick={() => setShopOpen(false)} className="block rounded-md hover:bg-gray-50" style={{ padding: "8px 10px", fontSize: 13 }}>
              Settings
            </Link>
            <button type="button" onClick={handleLogout} className="w-full text-left rounded-md hover:bg-gray-50" style={{ padding: "8px 10px", fontSize: 13, border: "none", background: "transparent" }}>
              Sign out
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0" style={{ padding: collapsed ? "0 8px 8px" : "0 10px 8px" }}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => writeCollapsed(false)}
            className="w-full flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-600"
            style={{ height: 32 }}
            aria-label="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        ) : (
          <div className="flex" style={{ gap: 6 }}>
            <button
              type="button"
              onClick={onCommand}
              className="flex-1 flex items-center bg-white hover:border-gray-300"
              style={{
                height: 32,
                padding: "0 8px",
                gap: 8,
                borderRadius: 8,
                border: "1px solid var(--color-gray-150)",
                fontSize: 13,
                color: "var(--color-gray-600)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <Search size={14} />
              <span className="flex-1 text-left truncate">Quick actions</span>
              <kbd style={{ fontSize: 10, background: "var(--color-gray-50)", border: "1px solid var(--color-gray-150)", borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={onCommand}
              className="flex items-center justify-center bg-white"
              style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--color-gray-150)" }}
              aria-label="Search"
            >
              <span className="text-gray-500" style={{ fontSize: 12, fontWeight: 600 }}>/</span>
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0" style={{ padding: collapsed ? "0 8px" : "0 8px 12px" }}>
        <ul className="flex flex-col" style={{ gap: 2 }}>
          {PRIMARY_NAV.map((item) => (
            <li key={item.href + item.label}>
              <Leaf
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                badge={item.label === "Action queue" ? queueCount : undefined}
              />
            </li>
          ))}
        </ul>

        <Group
          title="Pipelines"
          open={groups.pipelines}
          onToggle={() => toggleGroup("pipelines")}
          collapsed={collapsed}
        >
          {PIPELINES.map((item) => (
            <Leaf key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </Group>

        <Group title="Records" open={groups.records} onToggle={() => toggleGroup("records")} collapsed={collapsed}>
          {RECORDS.map((item) => (
            <Leaf key={item.label} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </Group>

        <Group title="Reports" open={groups.reports} onToggle={() => toggleGroup("reports")} collapsed={collapsed}>
          {REPORTS.map((r) => (
            <SubLink key={r.href} href={r.href} label={r.label} pathname={pathname} collapsed={collapsed} />
          ))}
        </Group>

        <Group title="Favorites" open={groups.favorites} onToggle={() => toggleGroup("favorites")} collapsed={collapsed}>
          {favs.map((f) => (
            <SubLink
              key={f.href}
              href={f.href}
              label={f.label}
              pathname={pathname}
              collapsed={collapsed}
              icon={<Star size={12} className="text-yellow-700" />}
              onRemove={() => {
                const next = favs.filter((x) => x.href !== f.href);
                setFavs(next);
                localStorage.setItem(FAV_KEY, JSON.stringify(next));
              }}
            />
          ))}
        </Group>

        <Group title="Maintenance" open={groups.maintenance} onToggle={() => toggleGroup("maintenance")} collapsed={collapsed}>
          {MAINTENANCE.map((r) => (
            <SubLink key={r.href} href={r.href} label={r.label} pathname={pathname} collapsed={collapsed} />
          ))}
        </Group>
      </nav>

      <div className="shrink-0" style={{ padding: collapsed ? 8 : "10px 10px 12px", borderTop: "1px solid var(--color-gray-150)" }}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "")} style={{ gap: 8 }}>
          <span
            className="rounded-full inline-flex items-center justify-center shrink-0 font-medium"
            style={{ width: 28, height: 28, background: "var(--color-brand-100)", color: "var(--color-brand-700)", fontSize: 11 }}
          >
            ZV
          </span>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>Zack Vivas</div>
                <div className="truncate text-gray-500" style={{ fontSize: 11 }}>{shopLabel} · Admin</div>
              </div>
              <Link href="/settings" className="text-gray-500 hover:bg-gray-50 rounded-md" style={{ width: 28, height: 28, display: "grid", placeItems: "center" }} aria-label="Settings">
                <Settings size={15} />
              </Link>
              <button type="button" onClick={handleLogout} className="text-gray-500 hover:bg-gray-50 rounded-md" style={{ width: 28, height: 28, border: "none", background: "transparent" }} aria-label="Log out">
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function Leaf({
  item,
  pathname,
  collapsed,
  badge,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  badge?: number;
}) {
  const Icon = item.icon;
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center rounded-md",
        active ? "bg-gray-100 text-ink" : "text-gray-700 hover:bg-gray-50"
      )}
      style={{
        height: 32,
        padding: collapsed ? 0 : "0 8px",
        justifyContent: collapsed ? "center" : undefined,
        gap: 8,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
      }}
    >
      {item.tile ? (
        <span
          className="inline-flex items-center justify-center shrink-0"
          style={{ width: 16, height: 16, borderRadius: 4, background: item.tile.bg, color: item.tile.fg }}
        >
          <Icon size={11} strokeWidth={2.2} />
        </span>
      ) : (
        <Icon size={16} strokeWidth={1.75} className={active ? "text-ink" : "text-gray-500"} />
      )}
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && badge ? (
        <span
          className="inline-flex items-center justify-center"
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: "var(--color-danger-bg)",
            color: "var(--color-danger-fg)",
            fontSize: 10,
            fontWeight: 600,
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Group({
  title,
  open,
  onToggle,
  collapsed,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  if (collapsed) {
    return <div className="flex flex-col" style={{ gap: 2, marginTop: 8 }}>{children}</div>;
  }
  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center group"
        style={{
          height: 24,
          padding: "0 8px",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-gray-400)",
          background: "transparent",
          border: "none",
          textTransform: "none",
        }}
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronRight
          size={12}
          className="opacity-0 group-hover:opacity-100"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms var(--ease-attio)" }}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 150ms var(--ease-attio)",
        }}
      >
        <div className="overflow-hidden flex flex-col" style={{ gap: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SubLink({
  href,
  label,
  pathname,
  collapsed,
  icon,
  onRemove,
}: {
  href: string;
  label: string;
  pathname: string;
  collapsed: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
}) {
  const active = pathname === href || pathname.startsWith(href.split("?")[0] + "/") && !href.includes("?");
  if (collapsed) return null;
  return (
    <div className="relative group flex items-center">
      <span aria-hidden style={{ width: 12, marginLeft: 14, borderLeft: "1px solid var(--color-gray-150)", alignSelf: "stretch" }} />
      <Link
        href={href}
        className={cn("flex-1 flex items-center rounded-md truncate", active ? "text-ink bg-gray-50" : "text-gray-600 hover:bg-gray-50")}
        style={{ height: 28, padding: "0 8px", fontSize: 13, gap: 6, fontWeight: active ? 600 : 500 }}
      >
        {icon}
        <span className="truncate">{label}</span>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-gray-400"
          style={{ position: "absolute", right: 4, border: "none", background: "transparent", fontSize: 12 }}
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
