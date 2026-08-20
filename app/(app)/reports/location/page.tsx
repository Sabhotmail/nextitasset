import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LocationReportPage() {
  const rows = await prisma.location.findMany({
    include: {
      _count: { select: { assets: true } },
      assets: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">รายงานตามสถานที่</h1>
        <p className="text-slate-500">จำนวนสินทรัพย์และสถานะในแต่ละ location</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((location) => {
          const statusCounts = location.assets.reduce<Record<string, number>>((acc, asset) => {
            acc[asset.status] = (acc[asset.status] ?? 0) + 1;
            return acc;
          }, {});
          return (
            <Card key={location.id}>
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>สินทรัพย์ทั้งหมด: {location._count.assets}</p>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <p key={status}>
                    {status}: {count}
                  </p>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
