import { ItemLabel } from "@/features/labels/components/item-label";
import { labelSheetsOfPrintJob } from "@/features/labels/lib/item-qr";
import {
  LABEL_PRINT_SHEET_CLASS,
  LABEL_SHEET,
} from "@/lib/constants/labels";
import type { LabelPrintSheetProps } from "@/lib/interfaces/labels";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function LabelPrintSheet({ printJob, onPrinted }: LabelPrintSheetProps) {
  useEffect(() => {
    window.addEventListener("afterprint", onPrinted);
    const printFrame = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(printFrame);
      window.removeEventListener("afterprint", onPrinted);
    };
  }, [printJob.id, onPrinted]);

  return createPortal(
    <div className={LABEL_PRINT_SHEET_CLASS}>
      <style>{`@page { size: ${LABEL_SHEET.pageWidthIn}in ${LABEL_SHEET.pageHeightIn}in; margin: 0; }`}</style>
      {labelSheetsOfPrintJob(printJob).map((sheetLabels, sheetIndex) => (
        <div
          key={sheetIndex}
          className="grid break-after-page content-start overflow-hidden"
          style={{
            width: `${LABEL_SHEET.pageWidthIn}in`,
            height: `${LABEL_SHEET.pageHeightIn}in`,
            padding: `${LABEL_SHEET.topMarginIn}in ${LABEL_SHEET.sideMarginIn}in`,
            gridTemplateColumns: `repeat(${LABEL_SHEET.columns}, ${LABEL_SHEET.labelWidthIn}in)`,
            gridAutoRows: `${LABEL_SHEET.labelHeightIn}in`,
            columnGap: `${LABEL_SHEET.columnGapIn}in`,
            rowGap: `${LABEL_SHEET.rowGapIn}in`,
          }}
        >
          {sheetLabels.map((item, labelIndex) =>
            item ? (
              <ItemLabel key={labelIndex} item={item} />
            ) : (
              <div key={labelIndex} />
            ),
          )}
        </div>
      ))}
    </div>,
    document.body,
  );
}
