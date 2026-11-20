import type { ReactNode } from "react";

export type HotkeyGroup =
  | "general"
  | "navigation"
  | "items"
  | "stockDialog"
  | "overview"
  | "scan";

export type HotkeyId =
  | "showShortcuts"
  | "focusSearch"
  | "dismissToasts"
  | "goOverview"
  | "goScan"
  | "goItems"
  | "goActivity"
  | "itemNew"
  | "itemsPrintLabels"
  | "itemNext"
  | "itemPrevious"
  | "itemAdjust"
  | "itemAddStock"
  | "itemRemoveStock"
  | "itemEdit"
  | "itemPrintLabel"
  | "itemBuyMore"
  | "itemToggleSelected"
  | "itemsSelectAll"
  | "itemsEditTags"
  | "itemDelete"
  | "clearSelection"
  | "stockDialogAdd"
  | "stockDialogRemove"
  | "stockDialogSave"
  | "stockDialogCancel"
  | "removeBuildUnits"
  | "planThreeModuleKits"
  | "planFiveModuleKits"
  | "scanAdjustLast";

export interface HotkeyCombo {
  key: string;
  shift?: boolean;
  mod?: boolean;
}

export interface HotkeyDefinition {
  group: HotkeyGroup;
  keys: HotkeyCombo[];
}

export type HotkeyHandlers = Partial<Record<HotkeyId, () => void>>;

export interface HotkeyRegistration {
  getHandlers: () => HotkeyHandlers;
  isEnabled: () => boolean;
  priority: number;
}

export interface HotkeyHintProps {
  id: HotkeyId;
  className?: string;
  showWhenInactive?: boolean;
}

export interface KbdProps {
  children: ReactNode;
  className?: string;
}
