"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import th from "@/messages/th.json";

type SnapshotResult = Record<string, string | number | null>;

export function SnapshotViewer({
  assetId,
  currentSerialNo,
}: {
  assetId: number;
  currentSerialNo: string;
}) {
  const [asOf, setAsOf] = useState("");
  const [snapshot, setSnapshot] = useState<SnapshotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadSnapshot() {
    if (!asOf) return;
    startTransition(async () => {
      setError(null);
      const response = await fetch(`/api/assets/${assetId}/snapshot?asOf=${asOf}`);
      const data = await response.json();
      if (!response.ok) {
        setSnapshot(null);
        setError(data.message ?? "โหลด snapshot ไม่สำเร็จ");
        return;
      }
      setSnapshot(data.snapshot);
    });
  }

  const fieldLabels = th.fields as Record<string, string>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ดูสถานะย้อนหลัง (Point-in-time)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          เลือกวันที่เพื่อดูว่า {currentSerialNo} มีข้อมูลอย่างไร ณ เวลานั้น
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>ณ วันที่</Label>
            <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          </div>
          <Button onClick={loadSnapshot} disabled={pending || !asOf}>
            {pending ? "กำลังโหลด..." : "ดู snapshot"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {snapshot && (
          <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
            {Object.entries(snapshot).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-slate-500">{fieldLabels[key] ?? key}</p>
                <p className="font-medium">{value === null || value === "" ? "—" : String(value)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
