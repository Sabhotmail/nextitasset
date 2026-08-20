"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createEmployeeAction,
  importEmployeesAction,
  updateEmployeeAction,
} from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmployeeForm({
  action,
  initial,
  submitLabel = "บันทึก",
}: {
  action: (prev: { message?: string }, formData: FormData) => Promise<{ message?: string }>;
  initial?: {
    empCode?: string;
    title?: string | null;
    firstName?: string;
    lastName?: string;
    department?: string | null;
    branch?: string | null;
    email?: string | null;
    active?: boolean;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>รหัสพนักงาน</Label>
        <Input name="empCode" defaultValue={initial?.empCode ?? ""} required />
      </div>
      <div>
        <Label>คำนำหน้า</Label>
        <Input name="title" defaultValue={initial?.title ?? ""} />
      </div>
      <div>
        <Label>ชื่อ</Label>
        <Input name="firstName" defaultValue={initial?.firstName ?? ""} required />
      </div>
      <div>
        <Label>นามสกุล</Label>
        <Input name="lastName" defaultValue={initial?.lastName ?? ""} required />
      </div>
      <div>
        <Label>แผนก</Label>
        <Input name="department" defaultValue={initial?.department ?? ""} />
      </div>
      <div>
        <Label>สาขา</Label>
        <Input name="branch" defaultValue={initial?.branch ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label>Email</Label>
        <Input name="email" type="email" defaultValue={initial?.email ?? ""} />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} value="true" />
          Active
        </label>
      </div>
      {state.message && <p className="md:col-span-2 text-sm text-green-600">{state.message}</p>}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function EmployeeImportForm() {
  const [state, formAction, pending] = useActionState(importEmployeesAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>ไฟล์ Excel (emp_code, first_name, last_name, email)</Label>
        <Input name="file" type="file" accept=".xlsx,.xls" required />
      </div>
      {state.message && <p className="text-sm text-green-600">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        นำเข้าพนักงาน
      </Button>
    </form>
  );
}

export function EmployeeTable({
  employees,
}: {
  employees: Array<{
    id: number;
    empCode: string;
    firstName: string;
    lastName: string;
    department: string;
    branch: string;
    email: string;
    active: boolean;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-950">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3 text-left">รหัส</th>
            <th className="px-4 py-3 text-left">ชื่อ</th>
            <th className="px-4 py-3 text-left">แผนก</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-t">
              <td className="px-4 py-3">{employee.empCode}</td>
              <td className="px-4 py-3">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-4 py-3">{employee.department}</td>
              <td className="px-4 py-3">{employee.email}</td>
              <td className="px-4 py-3">
                <Link href={`/employees/${employee.id}/edit`} className="text-blue-600 hover:underline">
                  แก้ไข
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { createEmployeeAction, updateEmployeeAction };
