import type { ChecklistSheetLayout } from "@/lib/interfaces/checklists";
import type { HotkeyId } from "@/lib/interfaces/hotkeys";
import type { ModuleType } from "@inventory/shared";

export const CHECKLIST_SHEET: ChecklistSheetLayout = {
  pageWidthIn: 8.5,
  pageHeightIn: 11,
  columns: 2,
  rows: 3,
  pageMarginIn: 0.25,
  checklistPaddingIn: 0.2,
};

export const CHECKLIST_COPIES_PER_SHEET =
  CHECKLIST_SHEET.columns * CHECKLIST_SHEET.rows;
export const CHECKLIST_SINGLE_COLUMN_MAX_ENTRIES = 12;
export const CHECKLIST_FONT_SIZE_PT = 9;
export const CHECKLIST_TWO_COLUMN_FONT_SIZE_PT = 7.5;
export const CHECKLIST_CUT_LINE_STYLE = "0.5pt dashed #999";
export const CHECKLIST_PRINT_SHEET_CLASS = "checklist-print-sheet";

export const CHECKLIST_PRINT_HOTKEYS: Record<ModuleType, HotkeyId> = {
  feederModule: "printFeederModuleChecklist",
  threeModuleDeviceModule: "printThreeModuleDeviceModuleChecklist",
  fiveModuleDeviceModule: "printFiveModuleDeviceModuleChecklist",
  sortingModule: "printSortingModuleChecklist",
};
