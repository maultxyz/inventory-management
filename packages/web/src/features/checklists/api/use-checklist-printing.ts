import type {
  ChecklistPrintJob,
  ModuleChecklist,
} from "@/lib/interfaces/checklists";
import { useCallback, useState } from "react";

export function useChecklistPrinting() {
  const [printJob, setPrintJob] = useState<ChecklistPrintJob | null>(null);
  const finishPrinting = useCallback(() => setPrintJob(null), []);

  return {
    printJob,
    printChecklist: (checklist: ModuleChecklist) =>
      setPrintJob({ id: Date.now(), ...checklist }),
    finishPrinting,
  };
}
