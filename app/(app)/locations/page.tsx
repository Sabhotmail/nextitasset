import Link from "next/link";
import { LocationTable } from "@/components/locations/location-forms";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">สถานที่</h1>
          <p className="text-slate-500">Master data สำหรับที่ตั้งสินทรัพย์</p>
        </div>
        <Link href="/locations/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
          เพิ่มสถานที่
        </Link>
      </div>
      <LocationTable locations={locations} />
    </div>
  );
}
