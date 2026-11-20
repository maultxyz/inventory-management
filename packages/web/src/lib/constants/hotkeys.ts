import {
  ACTIVITY_PATH,
  HOME_PATH,
  ITEMS_PATH,
  SCAN_PATH,
} from "@/lib/constants/nav";
import type {
  HotkeyDefinition,
  HotkeyGroup,
  HotkeyId,
} from "@/lib/interfaces/hotkeys";

export const HOTKEY_SEQUENCE_TIMEOUT_MS = 1000;

export const HOTKEY_APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/;

export const HOTKEY_APPLE_MOD_LABEL = "⌘";

export const HOTKEY_SEARCH_ATTRIBUTE = "data-hotkey-search";

export const HOTKEY_ITEM_ATTRIBUTE = "data-item-guid";

export const HOTKEY_IGNORED_TARGET_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="combobox"], [role="listbox"], [role="menu"], [role="slider"]';

export const HOTKEY_BLOCKING_OVERLAY_SELECTOR =
  '[role="dialog"], [role="alertdialog"]';

export const HOTKEY_KEY_LABEL_KEYS: Record<string, string> = {
  " ": "hotkeys.keys.space",
  enter: "hotkeys.keys.enter",
  arrowleft: "hotkeys.keys.left",
  arrowright: "hotkeys.keys.right",
  arrowup: "hotkeys.keys.up",
  arrowdown: "hotkeys.keys.down",
  escape: "hotkeys.keys.escape",
  delete: "hotkeys.keys.delete",
  "-": "hotkeys.keys.minus",
};

export const HOTKEY_GROUP_ORDER: HotkeyGroup[] = [
  "general",
  "navigation",
  "items",
  "stockDialog",
  "overview",
  "scan",
];

export const HOTKEYS: Record<HotkeyId, HotkeyDefinition> = {
  showShortcuts: { group: "general", keys: [{ key: "?" }] },
  focusSearch: { group: "general", keys: [{ key: "/" }] },
  dismissToasts: { group: "general", keys: [{ key: "x", shift: true }] },
  goOverview: { group: "navigation", keys: [{ key: "g" }, { key: "o" }] },
  goScan: { group: "navigation", keys: [{ key: "g" }, { key: "s" }] },
  goItems: { group: "navigation", keys: [{ key: "g" }, { key: "i" }] },
  goActivity: { group: "navigation", keys: [{ key: "g" }, { key: "a" }] },
  itemNew: { group: "items", keys: [{ key: "n" }] },
  itemsPrintLabels: { group: "items", keys: [{ key: "p" }] },
  itemNext: { group: "items", keys: [{ key: "arrowdown" }] },
  itemPrevious: { group: "items", keys: [{ key: "arrowup" }] },
  itemAdjust: { group: "items", keys: [{ key: "a" }] },
  itemAddStock: { group: "items", keys: [{ key: "+" }] },
  itemRemoveStock: { group: "items", keys: [{ key: "-" }] },
  itemEdit: { group: "items", keys: [{ key: "e" }] },
  itemPrintLabel: { group: "items", keys: [{ key: "l" }] },
  itemBuyMore: { group: "items", keys: [{ key: "b" }] },
  itemToggleSelected: { group: "items", keys: [{ key: "x" }] },
  itemsSelectAll: { group: "items", keys: [{ key: "a", shift: true }] },
  itemsEditTags: { group: "items", keys: [{ key: "t" }] },
  itemDelete: { group: "items", keys: [{ key: "delete" }] },
  clearSelection: { group: "items", keys: [{ key: "escape" }] },
  stockDialogAdd: { group: "stockDialog", keys: [{ key: "+" }] },
  stockDialogRemove: { group: "stockDialog", keys: [{ key: "-" }] },
  stockDialogSave: { group: "stockDialog", keys: [{ key: "enter" }] },
  stockDialogCancel: { group: "stockDialog", keys: [{ key: "escape" }] },
  removeBuildUnits: { group: "overview", keys: [{ key: "r" }] },
  planThreeModuleKits: { group: "overview", keys: [{ key: "3" }] },
  planFiveModuleKits: { group: "overview", keys: [{ key: "5" }] },
  scanAdjustLast: { group: "scan", keys: [{ key: "a" }] },
};

export const HOTKEY_ROUTES = {
  goOverview: HOME_PATH,
  goScan: SCAN_PATH,
  goItems: ITEMS_PATH,
  goActivity: ACTIVITY_PATH,
} as const satisfies Partial<Record<HotkeyId, string>>;

export const NAV_HOTKEY_BY_PATH: Record<string, HotkeyId> = {
  [HOME_PATH]: "goOverview",
  [SCAN_PATH]: "goScan",
  [ITEMS_PATH]: "goItems",
  [ACTIVITY_PATH]: "goActivity",
};

export const STOCK_DIALOG_DIRECTION_KEYS: Record<string, "add" | "remove"> = {
  "+": "add",
  "=": "add",
  "-": "remove",
};
