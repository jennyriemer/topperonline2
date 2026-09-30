"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "./Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [cmd, setCmd] = useState(false);
  return (
    <ToastProvider>
      <div className="md:hidden sticky top-0 z-30 flex items-center bg-white" style={{ height: 48, padding: "0 12px", borderBottom: "1px solid var(--color-gray-150)", gap: 8 }}>
        <button
          type="button"
          className="rounded-md hover:bg-gray-50"
          style={{ width: 32, height: 32, border: "none", background: "transparent" }}
          aria-label="Open menu"
          onClick={() => {
            const collapsed = document.documentElement.dataset.sidebar === "collapsed";
            document.documentElement.dataset.sidebar = collapsed ? "expanded" : "collapsed";
            localStorage.setItem("st-sidebar-collapsed", String(!collapsed));
            window.dispatchEvent(new Event("st-sidebar-toggle"));
          }}
        >
          <Menu size={18} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Suburban Toppers</span>
        <span className="ml-auto" style={{ fontSize: 11, fontWeight: 500, background: "var(--color-yellow-100)", color: "var(--color-yellow-700)", borderRadius: 6, padding: "2px 8px" }}>
          Demo data
        </span>
      </div>
      <Sidebar onCommand={() => setCmd(true)} />
      <CommandPalette open={cmd} onOpenChange={setCmd} />
      <main className="min-h-screen bg-canvas transition-[padding] duration-150 pl-[240px] [[data-sidebar=collapsed]_&]:pl-[56px] max-md:pl-0">
        {children}
      </main>
    </ToastProvider>
  );
}
