import type { ModuleChecklistEntry, ModuleType } from "@inventory/shared";

export interface ChecklistSheetLayout {
  pageWidthIn: number;
  pageHeightIn: number;
  columns: number;
  rows: number;
  pageMarginIn: number;
  checklistPaddingIn: number;
}

export interface ModuleChecklist {
  moduleType: ModuleType;
  entries: ModuleChecklistEntry[];
}

export interface ChecklistPrintJob extends ModuleChecklist {
  id: number;
}

export interface ModuleChecklistCardProps {
  checklist: ModuleChecklist;
  onPrint: (checklist: ModuleChecklist) => void;
}

export interface PrintedModuleChecklistProps {
  checklist: ModuleChecklist;
  cutLineSides: { right: boolean; bottom: boolean };
}

export interface ChecklistPrintSheetProps {
  printJob: ChecklistPrintJob;
  onPrinted: () => void;
}
