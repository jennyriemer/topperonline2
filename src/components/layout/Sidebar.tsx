"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, LogOut, PanelLeft, Search, Settings, Star } from "lucide-react";
import { MAINTENANCE, PIPELINE_BOARDS, REPORTS, WORKSPACE_BOARDS, type NavItem } from "@/lib/nav";
import { BrandLogo } from "@/components/brand/Logo";
import { actionQueue } from "@/lib/demo/crm";
import { cn } from "@/lib/utils";

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
const readCollapsed = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored != null) return stored === "true";
  return window.innerWidth < 768;
};
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
  { label: "Owen Hart", href: "/leads/demo-l-06" },
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
    boards: boolean;
    reports: boolean;
    favorites: boolean;
    maintenance: boolean;
  }>(() => {
    const fallback = { boards: true, reports: false, favorites: true, maintenance: false };
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

  const width = collapsed ? 64 : 260;
  const shopLabel = SHOPS.find((s) => s.id === shop)?.label ?? "Both shops";

  return (
    <aside
      className="st-sidebar fixed top-0 left-0 h-screen z-40 flex flex-col overflow-hidden max-md:z-50"
      style={{
        width,
        background: "#0E4CA1",
        color: "white",
        transition: "width 150ms var(--ease-monday)",
      }}
      aria-label="Workspace"
    >
      <div className="relative shrink-0" style={{ padding: collapsed ? "10px 8px" : "10px 12px 8px" }}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setShopOpen((o) => !o)}
            className="w-full flex items-center justify-center rounded-md hover:bg-white/10"
            style={{ minHeight: 40, border: "none", background: "transparent", color: "white" }}
            aria-label="Suburban Toppers workspace"
          >
            <BrandLogo width={40} compact />
          </button>
        ) : (
          <>
            <div className="flex items-start" style={{ gap: 8 }}>
              <BrandLogo width={152} />
              <button
                type="button"
                onClick={() => writeCollapsed(true)}
                className="text-white/70 hover:bg-white/10 rounded-md shrink-0"
                style={{ width: 28, height: 28, border: "none", background: "transparent", marginLeft: "auto" }}
                aria-label="Collapse sidebar"
              >
                <PanelLeft size={16} className="mx-auto" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShopOpen((o) => !o)}
              className="w-full flex items-center rounded-md hover:bg-white/10"
              style={{
                marginTop: 8,
                height: 28,
                padding: "0 6px",
                gap: 6,
                border: "none",
                background: "transparent",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span className="flex-1 text-left truncate">{shopLabel}</span>
              <ChevronDown size={14} style={{ opacity: 0.8 }} />
            </button>
          </>
        )}
        {shopOpen && !collapsed && (
          <div
            className="absolute z-50"
            style={{
              top: 88,
              left: 8,
              right: 8,
              borderRadius: 8,
              background: "white",
              color: "#323338",
              boxShadow: "var(--shadow-lg)",
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
                  fontWeight: shop === s.id ? 700 : 500,
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

      <div className="shrink-0" style={{ padding: collapsed ? "0 8px 8px" : "0 12px 8px" }}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => writeCollapsed(false)}
            className="w-full flex items-center justify-center rounded-md hover:bg-white/10 text-white"
            style={{ height: 32, border: "none", background: "transparent" }}
            aria-label="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCommand}
            className="w-full flex items-center"
            style={{
              height: 32,
              padding: "0 10px",
              gap: 8,
              borderRadius: 8,
              border: "none",
              background: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
            }}
          >
            <Search size={14} />
            <span className="flex-1 text-left truncate">Search</span>
            <kbd style={{ fontSize: 10, background: "rgba(0,0,0,0.15)", borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0" style={{ padding: collapsed ? "0 8px" : "0 10px 12px" }}>
        <ul className="flex flex-col" style={{ gap: 2 }}>
          {WORKSPACE_BOARDS.map((item) => (
            <li key={item.label}>
              <Leaf item={item} pathname={pathname} collapsed={collapsed} badge={item.label === "Action queue" ? queueCount : undefined} />
            </li>
          ))}
        </ul>

        <Section title="Boards" open={groups.boards} onToggle={() => toggleGroup("boards")} collapsed={collapsed}>
          {PIPELINE_BOARDS.map((item) => (
            <Leaf key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </Section>

        <Section title="Favorites" open={groups.favorites} onToggle={() => toggleGroup("favorites")} collapsed={collapsed}>
          {favs.map((f) => (
            <SubLink
              key={f.href}
              href={f.href}
              label={f.label}
              pathname={pathname}
              collapsed={collapsed}
              icon={<Star size={12} color="#FFD504" />}
              onRemove={() => {
                const next = favs.filter((x) => x.href !== f.href);
                setFavs(next);
                localStorage.setItem(FAV_KEY, JSON.stringify(next));
              }}
            />
          ))}
        </Section>

        <Section title="Reports" open={groups.reports} onToggle={() => toggleGroup("reports")} collapsed={collapsed}>
          {REPORTS.map((r) => (
            <SubLink key={r.href} href={r.href} label={r.label} pathname={pathname} collapsed={collapsed} />
          ))}
        </Section>

        <Section title="Maintenance" open={groups.maintenance} onToggle={() => toggleGroup("maintenance")} collapsed={collapsed}>
          {MAINTENANCE.map((r) => (
            <SubLink key={r.href} href={r.href} label={r.label} pathname={pathname} collapsed={collapsed} />
          ))}
        </Section>
      </nav>

      <div className="shrink-0" style={{ padding: collapsed ? 8 : "10px 12px 12px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "")} style={{ gap: 8 }}>
          <span
            className="rounded-full inline-flex items-center justify-center shrink-0 font-medium"
            style={{ width: 28, height: 28, background: "#FFD504", color: "#0E4CA1", fontSize: 11, fontWeight: 700 }}
          >
            ZV
          </span>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="truncate" style={{ fontSize: 13, fontWeight: 700 }}>
                  Zack Vivas
                </div>
                <div className="truncate" style={{ fontSize: 11, opacity: 0.75 }}>
                  Admin
                </div>
              </div>
              <Link href="/settings" className="hover:bg-white/10 rounded-md" style={{ width: 28, height: 28, display: "grid", placeItems: "center", color: "white" }} aria-label="Settings">
                <Settings size={15} />
              </Link>
              <button type="button" onClick={handleLogout} className="hover:bg-white/10 rounded-md" style={{ width: 28, height: 28, border: "none", background: "transparent", color: "white" }} aria-label="Log out">
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
  const lit =
    item.label === "Home"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?");

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className="relative flex items-center rounded-md"
      style={{
        height: 32,
        padding: collapsed ? 0 : "0 8px",
        justifyContent: collapsed ? "center" : undefined,
        gap: 8,
        fontSize: 13,
        fontWeight: lit ? 700 : 500,
        background: lit ? "rgba(255,213,4,0.18)" : "transparent",
        color: "white",
      }}
    >
      {item.color ? (
        <span className="inline-flex items-center justify-center shrink-0" style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
      ) : (
        <Icon size={16} />
      )}
      {!collapsed && !item.color && <Icon size={16} className="shrink-0" />}
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && badge ? (
        <span
          className="inline-flex items-center justify-center"
          style={{
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: "#e2445c",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function Section({
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
    return (
      <div className="flex flex-col" style={{ gap: 2, marginTop: 8 }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ marginTop: 14 }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center"
        style={{
          height: 24,
          padding: "0 8px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.65)",
          background: "transparent",
          border: "none",
        }}
      >
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown size={12} style={{ transform: open ? undefined : "rotate(-90deg)", transition: "transform 120ms" }} />
      </button>
      {open && <div className="flex flex-col" style={{ gap: 1 }}>{children}</div>}
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
  const path = href.split("?")[0];
  const active = pathname === path || pathname.startsWith(path + "/");
  if (collapsed) return null;
  return (
    <div className="relative group flex items-center">
      <Link
        href={href}
        className="flex-1 flex items-center rounded-md truncate"
        style={{
          height: 28,
          padding: "0 8px 0 18px",
          fontSize: 13,
          gap: 6,
          fontWeight: active ? 700 : 500,
          background: active ? "rgba(255,213,4,0.18)" : "transparent",
          color: "white",
        }}
      >
        {icon}
        <span className="truncate">{label}</span>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100"
          style={{ position: "absolute", right: 4, border: "none", background: "transparent", fontSize: 12, color: "white" }}
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
