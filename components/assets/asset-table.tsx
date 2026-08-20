"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { bulkAction } from "@/app/actions/assets";
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
import { Select } from "@/components/ui/select";
import { ASSET_STATUSES, ASSET_TYPES } from "@/lib/constants";
import { employeeName, formatDate } from "@/lib/utils";

type AssetRow = {
  id: number;
  serialNo: string;
  type: string;
  status: string;
  brand: string | null;
  model: string | null;
  updatedAt: Date;
  assignedTo: {
    firstName: string;
    lastName: string;
    empCode: string;
    title?: string | null;
  } | null;
  location: { name: string } | null;
};

export function AssetFilters({ locations }: { locations: { id: number; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/assets?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-4">
      <div>
        <Label>ค้นหา</Label>
        <Input
          placeholder="S/N, Brand, Model"
          defaultValue={searchParams.get("q") ?? ""}
          onBlur={(e) => update("q", e.target.value)}
        />
      </div>
      <div>
        <Label>Type</Label>
        <Select
          defaultValue={searchParams.get("type") ?? ""}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Status</Label>
        <Select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>สถานที่</Label>
        <Select
          defaultValue={searchParams.get("locationId") ?? ""}
          onChange={(e) => update("locationId", e.target.value)}
        >
          <option value="">ทั้งหมด</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function AssetTable({
  assets,
  locations,
}: {
  assets: AssetRow[];
  locations: { id: number; name: string }[];
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function submitBulk(formData: FormData) {
    selected.forEach((id) => formData.append("assetIds", String(id)));
    const result = await bulkAction({}, formData);
    setMessage(result.message ?? null);
    setSelected([]);
  }

  return (
    <div className="space-y-4">
      <form action={submitBulk} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div>
          <Label>Bulk Action</Label>
          <Select name="action" defaultValue="status">
            <option value="status">เปลี่ยน Status</option>
            <option value="dispose">จำหน่าย</option>
            <option value="clear_assignee">ล้างผู้ถือครอง</option>
            <option value="move_location">ย้ายสถานที่</option>
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
          <Label>สถานที่</Label>
          <Select name="locationId" defaultValue="">
            <option value="">—</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>หมายเหตุ</Label>
          <Input name="note" placeholder="optional" />
        </div>
        <Button type="submit" disabled={selected.length === 0}>
          ดำเนินการ ({selected.length})
        </Button>
      </form>
      {message && <p className="text-sm text-green-600">{message}</p>}

      <DataTable>
        <DataTableHead>
          <DataTableHeaderCell className="w-12">เลือก</DataTableHeaderCell>
          <DataTableHeaderCell>S/N</DataTableHeaderCell>
          <DataTableHeaderCell>Type</DataTableHeaderCell>
          <DataTableHeaderCell>Brand / Model</DataTableHeaderCell>
          <DataTableHeaderCell>Status</DataTableHeaderCell>
          <DataTableHeaderCell>ผู้ถือครอง</DataTableHeaderCell>
          <DataTableHeaderCell>สถานที่</DataTableHeaderCell>
          <DataTableHeaderCell>อัปเดต</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {assets.length === 0 ? (
            <DataTableEmpty colSpan={8} message="ไม่พบสินทรัพย์" />
          ) : (
            assets.map((asset) => (
              <DataTableRow key={asset.id}>
                <DataTableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(asset.id)}
                    onChange={() => toggle(asset.id)}
                    className="rounded border-slate-300"
                  />
                </DataTableCell>
                <DataTableCell>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                      {asset.serialNo}
                    </code>
                  </Link>
                </DataTableCell>
                <DataTableCell>{asset.type}</DataTableCell>
                <DataTableCell>
                  {[asset.brand, asset.model].filter(Boolean).join(" ") || "—"}
                </DataTableCell>
                <DataTableCell>
                  <Badge tone={asset.status}>{asset.status}</Badge>
                </DataTableCell>
                <DataTableCell>
                  {asset.assignedTo ? employeeName(asset.assignedTo) : "—"}
                </DataTableCell>
                <DataTableCell>{asset.location?.name ?? "—"}</DataTableCell>
                <DataTableCell className="text-slate-500 dark:text-slate-400">
                  {formatDate(asset.updatedAt)}
                </DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  searchParams,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        หน้า {page} จาก {totalPages} ({total} รายการ)
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={`${basePath}?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page - 1) }).toString()}`}
            className="rounded-md border px-3 py-1 text-sm"
          >
            ก่อนหน้า
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={`${basePath}?${new URLSearchParams({ ...Object.fromEntries(params), page: String(page + 1) }).toString()}`}
            className="rounded-md border px-3 py-1 text-sm"
          >
            ถัดไป
          </Link>
        )}
      </div>
    </div>
  );
}
