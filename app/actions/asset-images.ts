"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { recordAssetEvent } from "@/lib/audit";
import { deleteAssetImageFile, saveAssetImage } from "@/lib/uploads/asset-images";

export type ImageActionState = {
  message?: string;
};

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function uploadAssetImageAction(
  assetId: number,
  _prev: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  try {
    const actorId = await requireUserId();
    const asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });

    const file = formData.get("image") as File | null;
    const caption = String(formData.get("caption") ?? "").trim();

    if (!file || file.size === 0) {
      return { message: "กรุณาเลือกรูปภาพ" };
    }

    const saved = await saveAssetImage(assetId, file);
    const image = await prisma.assetImage.create({
      data: {
        assetId,
        fileName: saved.fileName,
        filePath: saved.filePath,
        caption,
      },
    });

    await recordAssetEvent({
      assetId,
      eventType: "UPDATE",
      fieldName: "image",
      newValue: JSON.stringify({ id: image.id, filePath: image.filePath, caption: image.caption }),
      note: `เพิ่มรูปภาพ: ${saved.fileName}`,
      actorId,
    });

    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/assets");
    return { message: "อัปโหลดรูปภาพสำเร็จ" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ" };
  }
}

export async function deleteAssetImageAction(assetId: number, imageId: number) {
  const actorId = await requireUserId();
  const image = await prisma.assetImage.findFirstOrThrow({
    where: { id: imageId, assetId },
  });

  await deleteAssetImageFile(image.filePath);
  await prisma.assetImage.delete({ where: { id: imageId } });

  await recordAssetEvent({
    assetId,
    eventType: "UPDATE",
    fieldName: "image",
    oldValue: JSON.stringify({ id: image.id, filePath: image.filePath, caption: image.caption }),
    note: `ลบรูปภาพ: ${image.fileName}`,
    actorId,
  });

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");
}

export async function saveImagesFromForm(assetId: number, formData: FormData, actorId: number | null) {
  const files = formData.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) return;

  for (const file of files) {
    const saved = await saveAssetImage(assetId, file);
    const image = await prisma.assetImage.create({
      data: {
        assetId,
        fileName: saved.fileName,
        filePath: saved.filePath,
      },
    });

    await recordAssetEvent({
      assetId,
      eventType: "UPDATE",
      fieldName: "image",
      newValue: JSON.stringify({ id: image.id, filePath: image.filePath }),
      note: `เพิ่มรูปภาพ: ${saved.fileName}`,
      actorId,
    });
  }
}
