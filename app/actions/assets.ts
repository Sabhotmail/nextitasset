"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  assetToSnapshot,
  normalizeMac,
  recordAssetEvent,
  recordAssetEvents,
  recordCreateEvent,
  recordUpdateEvents,
} from "@/lib/audit";
import {
  assetFormSchema,
  bulkActionSchema,
  cleanOptionalString,
  employeeFormSchema,
  locationFormSchema,
  maintenanceFormSchema,
  movementFormSchema,
  parseOptionalDate,
} from "@/lib/validators";
import { saveImagesFromForm } from "@/app/actions/asset-images";
import { deleteAllAssetImages } from "@/lib/uploads/asset-images";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.endsWith("[]")) continue;
    obj[key] = value === "" ? null : value;
  }
  return obj;
}

async function validateMacUnique(mac: string | null, assetId?: number) {
  if (!mac) return;
  const existing = await prisma.asset.findFirst({
    where: {
      mac: { equals: mac, mode: "insensitive" },
      ...(assetId ? { NOT: { id: assetId } } : {}),
    },
  });
  if (existing) throw new Error("MAC ซ้ำกับรายการอื่น");
}

function buildAssetData(values: ReturnType<typeof assetFormSchema.parse>) {
  const status = values.status;

  return {
    type: values.type,
    status,
    brand: cleanOptionalString(values.brand),
    model: cleanOptionalString(values.model),
    serialNo: values.serialNo.trim(),
    monitorSn: cleanOptionalString(values.monitorSn),
    mac: normalizeMac(values.mac),
    os: cleanOptionalString(values.os),
    msOffice: cleanOptionalString(values.msOffice),
    assetNo: cleanOptionalString(values.assetNo),
    email: cleanOptionalString(values.email),
    acquisitionDate: parseOptionalDate(values.acquisitionDate),
    assetLocation: cleanOptionalString(values.assetLocation),
    remark: cleanOptionalString(values.remark),
    assignedToId: values.assignedToId || null,
    locationId: values.locationId || null,
    disposedAt: status === "Disposed" ? new Date() : null,
  };
}

export async function createAssetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const parsed = assetFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const data = buildAssetData(parsed.data);
    await validateMacUnique(data.mac ?? null);

    const asset = await prisma.asset.create({ data });
    await saveImagesFromForm(asset.id, formData, actorId);
    await recordCreateEvent(asset, actorId);
    revalidatePath("/assets");
    redirect(`/assets/${asset.id}`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function updateAssetAction(
  assetId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const existing = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
    if (existing.status === "Disposed") {
      return { message: "ไม่สามารถแก้ไขสินทรัพย์ที่จำหน่ายแล้วได้" };
    }

    const parsed = assetFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const data = buildAssetData(parsed.data);
    await validateMacUnique(data.mac ?? null, assetId);

    if (data.status === "Disposed" && !data.disposedAt) {
      data.disposedAt = new Date();
    }
    if (data.status !== "Disposed") {
      data.disposedAt = null;
    }

    const before = assetToSnapshot(existing);
    const asset = await prisma.asset.update({ where: { id: assetId }, data });
    await saveImagesFromForm(assetId, formData, actorId);
    const after = assetToSnapshot(asset);
    await recordUpdateEvents(assetId, before, after, actorId);

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    redirect(`/assets/${assetId}`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function deleteAssetAction(assetId: number) {
  const actorId = await requireUserId();
  const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  const images = await prisma.assetImage.findMany({ where: { assetId } });
  await recordAssetEvent({
    assetId,
    eventType: "DELETE",
    fieldName: "snapshot",
    oldValue: JSON.stringify(assetToSnapshot(asset)),
    actorId,
  });
  await deleteAllAssetImages(
    assetId,
    images.map((image) => image.filePath),
  );
  await prisma.asset.delete({ where: { id: assetId } });
  revalidatePath("/assets");
  redirect("/assets");
}

export async function moveAssetAction(
  assetId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const existing = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
    if (existing.status === "Disposed") {
      return { message: "ไม่สามารถโอนสินทรัพย์ที่จำหน่ายแล้วได้" };
    }

    const parsed = movementFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const before = assetToSnapshot(existing);
    const nextStatus =
      parsed.data.reason === "Dispose"
        ? "Disposed"
        : parsed.data.status ?? existing.status;

    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedToId:
          parsed.data.reason === "Return" ? null : parsed.data.assignedToId ?? existing.assignedToId,
        locationId: parsed.data.locationId ?? existing.locationId,
        status: nextStatus,
        disposedAt: nextStatus === "Disposed" ? new Date() : null,
      },
    });

    await recordUpdateEvents(assetId, before, assetToSnapshot(asset), actorId, {
      reason: parsed.data.reason,
      note: parsed.data.note ?? undefined,
    });

    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/history");
    redirect(`/assets/${assetId}`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function restoreAssetAction(assetId: number) {
  const actorId = await requireUserId();
  const existing = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
  const before = assetToSnapshot(existing);
  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: { status: "Active", disposedAt: null },
  });
  await recordUpdateEvents(assetId, before, assetToSnapshot(asset), actorId, {
    reason: "Update",
    note: "กู้คืนจาก Disposed",
  });
  revalidatePath(`/assets/${assetId}`);
  redirect(`/assets/${assetId}`);
}

export async function bulkAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const assetIds = formData.getAll("assetIds").map(Number);
    const payload = {
      action: formData.get("action"),
      assetIds,
      status: formData.get("status") || undefined,
      locationId: formData.get("locationId") || undefined,
      note: formData.get("note") || undefined,
    };
    const parsed = bulkActionSchema.safeParse(payload);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const batchId = randomUUID();
    const assets = await prisma.asset.findMany({
      where: { id: { in: parsed.data.assetIds } },
    });

    const events = [];
    for (const asset of assets) {
      const before = assetToSnapshot(asset);
      let data: Record<string, unknown> = {};

      switch (parsed.data.action) {
        case "status":
          data = { status: parsed.data.status };
          if (parsed.data.status === "Disposed") data.disposedAt = new Date();
          break;
        case "dispose":
          data = { status: "Disposed", disposedAt: new Date() };
          break;
        case "clear_assignee":
          data = { assignedToId: null };
          break;
        case "move_location":
          data = { locationId: parsed.data.locationId ?? null };
          break;
      }

      const updated = await prisma.asset.update({
        where: { id: asset.id },
        data,
      });
      const changes = await recordUpdateEvents(
        asset.id,
        before,
        assetToSnapshot(updated),
        actorId,
        { reason: "Update", note: parsed.data.note ?? undefined, batchId },
      );
      if (changes.length === 0) {
        events.push({
          assetId: asset.id,
          eventType: "BULK" as const,
          note: parsed.data.note ?? parsed.data.action,
          batchId,
          actorId,
        });
      }
    }

    if (events.length) await recordAssetEvents(events);
    revalidatePath("/assets");
    revalidatePath("/history");
    return { message: `ดำเนินการ bulk สำเร็จ ${assets.length} รายการ` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Bulk action ล้มเหลว" };
  }
}

export async function createEmployeeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUserId();
    const parsed = employeeFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

    const employee = await prisma.employee.create({
      data: {
        empCode: parsed.data.empCode.trim(),
        title: cleanOptionalString(parsed.data.title) ?? "",
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        department: cleanOptionalString(parsed.data.department) ?? "",
        branch: cleanOptionalString(parsed.data.branch) ?? "",
        email: cleanOptionalString(parsed.data.email) ?? "",
        active: formData.get("active") === "true",
      },
    });
    revalidatePath("/employees");
    redirect(`/employees/${employee.id}/edit`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function updateEmployeeAction(
  employeeId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUserId();
    const parsed = employeeFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        empCode: parsed.data.empCode.trim(),
        title: cleanOptionalString(parsed.data.title) ?? "",
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        department: cleanOptionalString(parsed.data.department) ?? "",
        branch: cleanOptionalString(parsed.data.branch) ?? "",
        email: cleanOptionalString(parsed.data.email) ?? "",
        active: formData.get("active") === "true",
      },
    });
    revalidatePath("/employees");
    return { message: "บันทึกพนักงานสำเร็จ" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function createLocationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUserId();
    const parsed = locationFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

    const location = await prisma.location.create({
      data: {
        code: cleanOptionalString(parsed.data.code) ?? "",
        name: parsed.data.name.trim(),
        note: cleanOptionalString(parsed.data.note) ?? "",
        active: formData.get("active") === "true",
      },
    });
    revalidatePath("/locations");
    redirect(`/locations/${location.id}/edit`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function updateLocationAction(
  locationId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUserId();
    const parsed = locationFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

    await prisma.location.update({
      where: { id: locationId },
      data: {
        code: cleanOptionalString(parsed.data.code) ?? "",
        name: parsed.data.name.trim(),
        note: cleanOptionalString(parsed.data.note) ?? "",
        active: formData.get("active") === "true",
      },
    });
    revalidatePath("/locations");
    return { message: "บันทึกสถานที่สำเร็จ" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function createMaintenanceAction(
  assetId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const parsed = maintenanceFormSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

    const maintenance = await prisma.assetMaintenance.create({
      data: {
        assetId,
        servicedAt: parseOptionalDate(parsed.data.servicedAt) ?? new Date(),
        subject: parsed.data.subject.trim(),
        detail: cleanOptionalString(parsed.data.detail) ?? "",
        cost: parsed.data.cost ?? null,
        actorId,
      },
    });

    await recordAssetEvent({
      assetId,
      eventType: "MAINTENANCE",
      fieldName: "maintenance",
      newValue: JSON.stringify({
        id: maintenance.id,
        subject: maintenance.subject,
        cost: maintenance.cost?.toString() ?? null,
        servicedAt: maintenance.servicedAt.toISOString(),
      }),
      note: maintenance.subject,
      actorId,
    });

    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/history");
    return { message: "บันทึกการบำรุงรักษาสำเร็จ" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" };
  }
}

export async function deleteMaintenanceAction(assetId: number, maintenanceId: number) {
  const actorId = await requireUserId();
  const maintenance = await prisma.assetMaintenance.findUniqueOrThrow({
    where: { id: maintenanceId },
  });
  await recordAssetEvent({
    assetId,
    eventType: "MAINTENANCE",
    fieldName: "maintenance",
    oldValue: JSON.stringify(maintenance),
    note: `ลบการบำรุงรักษา: ${maintenance.subject}`,
    actorId,
  });
  await prisma.assetMaintenance.delete({ where: { id: maintenanceId } });
  revalidatePath(`/assets/${assetId}`);
}

export async function importAssetsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const actorId = await requireUserId();
    const file = formData.get("file") as File | null;
    const mode = (formData.get("mode") as string) || "create";
    if (!file) return { message: "กรุณาเลือกไฟล์ Excel" };

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return { message: "ไม่พบ sheet ในไฟล์" };

    const headers: string[] = [];
    sheet.getRow(1).eachCell((cell, col) => {
      headers[col - 1] = String(cell.value ?? "").trim().toLowerCase();
    });

    const headerMap: Record<string, string> = {
      type: "type",
      status: "status",
      brand: "brand",
      model: "model",
      "s/n": "serialNo",
      serial_no: "serialNo",
      serialno: "serialNo",
      mac: "mac",
      os: "os",
      "ms office": "msOffice",
      asset_no: "assetNo",
      email: "email",
      location: "locationName",
      assigned_to: "empCode",
      emp_code: "empCode",
    };

    const batchId = randomUUID();
    let createdRows = 0;
    let updatedRows = 0;
    let skippedRows = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        const key = headerMap[header];
        if (!key) return;
        record[key] = String(row.getCell(index + 1).value ?? "").trim();
      });

      if (!record.serialNo) {
        skippedRows++;
        continue;
      }

      let locationId: number | null = null;
      if (record.locationName) {
        const location = await prisma.location.findFirst({
          where: { name: { equals: record.locationName, mode: "insensitive" } },
        });
        locationId = location?.id ?? null;
      }

      let assignedToId: number | null = null;
      if (record.empCode) {
        const employee = await prisma.employee.findUnique({
          where: { empCode: record.empCode },
        });
        assignedToId = employee?.id ?? null;
      }

      const existing = await prisma.asset.findUnique({
        where: { serialNo: record.serialNo },
      });

      if (existing && mode === "create") {
        skippedRows++;
        continue;
      }

      const payload = {
        type: record.type || "Other",
        status: record.status || "Active",
        brand: record.brand || null,
        model: record.model || null,
        serialNo: record.serialNo,
        mac: normalizeMac(record.mac),
        os: record.os || null,
        msOffice: record.msOffice || null,
        assetNo: record.assetNo || null,
        email: record.email || null,
        locationId,
        assignedToId,
      };

      if (existing) {
        const before = assetToSnapshot(existing);
        const updated = await prisma.asset.update({
          where: { id: existing.id },
          data: payload,
        });
        await recordUpdateEvents(existing.id, before, assetToSnapshot(updated), actorId, {
          batchId,
          note: "Import Excel",
        });
        updatedRows++;
      } else {
        const created = await prisma.asset.create({ data: payload });
        await recordCreateEvent(created, actorId, batchId);
        createdRows++;
      }
    }

    await prisma.importBatch.create({
      data: {
        batchId,
        fileName: file.name,
        totalRows: createdRows + updatedRows + skippedRows,
        createdRows,
        updatedRows,
        skippedRows,
        actorId,
      },
    });

    revalidatePath("/assets");
    revalidatePath("/history");
    return {
      message: `นำเข้าสำเร็จ: สร้าง ${createdRows}, อัปเดต ${updatedRows}, ข้าม ${skippedRows}`,
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "นำเข้าไม่สำเร็จ" };
  }
}

export async function importEmployeesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireUserId();
    const file = formData.get("file") as File | null;
    if (!file) return { message: "กรุณาเลือกไฟล์ Excel" };

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return { message: "ไม่พบ sheet ในไฟล์" };

    let count = 0;
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const empCode = String(row.getCell(1).value ?? "").trim();
      const firstName = String(row.getCell(2).value ?? "").trim();
      const lastName = String(row.getCell(3).value ?? "").trim();
      const email = String(row.getCell(4).value ?? "").trim();
      if (!empCode || !firstName) continue;

      await prisma.employee.upsert({
        where: { empCode },
        update: { firstName, lastName, email },
        create: { empCode, firstName, lastName, email },
      });
      count++;
    }

    revalidatePath("/employees");
    return { message: `นำเข้าพนักงานสำเร็จ ${count} รายการ` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "นำเข้าไม่สำเร็จ" };
  }
}
