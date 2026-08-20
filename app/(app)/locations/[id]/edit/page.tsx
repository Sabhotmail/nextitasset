import { notFound } from "next/navigation";
import { updateLocationAction, LocationForm } from "@/components/locations/location-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const location = await prisma.location.findUnique({
    where: { id: Number((await params).id) },
  });
  if (!location) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">แก้ไขสถานที่</h1>
      <Card>
        <CardHeader>
          <CardTitle>{location.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationForm action={updateLocationAction.bind(null, location.id)} initial={location} />
        </CardContent>
      </Card>
    </div>
  );
}
