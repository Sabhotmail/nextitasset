import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";

export function buildAssetWhere(searchParams: Record<string, string | undefined>) {
  const q = searchParams.q?.trim();
  return {
    ...(searchParams.type ? { type: searchParams.type } : {}),
    ...(searchParams.status ? { status: searchParams.status } : {}),
    ...(searchParams.locationId ? { locationId: Number(searchParams.locationId) } : {}),
    ...(q
      ? {
          OR: [
            { serialNo: { contains: q, mode: "insensitive" as const } },
            { brand: { contains: q, mode: "insensitive" as const } },
            { model: { contains: q, mode: "insensitive" as const } },
            { assetNo: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function getAssetsForExport(searchParams: Record<string, string | undefined>) {
  const where = buildAssetWhere(searchParams);
  return prisma.asset.findMany({
    where,
    include: { assignedTo: true, location: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPagedAssets(searchParams: Record<string, string | undefined>) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const where = buildAssetWhere(searchParams);
  const [items, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { assignedTo: true, location: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.asset.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE_SIZE };
}

export async function getPagedEvents(searchParams: Record<string, string | undefined>) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const where = {
    ...(searchParams.eventType ? { eventType: searchParams.eventType } : {}),
    ...(searchParams.from || searchParams.to
      ? {
          occurredAt: {
            ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}),
            ...(searchParams.to ? { lte: new Date(`${searchParams.to}T23:59:59`) } : {}),
          },
        }
      : {}),
    ...(searchParams.serialNo
      ? {
          asset: {
            serialNo: { contains: searchParams.serialNo, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.assetEvent.findMany({
      where,
      include: {
        asset: { select: { serialNo: true, brand: true, model: true } },
        actor: true,
      },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.assetEvent.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}
