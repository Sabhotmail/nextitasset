import type { Asset, Employee, Location } from "@prisma/client";
import type { EventType, MovementReason } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { employeeName } from "@/lib/utils";

export type AssetSnapshot = Partial<
  Pick<
    Asset,
    | "type"
    | "status"
    | "brand"
    | "model"
    | "serialNo"
    | "monitorSn"
    | "mac"
    | "os"
    | "msOffice"
    | "assetNo"
    | "email"
    | "assetLocation"
    | "remark"
    | "assignedToId"
    | "locationId"
  >
> & {
  acquisitionDate?: string | null;
  disposedAt?: string | null;
};

const TRACKED_FIELDS: (keyof AssetSnapshot)[] = [
  "type",
  "status",
  "brand",
  "model",
  "serialNo",
  "monitorSn",
  "mac",
  "os",
  "msOffice",
  "assetNo",
  "email",
  "acquisitionDate",
  "assetLocation",
  "remark",
  "assignedToId",
  "locationId",
  "disposedAt",
];

function serializeValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function resolveDisplayValue(
  fieldName: string,
  value: string | null | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (fieldName === "assignedToId") {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(value) },
    });
    return employee ? employeeName(employee) : value;
  }
  if (fieldName === "locationId") {
    const location = await prisma.location.findUnique({
      where: { id: Number(value) },
    });
    return location ? location.name : value;
  }
  if (fieldName === "acquisitionDate" || fieldName === "disposedAt") {
    return new Date(value).toLocaleDateString("th-TH");
  }
  return value;
}

export function assetToSnapshot(asset: Asset): AssetSnapshot {
  return {
    type: asset.type,
    status: asset.status,
    brand: asset.brand,
    model: asset.model,
    serialNo: asset.serialNo,
    monitorSn: asset.monitorSn,
    mac: asset.mac,
    os: asset.os,
    msOffice: asset.msOffice,
    assetNo: asset.assetNo,
    email: asset.email,
    acquisitionDate: asset.acquisitionDate?.toISOString() ?? null,
    assetLocation: asset.assetLocation,
    remark: asset.remark,
    assignedToId: asset.assignedToId,
    locationId: asset.locationId,
    disposedAt: asset.disposedAt?.toISOString() ?? null,
  };
}

export function diffAsset(
  before: AssetSnapshot,
  after: AssetSnapshot,
): Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> {
  const changes: Array<{
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
  }> = [];

  for (const field of TRACKED_FIELDS) {
    const oldValue = serializeValue(before[field]);
    const newValue = serializeValue(after[field]);
    if (oldValue !== newValue) {
      changes.push({ fieldName: field, oldValue, newValue });
    }
  }

  return changes;
}

type RecordEventInput = {
  assetId: number;
  eventType: EventType;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: MovementReason | string | null;
  note?: string | null;
  batchId?: string | null;
  actorId?: number | null;
  occurredAt?: Date;
};

export async function recordAssetEvent(input: RecordEventInput) {
  return prisma.assetEvent.create({
    data: {
      assetId: input.assetId,
      eventType: input.eventType,
      fieldName: input.fieldName ?? null,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      reason: input.reason ?? null,
      note: input.note ?? null,
      batchId: input.batchId ?? null,
      actorId: input.actorId ?? null,
      occurredAt: input.occurredAt ?? new Date(),
    },
  });
}

export async function recordAssetEvents(events: RecordEventInput[]) {
  if (events.length === 0) return;
  await prisma.assetEvent.createMany({
    data: events.map((event) => ({
      assetId: event.assetId,
      eventType: event.eventType,
      fieldName: event.fieldName ?? null,
      oldValue: event.oldValue ?? null,
      newValue: event.newValue ?? null,
      reason: event.reason ?? null,
      note: event.note ?? null,
      batchId: event.batchId ?? null,
      actorId: event.actorId ?? null,
      occurredAt: event.occurredAt ?? new Date(),
    })),
  });
}

export async function recordCreateEvent(
  asset: Asset,
  actorId: number | null,
  batchId?: string | null,
) {
  const snapshot = assetToSnapshot(asset);
  await recordAssetEvent({
    assetId: asset.id,
    eventType: batchId ? "IMPORT" : "CREATE",
    fieldName: "snapshot",
    newValue: JSON.stringify(snapshot),
    batchId,
    actorId,
  });
}

export async function recordUpdateEvents(
  assetId: number,
  before: AssetSnapshot,
  after: AssetSnapshot,
  actorId: number | null,
  options?: { reason?: MovementReason | string; note?: string; batchId?: string },
) {
  const changes = diffAsset(before, after);
  const events: RecordEventInput[] = changes.map((change) => ({
    assetId,
    eventType: options?.batchId ? "IMPORT" : options?.reason ? "MOVEMENT" : "UPDATE",
    fieldName: change.fieldName,
    oldValue: change.oldValue,
    newValue: change.newValue,
    reason: options?.reason ?? "Update",
    note: options?.note,
    batchId: options?.batchId,
    actorId,
  }));

  await recordAssetEvents(events);
  return changes;
}

export async function replaySnapshot(
  assetId: number,
  asOf: Date,
): Promise<AssetSnapshot & { serialNo: string }> {
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  let snapshot = assetToSnapshot(asset) as AssetSnapshot & { serialNo: string };

  const events = await prisma.assetEvent.findMany({
    where: {
      assetId,
      occurredAt: { gt: asOf },
    },
    orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
  });

  for (const event of events) {
    if (event.eventType === "DELETE") {
      throw new Error("Asset was deleted after the selected date");
    }
    if (event.eventType === "CREATE" || event.fieldName === "snapshot") {
      if (event.newValue) {
        snapshot = { ...snapshot, ...JSON.parse(event.newValue) };
      }
      continue;
    }
    if (event.fieldName && event.oldValue !== undefined) {
      const field = event.fieldName as keyof AssetSnapshot;
      if (field === "acquisitionDate" || field === "disposedAt") {
        snapshot[field] = event.oldValue;
      } else if (field === "assignedToId" || field === "locationId") {
        snapshot[field] = event.oldValue ? Number(event.oldValue) : null;
      } else {
        snapshot[field] = event.oldValue as never;
      }
    }
  }

  return snapshot;
}

export function normalizeMac(mac: string | null | undefined): string | null {
  if (!mac) return null;
  const raw = mac.replace(/[-:.]/g, "").trim().toUpperCase();
  if (raw.length === 12 && /^[0-9A-F]+$/.test(raw)) {
    return raw.match(/.{1,2}/g)!.join(":");
  }
  return mac.trim().toUpperCase();
}

export async function enrichMovementValues(
  assignedToId: number | null | undefined,
  locationId: number | null | undefined,
  location?: Location | null,
  employee?: Employee | null,
) {
  let assigneeName: string | null = null;
  let locationName: string | null = location?.name ?? null;

  if (assignedToId) {
    const emp = employee ?? (await prisma.employee.findUnique({ where: { id: assignedToId } }));
    assigneeName = emp ? employeeName(emp) : null;
  }
  if (locationId && !locationName) {
    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    locationName = loc?.name ?? null;
  }

  return { assigneeName, locationName };
}
