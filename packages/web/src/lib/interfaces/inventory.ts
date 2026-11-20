import type {
  BuildUnitRemovalFormValues,
  BulkTagsFormValues,
  CreateItemFormValues,
  PartNeed,
  InventoryItem,
  StockAdjustmentReason,
  StockMovement,
  StockStatus,
} from "@inventory/shared";
import type { KeyboardEventHandler } from "react";

export type StockStatusFilter = StockStatus | "all" | "needsRestock";

export interface ItemFilters {
  searchText: string;
  tag: string;
  status: StockStatusFilter;
}

export type StockAdjustmentDirection = "add" | "remove";

export interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  tagSuggestions: string[];
  onSubmit: (values: CreateItemFormValues) => Promise<boolean>;
}

export interface AdjustStockDialogProps {
  item: InventoryItem | null;
  initialDirection?: StockAdjustmentDirection;
  onOpenChange: (open: boolean) => void;
  onSubmit: (adjustment: StockAdjustmentInput) => Promise<boolean>;
}

export interface StockAdjustmentInput {
  quantityChange: number;
  reason: StockAdjustmentReason;
  note: string;
}

export interface ItemActionHandlers {
  onAdjustStock: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onPrintLabel: (item: InventoryItem) => void;
}

export type ItemSelectionState = "none" | "some" | "all";

export interface ItemListProps extends ItemActionHandlers {
  items: InventoryItem[];
  activeItemGuid: string | null;
  selectedItemGuids: ReadonlySet<string>;
  selectionState: ItemSelectionState;
  onToggleSelected: (item: InventoryItem) => void;
  onToggleAllSelected: () => void;
}

export interface ItemSelectionBarProps {
  selectedCount: number;
  onAdjustStock: () => void;
  onEditTags: () => void;
  onPrintLabels: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export interface AdjustStockFormProps {
  description: string;
  quantityInStock: number;
  showsQuantityAfter: boolean;
  initialDirection?: StockAdjustmentDirection;
  onOpenChange: (open: boolean) => void;
  onSubmit: (adjustment: StockAdjustmentInput) => Promise<boolean>;
}

export interface BulkAdjustStockDialogProps {
  items: InventoryItem[] | null;
  initialDirection?: StockAdjustmentDirection;
  onOpenChange: (open: boolean) => void;
  onSubmit: (adjustment: StockAdjustmentInput) => Promise<boolean>;
}

export interface BulkTagsDialogProps {
  items: InventoryItem[] | null;
  tagSuggestions: string[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BulkTagsFormValues) => Promise<boolean>;
}

export interface ItemRowActionsProps extends ItemActionHandlers {
  item: InventoryItem;
  layout?: "row" | "card";
}

export interface ItemsToolbarProps {
  filters: ItemFilters;
  tags: string[];
  onFiltersChange: (filters: Partial<ItemFilters>) => void;
}

export interface StockStatusBadgeProps {
  item: Pick<InventoryItem, "quantity" | "reorderLevel">;
}

export interface StatTileProps {
  label: string;
  value: string;
  tone?: "primary" | "warning";
  caption?: string;
}

export interface BuildCapacityTilesProps {
  items: InventoryItem[];
}

export interface KitPlannerProps {
  items: InventoryItem[];
}

export interface PartNeedsTableProps {
  partNeeds: PartNeed[];
  caption: string;
}

export interface RemoveBuildUnitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onSubmit: (values: BuildUnitRemovalFormValues) => Promise<boolean>;
}

export interface RestockListProps {
  items: InventoryItem[];
  onAdjustStock: (item: InventoryItem) => void;
}

export interface StockMovementListProps {
  movements: StockMovement[];
}

export interface QuantityChangeProps {
  quantityChange: number;
}

export interface WholeNumberInputProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  min?: number;
  invalid?: boolean;
  autoFocus?: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}
