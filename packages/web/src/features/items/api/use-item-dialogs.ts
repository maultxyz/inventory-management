import { useItemActions } from "@/features/items/api/use-items";
import type {
  StockAdjustmentDirection,
  StockAdjustmentInput,
} from "@/lib/interfaces/inventory";
import type { CreateItemFormValues, InventoryItem } from "@inventory/shared";
import { useCallback, useState } from "react";

export function useItemDialogs() {
  const { addItem, saveItem, removeItem, adjustStock } = useItemActions();
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] = useState<InventoryItem | null>(
    null,
  );
  const [itemBeingAdjusted, setItemBeingAdjusted] =
    useState<InventoryItem | null>(null);
  const [itemBeingDeleted, setItemBeingDeleted] =
    useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adjustDirection, setAdjustDirection] =
    useState<StockAdjustmentDirection>("add");
  const openAdjustStock = useCallback(
    (item: InventoryItem, direction: StockAdjustmentDirection = "add") => {
      setAdjustDirection(direction);
      setItemBeingAdjusted(item);
    },
    [],
  );

  return {
    isItemFormOpen,
    itemBeingEdited,
    itemBeingAdjusted,
    adjustDirection,
    itemBeingDeleted,
    isDeleting,
    openAddItem: () => {
      setItemBeingEdited(null);
      setIsItemFormOpen(true);
    },
    openEditItem: (item: InventoryItem) => {
      setItemBeingEdited(item);
      setIsItemFormOpen(true);
    },
    openAdjustStock,
    openDeleteItem: setItemBeingDeleted,
    setIsItemFormOpen,
    closeAdjustStock: (open: boolean) => {
      if (!open) setItemBeingAdjusted(null);
    },
    closeDeleteItem: (open: boolean) => {
      if (!open) setItemBeingDeleted(null);
    },
    submitItemForm: (values: CreateItemFormValues) =>
      itemBeingEdited ? saveItem(itemBeingEdited, values) : addItem(values),
    submitStockAdjustment: async (adjustment: StockAdjustmentInput) =>
      itemBeingAdjusted ? adjustStock(itemBeingAdjusted, adjustment) : false,
    confirmDeleteItem: async () => {
      if (!itemBeingDeleted) return;
      setIsDeleting(true);
      const isDeleted = await removeItem(itemBeingDeleted);
      setIsDeleting(false);
      if (isDeleted) setItemBeingDeleted(null);
    },
  };
}
