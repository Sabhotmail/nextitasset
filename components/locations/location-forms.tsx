"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createLocationAction,
  updateLocationAction,
} from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
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
    <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-950">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3 text-left">รหัส</th>
            <th className="px-4 py-3 text-left">ชื่อ</th>
            <th className="px-4 py-3 text-left">สินทรัพย์</th>
            <th className="px-4 py-3 text-left">สถานะ</th>
            <th className="px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id} className="border-t">
              <td className="px-4 py-3">{location.code}</td>
              <td className="px-4 py-3">{location.name}</td>
              <td className="px-4 py-3">{location._count.assets}</td>
              <td className="px-4 py-3">{location.active ? "Active" : "Inactive"}</td>
              <td className="px-4 py-3">
                <Link href={`/locations/${location.id}/edit`} className="text-blue-600 hover:underline">
                  แก้ไข
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { createLocationAction, updateLocationAction };
