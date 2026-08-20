"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/app/actions/assets";
import { ASSET_STATUSES, ASSET_TYPES } from "@/lib/constants";
import th from "@/messages/th.json";

type Option = { id: number; label: string };

type AssetFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: {
    type?: string;
    status?: string;
    brand?: string | null;
    model?: string | null;
    serialNo?: string;
    monitorSn?: string | null;
    mac?: string | null;
    os?: string | null;
    msOffice?: string | null;
    assetNo?: string | null;
    email?: string | null;
    acquisitionDate?: string | null;
    assetLocation?: string | null;
    remark?: string | null;
    assignedToId?: number | null;
    locationId?: number | null;
  };
  employees: Option[];
  locations: Option[];
  submitLabel?: string;
};

export function AssetForm({
  action,
  initial,
  employees,
  locations,
  submitLabel = "บันทึก",
}: AssetFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>{th.fields.type}</Label>
        <Select name="type" defaultValue={initial?.type ?? "Laptop"}>
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{th.fields.status}</Label>
        <Select name="status" defaultValue={initial?.status ?? "Active"}>
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{th.fields.brand}</Label>
        <Input name="brand" defaultValue={initial?.brand ?? ""} />
      </div>
      <div>
        <Label>{th.fields.model}</Label>
        <Input name="model" defaultValue={initial?.model ?? ""} />
      </div>
      <div>
        <Label>{th.fields.serialNo}</Label>
        <Input name="serialNo" defaultValue={initial?.serialNo ?? ""} required />
        {state.errors?.serialNo && (
          <p className="text-sm text-red-600">{state.errors.serialNo[0]}</p>
        )}
      </div>
      <div>
        <Label>{th.fields.monitorSn}</Label>
        <Input name="monitorSn" defaultValue={initial?.monitorSn ?? ""} />
      </div>
      <div>
        <Label>{th.fields.mac}</Label>
        <Input name="mac" defaultValue={initial?.mac ?? ""} />
      </div>
      <div>
        <Label>{th.fields.os}</Label>
        <Input name="os" defaultValue={initial?.os ?? ""} />
      </div>
      <div>
        <Label>{th.fields.msOffice}</Label>
        <Input name="msOffice" defaultValue={initial?.msOffice ?? ""} />
      </div>
      <div>
        <Label>{th.fields.assetNo}</Label>
        <Input name="assetNo" defaultValue={initial?.assetNo ?? ""} />
      </div>
      <div>
        <Label>{th.fields.email}</Label>
        <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
      </div>
      <div>
        <Label>{th.fields.acquisitionDate}</Label>
        <Input
          name="acquisitionDate"
          type="date"
          defaultValue={initial?.acquisitionDate ?? ""}
        />
      </div>
      <div>
        <Label>{th.fields.assignedTo}</Label>
        <Select
          name="assignedToId"
          defaultValue={initial?.assignedToId ? String(initial.assignedToId) : ""}
        >
          <option value="">—</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{th.fields.location}</Label>
        <Select
          name="locationId"
          defaultValue={initial?.locationId ? String(initial.locationId) : ""}
        >
          <option value="">—</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label>{th.fields.assetLocation}</Label>
        <Input name="assetLocation" defaultValue={initial?.assetLocation ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label>รูปภาพ</Label>
        <Input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
        <p className="mt-1 text-xs text-slate-500">เลือกได้หลายรูป — JPG, PNG, WEBP, GIF สูงสุด 5 MB ต่อไฟล์</p>
      </div>
      <div className="md:col-span-2">
        <Label>{th.fields.remark}</Label>
        <Textarea name="remark" defaultValue={initial?.remark ?? ""} />
      </div>
      {state.message && <p className="md:col-span-2 text-sm text-red-600">{state.message}</p>}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
