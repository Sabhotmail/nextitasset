"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileUp,
  History,
  LayoutDashboard,
  MapPin,
  PanelLeftOpen,
  Printer,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const sections = [
  {
    title: "หลัก",
    links: [
      { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
      { href: "/assets", label: "สินทรัพย์", icon: Box },
      { href: "/history", label: "ประวัติ", icon: History },
    ],
  },
  {
    title: "Master Data",
    links: [
      { href: "/employees", label: "พนักงาน", icon: Users },
      { href: "/locations", label: "สถานที่", icon: MapPin },
    ],
  },
  {
    title: "รายงาน",
    links: [
      { href: "/reports/location", label: "ตามสถานที่", icon: MapPin },
      { href: "/reports/maintenance", label: "ค่าบำรุงรักษา", icon: Wrench },
      { href: "/reports/aging", label: "อายุสินทรัพย์", icon: Clock3 },
    ],
  },
  {
    title: "เครื่องมือ",
    links: [
      { href: "/assets/new", label: "เพิ่มสินทรัพย์", icon: Box },
      { href: "/assets/import", label: "นำเข้า Excel", icon: FileUp },
      { href: "/assets/labels", label: "ป้าย QR", icon: Printer },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mounted, toggleCollapsed, expand } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={expand}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="ขยายเมนู"
            title="ขยายเมนู"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900 dark:text-white">IT Asset</span>
            </Link>
            {mounted && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="ย่อเมนู"
                title="ย่อเมนู"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const active =
                  pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={collapsed ? link.label : undefined}
                    className={cn(
                      "flex items-center rounded-lg py-2 text-sm transition-colors",
                      collapsed ? "justify-center px-2" : "gap-3 px-3",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{link.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {collapsed && mounted && (
        <div className="shrink-0 border-t border-slate-200 p-2 dark:border-slate-800">
          <button
            type="button"
            onClick={expand}
            className="flex w-full items-center justify-center gap-1 rounded-lg p-2 text-sm text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="ขยายเมนู"
            title="ขยายเมนู"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
