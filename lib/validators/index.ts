import { z } from "zod";
import { ASSET_STATUSES, ASSET_TYPES } from "@/lib/constants";

export const assetFormSchema = z.object({
  type: z.enum(ASSET_TYPES),
  status: z.enum(ASSET_STATUSES),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNo: z.string().min(1, "กรุณาระบุ S/N"),
  monitorSn: z.string().optional().nullable(),
  mac: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  msOffice: z.string().optional().nullable(),
  assetNo: z.string().optional().nullable(),
  email: z.string().email("รูปแบบ email ไม่ถูกต้อง").optional().or(z.literal("")).nullable(),
  acquisitionDate: z.string().optional().nullable(),
  assetLocation: z.string().optional().nullable(),
  remark: z.string().optional().nullable(),
  assignedToId: z.coerce.number().optional().nullable(),
  locationId: z.coerce.number().optional().nullable(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const movementFormSchema = z.object({
  reason: z.enum(["Assign", "Transfer", "Return", "Dispose", "Update"]),
  assignedToId: z.coerce.number().optional().nullable(),
  locationId: z.coerce.number().optional().nullable(),
  status: z.enum(ASSET_STATUSES).optional(),
  note: z.string().optional().nullable(),
});

export type MovementFormValues = z.infer<typeof movementFormSchema>;

export const employeeFormSchema = z.object({
  empCode: z.string().min(1, "กรุณาระบุรหัสพนักงาน"),
  title: z.string().optional().nullable(),
  firstName: z.string().min(1, "กรุณาระบุชื่อ"),
  lastName: z.string().min(1, "กรุณาระบุนามสกุล"),
  department: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  active: z.coerce.boolean().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const locationFormSchema = z.object({
  code: z.string().optional().nullable(),
  name: z.string().min(1, "กรุณาระบุชื่อสถานที่"),
  note: z.string().optional().nullable(),
  active: z.coerce.boolean().optional(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export const maintenanceFormSchema = z.object({
  servicedAt: z.string().min(1, "กรุณาระบุวันที่"),
  subject: z.string().min(1, "กรุณาระบุหัวข้อ"),
  detail: z.string().optional().nullable(),
  cost: z.coerce.number().optional().nullable(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export const bulkActionSchema = z.object({
  action: z.enum(["status", "dispose", "clear_assignee", "move_location"]),
  assetIds: z.array(z.coerce.number()).min(1),
  status: z.enum(ASSET_STATUSES).optional(),
  locationId: z.coerce.number().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type BulkActionValues = z.infer<typeof bulkActionSchema>;

export function cleanOptionalString(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseOptionalDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
