import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAssetAction, restoreAssetAction } from "@/app/actions/assets";
import { SnapshotViewer } from "@/components/assets/snapshot-viewer";
import { MaintenancePanel } from "@/components/assets/maintenance-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/components/history/timeline";
import { prisma } from "@/lib/db";
import { employeeName, formatDate } from "@/lib/utils";
import th from "@/messages/th.json";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;
  const assetId = Number(id);
  if (Number.isNaN(assetId)) notFound();

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      assignedTo: true,
      location: true,
      events: {
        include: { actor: true, asset: { select: { serialNo: true, brand: true, model: true } } },
        orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
        take: 50,
      },
      maintenances: { include: { actor: true }, orderBy: { servicedAt: "desc" } },
    },
  });

  if (!asset) notFound();
  const isDisposed = asset.status === "Disposed";

  const tabs = [
    { key: "overview", label: "ภาพรวม" },
    { key: "history", label: "ประวัติ" },
    { key: "maintenance", label: "การบำรุงรักษา" },
    { key: "snapshot", label: "ดูย้อนหลัง" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{asset.serialNo}</h1>
          <p className="text-slate-500">
            {asset.type} · {asset.brand} {asset.model}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDisposed && (
            <>
              <Link
                href={`/assets/${asset.id}/edit`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm"
              >
                แก้ไข
              </Link>
              <Link
                href={`/assets/${asset.id}/move`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm text-white"
              >
                โอนย้าย
              </Link>
            </>
          )}
          {isDisposed && (
            <form action={restoreAssetAction.bind(null, asset.id)}>
              <Button type="submit">กู้คืน</Button>
            </form>
          )}
          <form action={deleteAssetAction.bind(null, asset.id)}>
            <Button type="submit" variant="destructive">
              ลบ
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item.key}
            href={`/assets/${asset.id}?tab=${item.key}`}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === item.key ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ภาพรวม <Badge tone={asset.status}>{asset.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              [th.fields.type, asset.type],
              [th.fields.status, asset.status],
              [th.fields.brand, asset.brand],
              [th.fields.model, asset.model],
              [th.fields.mac, asset.mac],
              [th.fields.os, asset.os],
              [th.fields.msOffice, asset.msOffice],
              [th.fields.assetNo, asset.assetNo],
              [th.fields.email, asset.email],
              [th.fields.assignedTo, asset.assignedTo ? employeeName(asset.assignedTo) : "—"],
              [th.fields.location, asset.location?.name ?? "—"],
              [th.fields.assetLocation, asset.assetLocation],
              [th.fields.acquisitionDate, formatDate(asset.acquisitionDate)],
              [th.fields.disposedAt, formatDate(asset.disposedAt)],
              [th.fields.remark, asset.remark],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="font-medium">{value ?? "—"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "history" && <Timeline events={asset.events} />}
      {tab === "maintenance" && (
        <MaintenancePanel assetId={asset.id} maintenances={asset.maintenances} />
      )}
      {tab === "snapshot" && <SnapshotViewer assetId={asset.id} currentSerialNo={asset.serialNo} />}
    </div>
  );
}
