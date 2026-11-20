import { LABELS_PER_SHEET, SCAN_ITEM_PARAM } from "@/lib/constants/labels";
import { SCAN_PATH } from "@/lib/constants/nav";
import type { LabelPrintJob } from "@/lib/interfaces/labels";
import type { InventoryItem } from "@inventory/shared";
import { z } from "zod";

const itemGuidSchema = z.uuid();

export function itemScanUrl(appOrigin: string, itemGuid: string): string {
  return `${appOrigin}${SCAN_PATH}?${new URLSearchParams({ [SCAN_ITEM_PARAM]: itemGuid })}`;
}

export function itemGuidFromScannedText(scannedText: string): string | null {
  const trimmedText = scannedText.trim();
  let candidate: string | null = trimmedText;
  if (/^https?:\/\//i.test(trimmedText)) {
    try {
      candidate = new URL(trimmedText).searchParams.get(SCAN_ITEM_PARAM);
    } catch {
      candidate = null;
    }
  }
  const parsed = itemGuidSchema.safeParse(candidate?.toLowerCase());
  return parsed.success ? parsed.data : null;
}

export function labelSheetsOfPrintJob(
  printJob: Pick<LabelPrintJob, "items" | "copies" | "labelsAlreadyUsed">,
): (InventoryItem | null)[][] {
  const labelPositions: (InventoryItem | null)[] = [
    ...Array.from({ length: printJob.labelsAlreadyUsed }, () => null),
    ...printJob.items.flatMap((item) =>
      Array.from({ length: printJob.copies }, () => item),
    ),
  ];
  const sheets: (InventoryItem | null)[][] = [];
  for (let start = 0; start < labelPositions.length; start += LABELS_PER_SHEET) {
    sheets.push(labelPositions.slice(start, start + LABELS_PER_SHEET));
  }
  return sheets;
}
