import { notFound } from "next/navigation";
import { updateAssetAction } from "@/app/actions/assets";
import { AssetForm } from "@/components/assets/asset-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { employeeName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assetId = Number(id);
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) notFound();
  if (asset.status === "Disposed") notFound();

  const [employees, locations] = await Promise.all([
    prisma.employee.findMany({ where: { active: true }, orderBy: { firstName: "asc" } }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แก้ไข {asset.serialNo}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสินทรัพย์</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            action={updateAssetAction.bind(null, assetId)}
            initial={{
              ...asset,
              acquisitionDate: asset.acquisitionDate?.toISOString().slice(0, 10) ?? "",
            }}
            employees={employees.map((e) => ({ id: e.id, label: employeeName(e) }))}
            locations={locations.map((l) => ({ id: l.id, label: l.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
