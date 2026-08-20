import { NextResponse } from "next/server";
import { replaySnapshot, resolveDisplayValue } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const assetId = Number(id);
  const asOfParam = new URL(request.url).searchParams.get("asOf");

  if (!asOfParam) {
    return NextResponse.json({ message: "กรุณาระบุ asOf" }, { status: 400 });
  }

  try {
    const snapshot = await replaySnapshot(assetId, new Date(asOfParam));
    const displayEntries = await Promise.all(
      Object.entries(snapshot).map(async ([key, value]) => {
        if (key === "assignedToId" || key === "locationId") {
          return [key, await resolveDisplayValue(key, value == null ? null : String(value))];
        }
        return [key, value];
      }),
    );

    return NextResponse.json({
      snapshot: Object.fromEntries(displayEntries),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "ไม่พบ snapshot" },
      { status: 404 },
    );
  }
}
