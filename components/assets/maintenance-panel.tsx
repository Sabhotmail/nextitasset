"use client";

import { useActionState } from "react";
import { createMaintenanceAction, deleteMaintenanceAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";

type Maintenance = {
  id: number;
  servicedAt: Date;
  subject: string;
  detail: string;
  cost: { toString(): string } | null;
  actor: { name: string } | null;
};

export function MaintenancePanel({
  assetId,
  maintenances,
}: {
  assetId: number;
  maintenances: Maintenance[];
}) {
  const [state, formAction, pending] = useActionState(
    createMaintenanceAction.bind(null, assetId),
    {},
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มการบำรุงรักษา</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label>วันที่</Label>
              <Input name="servicedAt" type="date" required />
            </div>
            <div>
              <Label>หัวข้อ</Label>
              <Input name="subject" required />
            </div>
            <div>
              <Label>รายละเอียด</Label>
              <Textarea name="detail" />
            </div>
            <div>
              <Label>ค่าใช้จ่าย</Label>
              <Input name="cost" type="number" step="0.01" />
            </div>
            {state.message && <p className="text-sm text-green-600">{state.message}</p>}
            <Button type="submit" disabled={pending}>
              บันทึก
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการบำรุงรักษา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {maintenances.length === 0 && <p className="text-slate-500">ยังไม่มีรายการ</p>}
          {maintenances.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.subject}</p>
                  <p className="text-sm text-slate-500">{formatDate(item.servicedAt)}</p>
                  <p className="mt-2 text-sm">{item.detail || "—"}</p>
                  <p className="mt-2 text-sm">
                    ค่าใช้จ่าย: {formatCurrency(item.cost?.toString())} · โดย:{" "}
                    {item.actor?.name ?? "—"}
                  </p>
                </div>
                <form action={deleteMaintenanceAction.bind(null, assetId, item.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    ลบ
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
