import { createAssetAction } from "@/app/actions/assets";
import { AssetForm } from "@/components/assets/asset-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { employeeName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewAssetPage() {
  const [employees, locations] = await Promise.all([
    prisma.employee.findMany({ where: { active: true }, orderBy: { firstName: "asc" } }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">เพิ่มสินทรัพย์</h1>
        <p className="text-slate-500">บันทึกสินทรัพย์ IT ใหม่พร้อม audit trail</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสินทรัพย์</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            action={createAssetAction}
            employees={employees.map((e) => ({ id: e.id, label: employeeName(e) }))}
            locations={locations.map((l) => ({ id: l.id, label: l.name }))}
            submitLabel="สร้างสินทรัพย์"
          />
        </CardContent>
      </Card>
    </div>
  );
}
