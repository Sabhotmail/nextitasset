import { notFound } from "next/navigation";
import { updateEmployeeAction, EmployeeForm } from "@/components/employees/employee-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const employee = await prisma.employee.findUnique({
    where: { id: Number((await params).id) },
  });
  if (!employee) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">แก้ไขพนักงาน</h1>
      <Card>
        <CardHeader>
          <CardTitle>{employee.empCode}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            action={updateEmployeeAction.bind(null, employee.id)}
            initial={employee}
          />
        </CardContent>
      </Card>
    </div>
  );
}
