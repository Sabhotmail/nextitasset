import { notFound } from "next/navigation";
import { MovementForm } from "@/components/assets/movement-form";
import { prisma } from "@/lib/db";
import { employeeName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MoveAssetPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">โอนย้ายสินทรัพย์</h1>
        <p className="text-slate-500">บันทึก Assign / Transfer / Return / Dispose</p>
      </div>
      <MovementForm
        assetId={asset.id}
        serialNo={asset.serialNo}
        employees={employees.map((e) => ({ id: e.id, label: employeeName(e) }))}
        locations={locations.map((l) => ({ id: l.id, label: l.name }))}
      />
    </div>
  );
}
