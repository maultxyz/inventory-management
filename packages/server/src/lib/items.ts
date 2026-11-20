import {
  priceToCents,
  type InventoryItem,
  type UpdateItemFormValues,
} from "@inventory/shared";
import { z } from "zod";
import type { items } from "../db/schema";

const itemGuidSchema = z.uuid();

export function isItemGuid(value: string): boolean {
  return itemGuidSchema.safeParse(value).success;
}

export function toInventoryItem(row: typeof items.$inferSelect): InventoryItem {
  return {
    guid: row.guid,
    name: row.name,
    location: row.location,
    quantity: row.quantity,
    reorderLevel: row.reorderLevel,
    lotPriceCents: row.lotPriceCents,
    unitsPerLot: row.unitsPerLot,
    feederModuleQuantity: row.feederModuleQuantity,
    deviceModuleQuantity: row.deviceModuleQuantity,
    sortingModuleQuantity: row.sortingModuleQuantity,
    purchaseUrl: row.purchaseUrl,
    tags: row.tags,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toItemDetailColumns(values: UpdateItemFormValues) {
  return {
    name: values.name,
    location: values.location || null,
    reorderLevel: values.reorderLevel,
    lotPriceCents: priceToCents(values.lotPrice),
    unitsPerLot: values.unitsPerLot,
    feederModuleQuantity: values.feederModuleQuantity,
    deviceModuleQuantity: values.deviceModuleQuantity,
    sortingModuleQuantity: values.sortingModuleQuantity,
    purchaseUrl: values.purchaseUrl || null,
    tags: values.tags,
    notes: values.notes || null,
  };
}
