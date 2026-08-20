import Link from "next/link";
import type { AssetEvent, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveDisplayValue } from "@/lib/audit";
import { formatDateTime } from "@/lib/utils";
import th from "@/messages/th.json";

type EventWithRelations = AssetEvent & {
  asset?: { serialNo: string; brand: string | null; model: string | null };
  actor?: User | null;
};

const fieldLabels: Record<string, string> = th.fields as Record<string, string>;

async function EventCard({ event }: { event: EventWithRelations }) {
  const label = th.events[event.eventType as keyof typeof th.events] ?? event.eventType;
  let detail = event.note ?? "";

  if (event.fieldName && event.fieldName !== "snapshot") {
    const oldDisplay = await resolveDisplayValue(event.fieldName, event.oldValue);
    const newDisplay = await resolveDisplayValue(event.fieldName, event.newValue);
    const fieldLabel = fieldLabels[event.fieldName] ?? event.fieldName;
    detail = `${fieldLabel}: ${oldDisplay ?? "—"} → ${newDisplay ?? "—"}`;
  } else if (event.fieldName === "snapshot" && event.newValue) {
    detail = "บันทึก snapshot เริ่มต้น";
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">{formatDateTime(event.occurredAt)}</span>
          <Badge tone={event.reason ?? undefined}>{label}</Badge>
          {event.reason && <Badge tone={event.reason}>{event.reason}</Badge>}
        </div>
        <p className="font-medium">
          {event.asset
            ? `${event.asset.serialNo} — ${event.asset.brand ?? ""} ${event.asset.model ?? ""}`.trim()
            : `Asset #${event.assetId}`}
        </p>
        {detail && <p className="text-sm text-slate-600 dark:text-slate-300">{detail}</p>}
        <p className="text-xs text-slate-500">
          โดย: {event.actor?.name ?? "ระบบ"}
          {event.batchId ? ` | Batch: ${event.batchId}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

export async function Timeline({ events }: { events: EventWithRelations[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
        ไม่พบประวัติ
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export function TimelineLink({ assetId }: { assetId: number }) {
  return (
    <Link href={`/assets/${assetId}?tab=history`} className="text-blue-600 hover:underline">
      ดูประวัติทั้งหมด
    </Link>
  );
}
