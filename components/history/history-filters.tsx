"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EVENT_TYPES } from "@/lib/constants";
import th from "@/messages/th.json";

export function HistoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-5">
      <div>
        <Label>S/N</Label>
        <Input
          defaultValue={searchParams.get("serialNo") ?? ""}
          placeholder="ค้นหา S/N"
          onBlur={(e) => update("serialNo", e.target.value)}
        />
      </div>
      <div>
        <Label>ประเภทเหตุการณ์</Label>
        <Select
          defaultValue={searchParams.get("eventType") ?? ""}
          onChange={(e) => update("eventType", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {th.events[type as keyof typeof th.events]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>ตั้งแต่</Label>
        <Input
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div>
        <Label>ถึง</Label>
        <Input
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
      <div className="flex items-end">
        <Link href="/history" className="inline-flex h-10 items-center rounded-md border px-4 text-sm">
          ล้างตัวกรอง
        </Link>
      </div>
    </div>
  );
}
