import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(num);
}

export function employeeName(employee: {
  title?: string | null;
  firstName: string;
  lastName: string;
  empCode?: string;
}) {
  const name = employee.title
    ? `${employee.title}${employee.firstName} ${employee.lastName}`
    : `${employee.firstName} ${employee.lastName}`;
  return employee.empCode ? `${name} (${employee.empCode})` : name;
}
