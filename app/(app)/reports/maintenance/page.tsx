import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MaintenanceReportPage() {
  const records = await prisma.assetMaintenance.findMany({
    include: {
      asset: { select: { serialNo: true, brand: true, model: true } },
      actor: { select: { name: true } },
    },
    orderBy: { servicedAt: "desc" },
    take: 100,
  });

  const total = records.reduce((sum, item) => sum + Number(item.cost ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">รายงานค่าบำรุงรักษา</h1>
        <p className="text-slate-500">รายการล่าสุด 100 รายการ · รวม {formatCurrency(total)}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-950">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">วันที่</th>
              <th className="px-4 py-3 text-left">S/N</th>
              <th className="px-4 py-3 text-left">หัวข้อ</th>
              <th className="px-4 py-3 text-left">ค่าใช้จ่าย</th>
              <th className="px-4 py-3 text-left">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="px-4 py-3">{formatDate(record.servicedAt)}</td>
                <td className="px-4 py-3">{record.asset.serialNo}</td>
                <td className="px-4 py-3">{record.subject}</td>
                <td className="px-4 py-3">{formatCurrency(record.cost?.toString())}</td>
                <td className="px-4 py-3">{record.actor?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
