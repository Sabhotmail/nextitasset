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
      <DataTable>
        <DataTableHead>
          <DataTableHeaderCell>วันที่</DataTableHeaderCell>
          <DataTableHeaderCell>S/N</DataTableHeaderCell>
          <DataTableHeaderCell>หัวข้อ</DataTableHeaderCell>
          <DataTableHeaderCell>ค่าใช้จ่าย</DataTableHeaderCell>
          <DataTableHeaderCell>ผู้บันทึก</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {records.length === 0 ? (
            <DataTableEmpty colSpan={5} message="ยังไม่มีข้อมูลบำรุงรักษา" />
          ) : (
            records.map((record) => (
              <DataTableRow key={record.id}>
                <DataTableCell className="text-slate-500 dark:text-slate-400">
                  {formatDate(record.servicedAt)}
                </DataTableCell>
                <DataTableCell>
                  <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                    {record.asset.serialNo}
                  </code>
                </DataTableCell>
                <DataTableCell>{record.subject}</DataTableCell>
                <DataTableCell className="font-medium">
                  {formatCurrency(record.cost?.toString())}
                </DataTableCell>
                <DataTableCell>{record.actor?.name ?? "—"}</DataTableCell>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
