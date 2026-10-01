"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { ToastProvider } from "./Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [cmd, setCmd] = useState(false);
  return (
    <ToastProvider>
      <div
        className="md:hidden sticky top-0 z-30 flex items-center"
        style={{ height: 48, padding: "0 12px", gap: 8, background: "#0E4CA1", color: "white" }}
      >
        <button
          type="button"
          className="rounded-md"
          style={{ width: 32, height: 32, border: "none", background: "transparent", color: "white" }}
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
        <span style={{ fontSize: 14, fontWeight: 700 }}>Suburban Toppers</span>
        <span
          className="ml-auto"
          style={{ fontSize: 11, fontWeight: 700, background: "#FFD504", color: "#0E4CA1", borderRadius: 6, padding: "2px 8px" }}
        >
          Demo
        </span>
      </div>
      <Sidebar onCommand={() => setCmd(true)} />
      <CommandPalette open={cmd} onOpenChange={setCmd} />
      <button
        type="button"
        aria-label="Close menu"
        className="st-nav-backdrop md:hidden fixed inset-0 z-40"
        style={{ background: "rgba(28,31,59,0.4)", border: "none" }}
        onClick={() => {
          document.documentElement.dataset.sidebar = "collapsed";
          localStorage.setItem("st-sidebar-collapsed", "true");
          window.dispatchEvent(new Event("st-sidebar-toggle"));
        }}
      />
      <main className="min-h-screen bg-canvas transition-[padding] duration-150 pl-[260px] [[data-sidebar=collapsed]_&]:pl-[64px] max-md:pl-0">
        <div className="hidden md:block">
          <TopBar onCommand={() => setCmd(true)} />
        </div>
        {children}
      </main>
    </ToastProvider>
  );
}
