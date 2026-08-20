export const ASSET_TYPES = [
  "Server",
  "Desktop Computer",
  "Laptop",
  "Notebook",
  "Printer",
  "Other",
] as const;

export const ASSET_STATUSES = [
  "Active",
  "Spare",
  "Repairing",
  "Broken",
  "Retired",
  "Disposed",
] as const;

export const MOVEMENT_REASONS = [
  "Assign",
  "Transfer",
  "Return",
  "Dispose",
  "Update",
] as const;

export const EVENT_TYPES = [
  "CREATE",
  "UPDATE",
  "MOVEMENT",
  "MAINTENANCE",
  "BULK",
  "IMPORT",
  "DELETE",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type MovementReason = (typeof MOVEMENT_REASONS)[number];
export type EventType = (typeof EVENT_TYPES)[number];

export const PAGE_SIZE = 20;
