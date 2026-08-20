import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "assets");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function isAllowedImage(file: File) {
  return file.type in ALLOWED_TYPES;
}

export async function saveAssetImage(assetId: number, file: File) {
  if (!isAllowedImage(file)) {
    throw new Error("รองรับเฉพาะไฟล์ JPG, PNG, WEBP, GIF");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ไฟล์ใหญ่เกิน 5 MB");
  }

  const ext = ALLOWED_TYPES[file.type];
  const storedName = `${randomUUID()}.${ext}`;
  const assetDir = path.join(UPLOAD_ROOT, String(assetId));
  await mkdir(assetDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(assetDir, storedName), buffer);

  return {
    fileName: file.name || storedName,
    filePath: `/uploads/assets/${assetId}/${storedName}`,
  };
}

export async function deleteAssetImageFile(filePath: string) {
  if (!filePath.startsWith("/uploads/assets/")) return;
  const fullPath = path.join(process.cwd(), "public", filePath);
  try {
    await unlink(fullPath);
  } catch {
    // ignore missing files
  }
}

export async function deleteAllAssetImages(assetId: number, filePaths: string[]) {
  await Promise.all(filePaths.map((filePath) => deleteAssetImageFile(filePath)));
  const assetDir = path.join(UPLOAD_ROOT, String(assetId));
  try {
    await unlink(assetDir);
  } catch {
    // ignore if directory not empty or missing
  }
}
