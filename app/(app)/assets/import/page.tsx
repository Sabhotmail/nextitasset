"use client";

import { useActionState } from "react";
import { importAssetsAction } from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function ImportAssetsPage() {
  const [state, formAction, pending] = useActionState(importAssetsAction, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">นำเข้า Excel</h1>
        <p className="text-slate-500">Preview-less import พร้อม duplicate detection จาก S/N</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ไฟล์ Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label>โหมด</Label>
              <Select name="mode" defaultValue="upsert">
                <option value="create">สร้างใหม่เท่านั้น</option>
                <option value="upsert">สร้าง/อัปเดต (แนะนำ)</option>
              </Select>
            </div>
            <div>
              <Label>ไฟล์</Label>
              <Input name="file" type="file" accept=".xlsx,.xls" required />
            </div>
            <p className="text-sm text-slate-500">
              คอลัมน์ที่รองรับ: type, status, brand, model, s/n, mac, os, ms office, asset_no,
              email, location, emp_code
            </p>
            {state.message && (
              <p className={`text-sm ${state.message.includes("สำเร็จ") ? "text-green-600" : "text-red-600"}`}>
                {state.message}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังนำเข้า..." : "นำเข้า"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
