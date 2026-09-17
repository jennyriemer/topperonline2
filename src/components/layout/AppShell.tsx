"use client";

/**
 * AppShell — the fixed two-column layout used by every page in the CRM.
 *
 * Renders the collapsible Sidebar on the left, and a scrollable main content
 * area on the right. The main content area reads the sidebar's collapsed
 * state from the `data-sidebar` attribute on <html> and adjusts its
 * left offset accordingly (240px expanded, 60px collapsed).
 */

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen bg-canvas transition-[padding] duration-200 ease-in-out pl-[240px] [[data-sidebar=collapsed]_&]:pl-[60px]">
        <TopBar />
        {children}
      </main>
    </>
  );
}
