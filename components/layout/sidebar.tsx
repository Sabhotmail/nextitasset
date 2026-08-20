"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  Clock3,
  FileUp,
  History,
  LayoutDashboard,
  MapPin,
  Printer,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
        <span className="text-lg font-semibold">IT Asset</span>
      </div>
      <nav className="space-y-6 p-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {section.title}
            </p>
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
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
