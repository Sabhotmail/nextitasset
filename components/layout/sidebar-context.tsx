"use client";

import { createContext, useContext, useEffect, useState } from "react";

type SidebarContextValue = {
  collapsed: boolean;
  mounted: boolean;
  toggleCollapsed: () => void;
  expand: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  function setCollapsedState(next: boolean) {
    localStorage.setItem("sidebar-collapsed", String(next));
    setCollapsed(next);
  }

  function toggleCollapsed() {
    setCollapsedState(!collapsed);
  }

  function expand() {
    setCollapsedState(false);
  }

  return (
    <SidebarContext.Provider value={{ collapsed, mounted, toggleCollapsed, expand }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
