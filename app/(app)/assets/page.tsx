import Link from "next/link";
import { Suspense } from "react";
import { getPagedAssets } from "@/lib/assets/queries";
import { AssetFilters, AssetTable, Pagination } from "@/components/assets/asset-table";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [{ items, total, page, pageSize }, locations] = await Promise.all([
    getPagedAssets(params),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">สินทรัพย์ IT</h1>
          <p className="text-slate-500">ค้นหา กรอง และจัดการสินทรัพย์</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/assets/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
            เพิ่มสินทรัพย์
          </Link>
          <Link href="/assets/import" className="rounded-md border px-4 py-2 text-sm">
            นำเข้า Excel
          </Link>
          <a
            href={`/api/export/assets?${new URLSearchParams(
              Object.entries(params).filter(([, value]) => value) as [string, string][],
            ).toString()}`}
            className="rounded-md border px-4 py-2 text-sm"
          >
            ส่งออก Excel
          </a>
          <Link href="/assets/labels" className="rounded-md border px-4 py-2 text-sm">
            ป้าย QR
          </Link>
        </div>
      </div>

      <Suspense>
        <AssetFilters locations={locations} />
      </Suspense>
      <AssetTable assets={items} locations={locations} />
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        basePath="/assets"
        searchParams={params}
      />
    </div>
  );
}
