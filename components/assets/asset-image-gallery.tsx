"use client";

import Image from "next/image";
import { useActionState } from "react";
import { deleteAssetImageAction, uploadAssetImageAction } from "@/app/actions/asset-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssetImageItem = {
  id: number;
  fileName: string;
  filePath: string;
  caption: string;
};

export function AssetImageGallery({
  assetId,
  images,
  canEdit = true,
}: {
  assetId: number;
  images: AssetImageItem[];
  canEdit?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    uploadAssetImageAction.bind(null, assetId),
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>รูปภาพ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">ยังไม่มีรูปภาพ</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={image.filePath}
                    alt={image.caption || image.fileName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium">{image.fileName}</p>
                  {image.caption && <p className="text-xs text-slate-500">{image.caption}</p>}
                  {canEdit && (
                    <form action={deleteAssetImageAction.bind(null, assetId, image.id)}>
                      <Button type="submit" variant="destructive" size="sm">
                        ลบรูป
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {canEdit && (
          <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-600">
            <div>
              <Label htmlFor={`image-${assetId}`}>เพิ่มรูปภาพ</Label>
              <Input
                id={`image-${assetId}`}
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
              />
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, GIF — สูงสุด 5 MB</p>
            </div>
            <div>
              <Label htmlFor={`caption-${assetId}`}>คำอธิบาย (ไม่บังคับ)</Label>
              <Input id={`caption-${assetId}`} name="caption" placeholder="เช่น ด้านหน้า, สติ๊กเกอร์ S/N" />
            </div>
            {state.message && (
              <p className={`text-sm ${state.message.includes("สำเร็จ") ? "text-green-600" : "text-red-600"}`}>
                {state.message}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
