import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function ageInYears(date: Date | null) {
  if (!date) return null;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

export default async function AgingReportPage() {
  const assets = await prisma.asset.findMany({
    where: { acquisitionDate: { not: null } },
    include: { location: true, assignedTo: true },
    orderBy: { acquisitionDate: "asc" },
  });

  const buckets = {
    "0-1 ปี": 0,
    "1-3 ปี": 0,
    "3-5 ปี": 0,
    "5+ ปี": 0,
  };

  assets.forEach((asset) => {
    const age = ageInYears(asset.acquisitionDate);
    if (age === null) return;
    if (age < 1) buckets["0-1 ปี"]++;
    else if (age < 3) buckets["1-3 ปี"]++;
    else if (age < 5) buckets["3-5 ปี"]++;
    else buckets["5+ ปี"]++;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">รายงานอายุสินทรัพย์</h1>
        <p className="text-slate-500">วิเคราะห์จากวันที่ได้มา (acquisition date)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(buckets).map(([label, count]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{count}</CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-950">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">S/N</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">วันที่ได้มา</th>
              <th className="px-4 py-3 text-left">อายุ (ปี)</th>
              <th className="px-4 py-3 text-left">สถานที่</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-t">
                <td className="px-4 py-3">{asset.serialNo}</td>
                <td className="px-4 py-3">{asset.type}</td>
                <td className="px-4 py-3">{formatDate(asset.acquisitionDate)}</td>
                <td className="px-4 py-3">{ageInYears(asset.acquisitionDate) ?? "—"}</td>
                <td className="px-4 py-3">{asset.location?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
