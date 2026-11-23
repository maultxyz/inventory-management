export const ITEM_NAME_MAX_LENGTH = 120;
export const ITEM_LOCATION_MAX_LENGTH = 60;
export const ITEM_NOTES_MAX_LENGTH = 1000;
export const ITEM_PURCHASE_URL_MAX_LENGTH = 2000;
export const ITEM_TAG_MAX_LENGTH = 30;
export const ITEM_TAGS_MAX = 10;
export const BULK_ITEMS_MAX = 500;
export const BULK_TAG_MODES = ["add", "remove"] as const;
export const ITEM_QUANTITY_MAX = 1_000_000;
export const ITEM_LOT_PRICE_MAX = 1_000_000;
export const ITEM_UNITS_PER_LOT_MAX = 1_000_000;
export const STOCK_MOVEMENT_NOTE_MAX_LENGTH = 200;
export const STOCK_MOVEMENTS_PAGE_SIZE = 100;

export const ITEM_MODULE_QUANTITY_MAX = 1000;
export const BUILD_UNIT_REMOVAL_COUNT_MAX = 1000;
export const KIT_PLAN_COUNT_MAX = 10_000;

export const BUILD_UNITS = [
  "threeModuleKit",
  "fiveModuleKit",
  "feederModule",
  "threeModuleDeviceModule",
  "fiveModuleDeviceModule",
  "sortingModule",
] as const;

export const MODULE_TYPES = [
  "feederModule",
  "threeModuleDeviceModule",
  "fiveModuleDeviceModule",
  "sortingModule",
] as const satisfies readonly (typeof BUILD_UNITS)[number][];

export const STOCK_MOVEMENT_REASONS = [
  "created",
  "packed",
  "received",
  "sold",
  "returned",
  "damaged",
  "adjusted",
] as const;

export const STOCK_ADJUSTMENT_REASONS = [
  "received",
  "sold",
  "returned",
  "damaged",
  "adjusted",
] as const;

export const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
