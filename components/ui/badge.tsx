import * as React from "react";
import { cn } from "./utils";

const colors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Spare: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Repairing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Broken: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Retired: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  Disposed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Assign: "bg-indigo-100 text-indigo-800",
  Transfer: "bg-purple-100 text-purple-800",
  Return: "bg-teal-100 text-teal-800",
  Dispose: "bg-red-100 text-red-800",
  Update: "bg-slate-100 text-slate-800",
};

export function Badge({
  children,
  className,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone ? colors[tone] : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
