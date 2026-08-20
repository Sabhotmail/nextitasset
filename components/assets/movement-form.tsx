"use client";

import { useActionState } from "react";
import Link from "next/link";
import { moveAssetAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ASSET_STATUSES, MOVEMENT_REASONS } from "@/lib/constants";

type Option = { id: number; label: string };

export function MovementForm({
  assetId,
  serialNo,
  employees,
  locations,
}: {
  assetId: number;
  serialNo: string;
  employees: Option[];
  locations: Option[];
}) {
  const [state, formAction, pending] = useActionState(
    moveAssetAction.bind(null, assetId),
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>โอนย้าย / มอบหมาย — {serialNo}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Reason</Label>
            <Select name="reason" defaultValue="Assign">
              {MOVEMENT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue="Active">
              {ASSET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ผู้ถือครอง</Label>
            <Select name="assignedToId" defaultValue="">
              <option value="">—</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>สถานที่</Label>
            <Select name="locationId" defaultValue="">
              <option value="">—</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>หมายเหตุ</Label>
            <Textarea name="note" />
          </div>
          {state.message && <p className="md:col-span-2 text-sm text-red-600">{state.message}</p>}
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึกการโอนย้าย"}
            </Button>
            <Link
              href={`/assets/${assetId}`}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
