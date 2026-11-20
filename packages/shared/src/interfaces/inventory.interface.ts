import type {
  BUILD_UNITS,
  BULK_TAG_MODES,
  STOCK_ADJUSTMENT_REASONS,
  STOCK_MOVEMENT_REASONS,
} from "../constants/inventory.constant";

export type StockMovementReason = (typeof STOCK_MOVEMENT_REASONS)[number];
export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

export interface InventoryItem {
  guid: string;
  name: string;
  location: string | null;
  quantity: number;
  reorderLevel: number;
  lotPriceCents: number;
  unitsPerLot: number;
  feederModuleQuantity: number;
  deviceModuleQuantity: number;
  sortingModuleQuantity: number;
  purchaseUrl: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BuildUnit = (typeof BUILD_UNITS)[number];
export type BulkTagMode = (typeof BULK_TAG_MODES)[number];

export interface BulkItemsResult {
  itemCount: number;
}

export interface ModuleCounts {
  feederModules: number;
  deviceModules: number;
  sortingModules: number;
}

export interface KitCounts {
  threeModuleKits: number;
  fiveModuleKits: number;
}

export interface PartNeed {
  itemGuid: string;
  itemName: string;
  quantityNeeded: number;
  quantityInStock: number;
  quantityMissing: number;
}

export interface BuildCapacity {
  buildUnit: BuildUnit;
  hasAssignedParts: boolean;
  buildableCount: number;
  limitingItemNames: string[];
}

export interface StockMovement {
  guid: string;
  itemGuid: string;
  itemName: string;
  quantityChange: number;
  quantityAfter: number;
  reason: StockMovementReason;
  note: string | null;
  createdAt: string;
}

export type StockStatus = "inStock" | "lowStock" | "outOfStock";
