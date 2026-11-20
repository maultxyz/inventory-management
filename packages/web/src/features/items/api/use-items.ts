import {
  adjustItemStock,
  bulkAdjustItemStock,
  bulkDeleteItems,
  bulkTagItems,
  createItem,
  deleteItem,
  itemKeys,
  itemsQueryOptions,
  updateItem,
} from "@/features/items/api/items";
import { removeBuildUnits } from "@/features/kits/api/build-unit-removals";
import { stockMovementKeys } from "@/features/stock-movements/api/stock-movements";
import { useAuthSession } from "@/lib/auth";
import { NO_ITEMS } from "@/lib/constants/inventory";
import { formatQuantity } from "@/lib/format";
import type { StockAdjustmentInput } from "@/lib/interfaces/inventory";
import { toast } from "@/lib/toast";
import type {
  BuildUnitRemovalFormValues,
  BulkTagsFormValues,
  CreateItemFormValues,
  InventoryItem,
  Result,
} from "@inventory/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useItems() {
  const { data: session } = useAuthSession();
  const { data, isPending, isError, refetch } = useQuery(
    itemsQueryOptions(session?.user?.id),
  );
  return { items: data ?? NO_ITEMS, isPending, isError, refetch };
}

export function useItemActions() {
  const { t } = useTranslation("inventory");
  const queryClient = useQueryClient();

  const runItemWrite = async <T>(
    write: () => Promise<Result<T>>,
    successMessage: (data: T) => string,
  ): Promise<boolean> => {
    let result: Result<T>;
    try {
      result = await write();
    } catch (error) {
      console.error("Saving the inventory change failed", error);
      toast.error(t("items.toasts.failed"));
      return false;
    }
    if (!result.success) {
      toast.error(result.message ?? t("items.toasts.failed"));
      return false;
    }
    void queryClient.invalidateQueries({ queryKey: itemKeys.root() });
    void queryClient.invalidateQueries({ queryKey: stockMovementKeys.root() });
    toast.success(successMessage(result.data as T));
    return true;
  };

  return {
    addItem: (values: CreateItemFormValues) =>
      runItemWrite(
        () => createItem(values),
        () => t("items.toasts.added", { name: values.name }),
      ),
    saveItem: (item: InventoryItem, values: CreateItemFormValues) =>
      runItemWrite(
        () => updateItem(item.guid, values),
        () => t("items.toasts.saved", { name: values.name }),
      ),
    removeItem: (item: InventoryItem) =>
      runItemWrite(
        () => deleteItem(item.guid),
        () => t("items.toasts.deleted", { name: item.name }),
      ),
    adjustStockOfItems: (
      items: InventoryItem[],
      adjustment: StockAdjustmentInput,
    ) =>
      runItemWrite(
        () =>
          bulkAdjustItemStock({
            itemGuids: items.map((item) => item.guid),
            ...adjustment,
          }),
        ({ itemCount }) =>
          t("items.bulk.toasts.adjusted", { count: itemCount }),
      ),
    editTagsOfItems: (items: InventoryItem[], values: BulkTagsFormValues) =>
      runItemWrite(
        () =>
          bulkTagItems({
            itemGuids: items.map((item) => item.guid),
            ...values,
          }),
        ({ itemCount }) => t("items.bulk.toasts.tagged", { count: itemCount }),
      ),
    removeItems: (items: InventoryItem[]) =>
      runItemWrite(
        () => bulkDeleteItems({ itemGuids: items.map((item) => item.guid) }),
        ({ itemCount }) => t("items.bulk.toasts.deleted", { count: itemCount }),
      ),
    removeBuildUnitsFromStock: (values: BuildUnitRemovalFormValues) =>
      runItemWrite(
        () => removeBuildUnits(values),
        () =>
          t("kits.remove.removed", {
            units: t(`kits.unitCount.${values.buildUnit}`, {
              count: values.count,
            }),
          }),
      ),
    adjustStock: (item: InventoryItem, adjustment: StockAdjustmentInput) =>
      runItemWrite(
        () => adjustItemStock(item.guid, adjustment),
        (adjusted) =>
          t("items.toasts.adjusted", {
            name: adjusted.name,
            quantity: formatQuantity(adjusted.quantity),
          }),
      ),
  };
}
