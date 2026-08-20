"use client";

import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { useActionState } from "react";
import {
  createLocationAction,
  updateLocationAction,
} from "@/app/actions/assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LocationForm({
  action,
  initial,
  submitLabel = "บันทึก",
}: {
  action: (prev: { message?: string }, formData: FormData) => Promise<{ message?: string }>;
  initial?: {
    code?: string | null;
    name?: string;
    note?: string | null;
    active?: boolean;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>รหัส</Label>
        <Input name="code" defaultValue={initial?.code ?? ""} />
      </div>
      <div>
        <Label>ชื่อสถานที่</Label>
        <Input name="name" defaultValue={initial?.name ?? ""} required />
      </div>
      <div>
        <Label>หมายเหตุ</Label>
        <Textarea name="note" defaultValue={initial?.note ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} value="true" />
        Active
      </label>
      {state.message && <p className="text-sm text-green-600">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function LocationTable({
  locations,
}: {
  locations: Array<{
    id: number;
    code: string;
    name: string;
    note: string;
    active: boolean;
    _count: { assets: number };
  }>;
}) {
  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>สถานที่</DataTableHeaderCell>
        <DataTableHeaderCell>รหัส</DataTableHeaderCell>
        <DataTableHeaderCell>สินทรัพย์</DataTableHeaderCell>
        <DataTableHeaderCell>สถานะ</DataTableHeaderCell>
        <DataTableHeaderCell className="text-right">จัดการ</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {locations.length === 0 ? (
          <DataTableEmpty colSpan={5} message="ยังไม่มีข้อมูลสถานที่" />
        ) : (
          locations.map((location) => (
            <DataTableRow key={location.id}>
              <DataTableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{location.name}</p>
                    {location.note && (
                      <p className="max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                        {location.note}
                      </p>
                    )}
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell>
                <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {location.code || "—"}
                </code>
              </DataTableCell>
              <DataTableCell>
                <span className="font-medium">{location._count.assets}</span>
                <span className="ml-1 text-slate-500 dark:text-slate-400">รายการ</span>
              </DataTableCell>
              <DataTableCell>
                <Badge tone={location.active ? "Active" : "Retired"}>
                  {location.active ? "Active" : "Inactive"}
                </Badge>
              </DataTableCell>
              <DataTableCell className="text-right">
                <Link
                  href={`/locations/${location.id}/edit`}
                  className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  แก้ไข
                </Link>
              </DataTableCell>
            </DataTableRow>
          ))
        )}
      </DataTableBody>
    </DataTable>
  );
}

export { createLocationAction, updateLocationAction };
