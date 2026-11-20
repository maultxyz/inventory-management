import { useItemActions } from "@/features/items/api/use-items";
import type {
  StockAdjustmentDirection,
  StockAdjustmentInput,
} from "@/lib/interfaces/inventory";
import type { BulkTagsFormValues, InventoryItem } from "@inventory/shared";
import { useState } from "react";

export function useItemBulkDialogs(onDone: () => void) {
  const { adjustStockOfItems, editTagsOfItems, removeItems } = useItemActions();
  const [itemsBeingAdjusted, setItemsBeingAdjusted] = useState<
    InventoryItem[] | null
  >(null);
  const [bulkAdjustDirection, setBulkAdjustDirection] =
    useState<StockAdjustmentDirection>("add");
  const [itemsBeingTagged, setItemsBeingTagged] = useState<
    InventoryItem[] | null
  >(null);
  const [itemsBeingDeleted, setItemsBeingDeleted] = useState<
    InventoryItem[] | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const finishing = async (write: Promise<boolean>) => {
    const isDone = await write;
    if (isDone) onDone();
    return isDone;
  };

  return {
    itemsBeingAdjusted,
    bulkAdjustDirection,
    itemsBeingTagged,
    itemsBeingDeleted,
    isDeleting,
    openBulkAdjustStock: (
      items: InventoryItem[],
      direction: StockAdjustmentDirection = "add",
    ) => {
      setBulkAdjustDirection(direction);
      setItemsBeingAdjusted(items);
    },
    openBulkTags: setItemsBeingTagged,
    openBulkDelete: setItemsBeingDeleted,
    closeBulkAdjustStock: (open: boolean) => {
      if (!open) setItemsBeingAdjusted(null);
    },
    closeBulkTags: (open: boolean) => {
      if (!open) setItemsBeingTagged(null);
    },
    closeBulkDelete: (open: boolean) => {
      if (!open) setItemsBeingDeleted(null);
    },
    submitBulkAdjustment: async (adjustment: StockAdjustmentInput) =>
      itemsBeingAdjusted
        ? finishing(adjustStockOfItems(itemsBeingAdjusted, adjustment))
        : false,
    submitBulkTags: async (values: BulkTagsFormValues) =>
      itemsBeingTagged
        ? finishing(editTagsOfItems(itemsBeingTagged, values))
        : false,
    confirmBulkDelete: async () => {
      if (!itemsBeingDeleted) return;
      setIsDeleting(true);
      const isDeleted = await finishing(removeItems(itemsBeingDeleted));
      setIsDeleting(false);
      if (isDeleted) setItemsBeingDeleted(null);
    },
  };
}
