import { Suspense } from "react";
import { getPagedEvents } from "@/lib/assets/queries";
import { HistoryFilters } from "@/components/history/history-filters";
import { Timeline } from "@/components/history/timeline";
import { Pagination } from "@/components/assets/asset-table";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { items, total, page, pageSize } = await getPagedEvents(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ประวัติทั้งระบบ</h1>
        <p className="text-slate-500">Unified timeline ของทุกการเปลี่ยนแปลง</p>
      </div>
      <Suspense>
        <HistoryFilters />
      </Suspense>
      <Timeline events={items} />
      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        basePath="/history"
        searchParams={params}
      />
    </div>
  );
}
