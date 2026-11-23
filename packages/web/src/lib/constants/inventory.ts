import { ALL_TAGS_FILTER } from "@/lib/constants/tags";
import type {
  ItemFilters,
  StockAdjustmentDirection,
  StockStatusFilter,
} from "@/lib/interfaces/inventory";
import type { AdjustStockDialogFormValues } from "@/schemas/adjust-stock.schema";
import type {
  BuildUnitRemovalFormValues,
  BulkTagsFormValues,
  CreateItemFormValues,
  InventoryItem,
  KitCounts,
  StockAdjustmentReason,
  StockMovement,
  StockStatus,
} from "@inventory/shared";

export const INVENTORY_CURRENCY = "USD";

export const NO_ITEMS: InventoryItem[] = [];
export const NO_STOCK_MOVEMENTS: StockMovement[] = [];

export const SEARCH_PARAM = "q";
export const STATUS_PARAM = "status";

export const STOCK_STATUS_FILTERS: StockStatusFilter[] = [
  "all",
  "inStock",
  "needsRestock",
  "lowStock",
  "outOfStock",
];

export const DEFAULT_ITEM_FILTERS: ItemFilters = {
  searchText: "",
  tag: ALL_TAGS_FILTER,
  status: "all",
};

export const STOCK_STATUS_BADGE_VARIANT: Record<
  StockStatus,
  "success" | "warning" | "destructive"
> = {
  inStock: "success",
  lowStock: "warning",
  outOfStock: "destructive",
};

export const EMPTY_ITEM_FORM: CreateItemFormValues = {
  name: "",
  location: "",
  quantity: 0,
  reorderLevel: 0,
  lotPrice: "",
  unitsPerLot: 1,
  feederModuleQuantity: 0,
  deviceModuleQuantity: 0,
  sortingModuleQuantity: 0,
  fiveModuleDeviceExtraQuantity: 0,
  purchaseUrl: "",
  tags: [],
  notes: "",
};

export const MODULE_QUANTITY_FIELDS = [
  "feederModuleQuantity",
  "deviceModuleQuantity",
  "sortingModuleQuantity",
  "fiveModuleDeviceExtraQuantity",
] as const;

export const EMPTY_KIT_COUNTS: KitCounts = {
  threeModuleKits: 0,
  fiveModuleKits: 0,
};

export const EMPTY_BUILD_UNIT_REMOVAL_FORM: BuildUnitRemovalFormValues = {
  buildUnit: "threeModuleKit",
  count: 1,
};

export const UNIT_COST_MAX_FRACTION_DIGITS = 4;

export const EMPTY_BULK_TAGS_FORM: BulkTagsFormValues = {
  mode: "add",
  tags: [],
};

export const KIT_COUNTS_STORAGE_KEY = "stockroom:kit-counts";

export const ADJUSTMENT_REASONS_BY_DIRECTION: Record<
  StockAdjustmentDirection,
  StockAdjustmentReason[]
> = {
  add: ["received", "returned", "adjusted"],
  remove: ["sold", "damaged", "adjusted"],
};

export const STOCK_ADJUSTMENT_DIRECTIONS: StockAdjustmentDirection[] = [
  "add",
  "remove",
];

export const EMPTY_ADJUST_STOCK_FORM: AdjustStockDialogFormValues = {
  direction: "add",
  quantity: 1,
  reason: "received",
  note: "",
};

export const DASHBOARD_RESTOCK_LIMIT = 8;
export const DASHBOARD_RECENT_MOVEMENTS_LIMIT = 8;

export const FILTER_SELECT_TRIGGER_CLASS =
  "max-sm:w-auto max-sm:min-w-0 max-sm:flex-1";
