import { createLocationAction, LocationForm } from "@/components/locations/location-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewLocationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">เพิ่มสถานที่</h1>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสถานที่</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationForm action={createLocationAction} submitLabel="สร้างสถานที่" />
        </CardContent>
      </Card>
    </div>
  );
}
