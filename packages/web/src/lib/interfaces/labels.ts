import type { PrintLabelsFormValues } from "@/schemas/print-labels.schema";
import type { InventoryItem } from "@inventory/shared";
import type { RefObject } from "react";

export interface LabelSheetLayout {
  pageWidthIn: number;
  pageHeightIn: number;
  labelWidthIn: number;
  labelHeightIn: number;
  columns: number;
  rows: number;
  topMarginIn: number;
  sideMarginIn: number;
  columnGapIn: number;
  rowGapIn: number;
}

export interface LabelPrintJob extends PrintLabelsFormValues {
  id: number;
  items: InventoryItem[];
}

export interface QrCodeProps {
  value: string;
  className?: string;
}

export interface ItemLabelProps {
  item: InventoryItem;
}

export interface PrintLabelsDialogProps {
  items: InventoryItem[] | null;
  onOpenChange: (open: boolean) => void;
  onPrint: (values: PrintLabelsFormValues) => void;
}

export interface LabelPrintSheetProps {
  printJob: LabelPrintJob;
  onPrinted: () => void;
}

export type QrScannerStatus =
  | "starting"
  | "scanning"
  | "permissionDenied"
  | "noCamera"
  | "insecureContext"
  | "failed";

export interface UseQrScannerOptions {
  isPaused: boolean;
  onScan: (scannedText: string) => void;
}

export interface DetectedBarcode {
  rawValue: string;
}

export interface NativeBarcodeDetector {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

export interface NativeBarcodeDetectorConstructor {
  new (options: { formats: string[] }): NativeBarcodeDetector;
  getSupportedFormats(): Promise<string[]>;
}

export interface WindowWithBarcodeDetector extends Window {
  BarcodeDetector?: NativeBarcodeDetectorConstructor;
}

export interface QrScannerViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: QrScannerStatus;
  isPaused: boolean;
}

export type ScanFeedback =
  | { kind: "idle" }
  | { kind: "notItemLabel" }
  | { kind: "unknownItem" };
