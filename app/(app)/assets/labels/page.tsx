import { LabelPrinter } from "@/components/assets/label-printer";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AssetLabelsPage() {
  const assets = await prisma.asset.findMany({
    select: { id: true, serialNo: true, brand: true, model: true },
    orderBy: { serialNo: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ป้าย QR / Barcode</h1>
        <p className="text-slate-500">เลือกสินทรัพย์และพิมพ์ป้ายที่มี QR ไปหน้ารายละเอียด</p>
      </div>
      <LabelPrinter assets={assets} />
    </div>
  );
}
