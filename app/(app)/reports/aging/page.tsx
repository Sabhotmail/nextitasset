import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/data-table";
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

      <DataTable>
        <DataTableHead>
          <DataTableHeaderCell>S/N</DataTableHeaderCell>
          <DataTableHeaderCell>Type</DataTableHeaderCell>
          <DataTableHeaderCell>วันที่ได้มา</DataTableHeaderCell>
          <DataTableHeaderCell>อายุ (ปี)</DataTableHeaderCell>
          <DataTableHeaderCell>สถานที่</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {assets.length === 0 ? (
            <DataTableEmpty colSpan={5} message="ไม่พบสินทรัพย์ที่มีวันที่ได้มา" />
          ) : (
            assets.map((asset) => (
              <DataTableRow key={asset.id}>
                <DataTableCell>
                  <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                    {asset.serialNo}
                  </code>
                </DataTableCell>
                <DataTableCell>{asset.type}</DataTableCell>
                <DataTableCell className="text-slate-500 dark:text-slate-400">
                  {formatDate(asset.acquisitionDate)}
                </DataTableCell>
                <DataTableCell>
                  <span className="font-medium">{ageInYears(asset.acquisitionDate) ?? "—"}</span>
                  {ageInYears(asset.acquisitionDate) !== null && (
                    <span className="ml-1 text-slate-500 dark:text-slate-400">ปี</span>
                  )}
                </DataTableCell>
                <DataTableCell>{asset.location?.name ?? "—"}</DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
