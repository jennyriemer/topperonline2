"use client";

/**
 * Tabs — a small, URL-driven tab strip primitive.
 *
 * Used in: Stock page (3 tabs: In House / Trade-In / Inventory),
 * any future page that needs mutually-exclusive content panels.
 *
 * Design (per DESIGN.md):
 *   - Tab strip below the page header
 *   - Active tab: Carbon text + bold + 2px Signal Orange underline (4px from text)
 *   - Inactive tab: Graphite text, no underline, hover fades to Carbon
 *   - 24px gap between tabs
 *   - Underline animates with a 150ms ease-in-out transition
 *
 * URL-driven: the active tab is read from `?tab=<value>` in the URL,
 * so browser back/forward works and the URL is shareable. Falls back
 * to the first tab in `tabs` if no param is set.
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  /** Unique value used in the URL (e.g. "in_house") */
  value: string;
  /** Display label (e.g. "In House Orders") */
  label: string;
  /** Optional count badge shown after the label (e.g. "12") */
  count?: number;
  /** Content to render when this tab is active */
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  /** Optional URL param override (default: "tab") */
  paramName?: string;
  /** Optional className for the outer wrapper */
  className?: string;
}

export function Tabs({ tabs, paramName = "tab", className }: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeValue = searchParams.get(paramName) ?? tabs[0]?.value;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.value === activeValue));
  const activeTab = tabs[activeIndex] ?? tabs[0];

  const setActive = (value: string) => {
    if (value === activeValue) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={className}>
      {/* === Tab strip === */}
      <div
        className="flex items-center"
        style={{
          gap: "24px",
          borderBottom: "1px solid var(--color-chalk)",
          marginBottom: "24px",
        }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.value}`}
              onClick={() => setActive(tab.value)}
              className={cn(
                "relative flex items-center transition-colors",
                isActive ? "text-carbon" : "text-graphite hover:text-carbon"
              )}
              style={{
                padding: "12px 4px 14px 4px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                gap: "8px",
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "rounded-full",
                    isActive ? "bg-carbon text-paper" : "bg-fog text-graphite"
                  )}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "1px 8px",
                    minWidth: "20px",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  {tab.count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="bg-brand-600"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "-1px",
                    height: "2px",
                    borderRadius: "1px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* === Active tab panel === */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab.value}`}
        aria-labelledby={`tab-${activeTab.value}`}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
