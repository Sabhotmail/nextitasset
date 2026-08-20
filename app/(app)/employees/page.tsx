import Link from "next/link";
import {
  createEmployeeAction,
  EmployeeForm,
  EmployeeImportForm,
  EmployeeTable,
} from "@/components/employees/employee-forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({ orderBy: { firstName: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">พนักงาน</h1>
          <p className="text-slate-500">Master data สำหรับผู้ถือครองสินทรัพย์</p>
        </div>
        <Link href="/employees/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white">
          เพิ่มพนักงาน
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>นำเข้าพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeImportForm />
        </CardContent>
      </Card>

      <EmployeeTable employees={employees} />
    </div>
  );
}
