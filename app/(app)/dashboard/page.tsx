import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [assets, statusGroups, typeGroups, recentEvents, maintenanceTotal] =
    await Promise.all([
      prisma.asset.count(),
      prisma.asset.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.asset.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.assetEvent.count({
        where: {
          occurredAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.assetMaintenance.aggregate({ _sum: { cost: true } }),
    ]);

  const statusData = statusGroups.map((item) => ({
    name: item.status,
    value: item._count._all,
  }));
  const typeData = typeGroups.map((item) => ({
    name: item.type,
    value: item._count._all,
  }));

  const monthlyMovements = await prisma.$queryRaw<
    Array<{ month: string; count: bigint }>
  >`
    SELECT to_char("occurredAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
    FROM "AssetEvent"
    WHERE "eventType" IN ('MOVEMENT', 'UPDATE', 'BULK')
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 6
  `;

  const movementData = monthlyMovements
    .map((row) => ({ month: row.month, count: Number(row.count) }))
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
          <p className="text-slate-500">ภาพรวมสินทรัพย์ IT และกิจกรรมล่าสุด</p>
        </div>
        <Link href="/assets/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
          เพิ่มสินทรัพย์
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>สินทรัพย์ทั้งหมด</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{assets}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>เหตุการณ์เดือนนี้</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{recentEvents}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>ค่าบำรุงรักษารวม</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">
            {formatCurrency(maintenanceTotal._sum.cost?.toString())}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>ประเภทสินทรัพย์</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{typeGroups.length}</CardContent>
        </Card>
      </div>

      <DashboardCharts
        statusData={statusData}
        typeData={typeData}
        movementData={movementData}
      />
    </div>
  );
}
