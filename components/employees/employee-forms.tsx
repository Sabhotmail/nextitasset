"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useActionState } from "react";
import {
  createEmployeeAction,
  importEmployeesAction,
  updateEmployeeAction,
} from "@/app/actions/assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
function employeeInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

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
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>พนักงาน</DataTableHeaderCell>
        <DataTableHeaderCell>รหัส</DataTableHeaderCell>
        <DataTableHeaderCell>แผนก / สาขา</DataTableHeaderCell>
        <DataTableHeaderCell>Email</DataTableHeaderCell>
        <DataTableHeaderCell>สถานะ</DataTableHeaderCell>
        <DataTableHeaderCell className="text-right">จัดการ</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {employees.length === 0 ? (
          <DataTableEmpty colSpan={6} message="ยังไม่มีข้อมูลพนักงาน" />
        ) : (
          employees.map((employee) => (
            <DataTableRow key={employee.id}>
              <DataTableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {employeeInitials(employee.firstName, employee.lastName)}
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {employee.firstName} {employee.lastName}
                  </p>
                </div>
              </DataTableCell>
              <DataTableCell>
                <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {employee.empCode}
                </code>
              </DataTableCell>
              <DataTableCell>
                <div className="space-y-1">
                  <p>{employee.department || "—"}</p>
                  {employee.branch && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{employee.branch}</p>
                  )}
                </div>
              </DataTableCell>
              <DataTableCell>
                <span className="text-slate-600 dark:text-slate-300">{employee.email || "—"}</span>
              </DataTableCell>
              <DataTableCell>
                <Badge tone={employee.active ? "Active" : "Retired"}>
                  {employee.active ? "Active" : "Inactive"}
                </Badge>
              </DataTableCell>
              <DataTableCell className="text-right">
                <Link
                  href={`/employees/${employee.id}/edit`}
                  className="inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  แก้ไข
                </Link>
              </DataTableCell>
            </DataTableRow>
          ))
        )}
      </DataTableBody>
    </DataTable>
  );
}

export { createEmployeeAction, updateEmployeeAction };
