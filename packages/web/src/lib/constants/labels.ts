import type { LabelSheetLayout } from "@/lib/interfaces/labels";
import type { PrintLabelsFormValues } from "@/schemas/print-labels.schema";

export const LABEL_SHEET: LabelSheetLayout = {
  pageWidthIn: 8.5,
  pageHeightIn: 11,
  labelWidthIn: 2.25,
  labelHeightIn: 0.75,
  columns: 3,
  rows: 10,
  topMarginIn: 0.625,
  sideMarginIn: 0.375,
  columnGapIn: 0.5,
  rowGapIn: 0.25,
};

export const LABELS_PER_SHEET = LABEL_SHEET.columns * LABEL_SHEET.rows;
export const LABEL_COPIES_MAX = 50;
export const LABEL_PADDING_IN = 0.05;
export const LABEL_TEXT_SIZE_PER_HEIGHT = 0.13;
export const LABEL_PRINT_SHEET_CLASS = "label-print-sheet";
export const QR_CODE_QUIET_ZONE_MODULES = 2;

export const PRINT_LABELS_FIELDS = ["copies", "labelsAlreadyUsed"] as const;

export const DEFAULT_PRINT_LABELS_FORM: PrintLabelsFormValues = {
  copies: 1,
  labelsAlreadyUsed: 0,
};

export const SCAN_ITEM_PARAM = "item";
export const SCAN_INTERVAL_MS = 40;
export const SCAN_CROP_FRACTION = 0.75;
export const SCAN_CROP_MAX_SIDE_PX = 720;
export const SCAN_CAMERA_IDEAL_WIDTH_PX = 1920;
export const SCAN_CAMERA_IDEAL_HEIGHT_PX = 1080;
export const QR_BARCODE_FORMAT = "qr_code";
export const SCAN_REPEAT_COOLDOWN_MS = 2500;
