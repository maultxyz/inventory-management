import { PrintedModuleChecklist } from "@/features/checklists/components/printed-module-checklist";
import {
  CHECKLIST_COPIES_PER_SHEET,
  CHECKLIST_PRINT_SHEET_CLASS,
  CHECKLIST_SHEET,
} from "@/lib/constants/checklists";
import type { ChecklistPrintSheetProps } from "@/lib/interfaces/checklists";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ChecklistPrintSheet({
  printJob,
  onPrinted,
}: ChecklistPrintSheetProps) {
  useEffect(() => {
    window.addEventListener("afterprint", onPrinted);
    const printFrame = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(printFrame);
      window.removeEventListener("afterprint", onPrinted);
    };
  }, [printJob.id, onPrinted]);

  const { pageWidthIn, pageHeightIn, pageMarginIn, columns, rows } =
    CHECKLIST_SHEET;

  return createPortal(
    <div className={CHECKLIST_PRINT_SHEET_CLASS}>
      <style>{`@page { size: ${pageWidthIn}in ${pageHeightIn}in; margin: 0; }`}</style>
      <div
        className="grid overflow-hidden"
        style={{
          width: `${pageWidthIn}in`,
          height: `${pageHeightIn}in`,
          padding: `${pageMarginIn}in`,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: CHECKLIST_COPIES_PER_SHEET }, (_, copyIndex) => (
          <PrintedModuleChecklist
            key={copyIndex}
            checklist={printJob}
            cutLineSides={{
              right: copyIndex % columns < columns - 1,
              bottom: Math.floor(copyIndex / columns) < rows - 1,
            }}
          />
        ))}
      </div>
    </div>,
    document.body,
  );
}
