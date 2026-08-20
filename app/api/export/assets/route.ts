import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { getAssetsForExport } from "@/lib/assets/queries";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const assets = await getAssetsForExport(searchParams);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Assets");
  sheet.addRow([
    "Type",
    "Status",
    "Brand",
    "Model",
    "S/N",
    "MAC",
    "OS",
    "MS Office",
    "Asset No",
    "Email",
    "Assigned To",
    "Location",
    "Updated At",
  ]);

  assets.forEach((asset) => {
    sheet.addRow([
      asset.type,
      asset.status,
      asset.brand,
      asset.model,
      asset.serialNo,
      asset.mac,
      asset.os,
      asset.msOffice,
      asset.assetNo,
      asset.email,
      asset.assignedTo
        ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName} (${asset.assignedTo.empCode})`
        : "",
      asset.location?.name ?? "",
      asset.updatedAt.toISOString(),
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="assets-export.xlsx"',
    },
  });
}
