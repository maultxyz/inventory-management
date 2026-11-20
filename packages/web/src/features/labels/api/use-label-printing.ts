import type { LabelPrintJob } from "@/lib/interfaces/labels";
import type { PrintLabelsFormValues } from "@/schemas/print-labels.schema";
import type { InventoryItem } from "@inventory/shared";
import { useCallback, useState } from "react";

export function useLabelPrinting() {
  const [itemsToLabel, setItemsToLabel] = useState<InventoryItem[] | null>(
    null,
  );
  const [printJob, setPrintJob] = useState<LabelPrintJob | null>(null);
  const finishPrinting = useCallback(() => setPrintJob(null), []);

  return {
    itemsToLabel,
    printJob,
    openPrintLabels: setItemsToLabel,
    closePrintLabels: (open: boolean) => {
      if (!open) setItemsToLabel(null);
    },
    startPrinting: (values: PrintLabelsFormValues) => {
      if (!itemsToLabel) return;
      setPrintJob({ id: Date.now(), items: itemsToLabel, ...values });
      setItemsToLabel(null);
    },
    finishPrinting,
  };
}
