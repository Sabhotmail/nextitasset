import { createEmployeeAction, EmployeeForm } from "@/components/employees/employee-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEmployeePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">เพิ่มพนักงาน</h1>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm action={createEmployeeAction} submitLabel="สร้างพนักงาน" />
        </CardContent>
      </Card>
    </div>
  );
}
