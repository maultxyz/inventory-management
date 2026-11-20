import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { StockAdjustmentInput } from "@/lib/interfaces/inventory";
import type {
  BulkAdjustStockInput,
  BulkDeleteItemsInput,
  BulkItemsResult,
  BulkTagItemsInput,
  CreateItemFormValues,
  InventoryItem,
  Result,
  UpdateItemFormValues,
} from "@inventory/shared";
import { queryOptions } from "@tanstack/react-query";

export const itemKeys = {
  root: () => ["items"] as const,
  list: (userId: string | undefined) => [...itemKeys.root(), userId] as const,
};

export function itemsQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: itemKeys.list(userId),
    queryFn: async () => {
      const result = await apiGet<Result<InventoryItem[]>>("/api/items");
      if (!result.success || !result.data) {
        throw new Error(result.message ?? "Loading items failed.");
      }
      return result.data;
    },
    enabled: !!userId,
  });
}

export function createItem(values: CreateItemFormValues) {
  return apiPost<Result<InventoryItem>>("/api/items", values);
}

export function updateItem(itemGuid: string, values: UpdateItemFormValues) {
  return apiPut<Result<InventoryItem>>(`/api/items/${itemGuid}`, values);
}

export function deleteItem(itemGuid: string) {
  return apiDelete<Result<null>>(`/api/items/${itemGuid}`);
}

export function adjustItemStock(
  itemGuid: string,
  adjustment: StockAdjustmentInput,
) {
  return apiPost<Result<InventoryItem>>(
    `/api/items/${itemGuid}/stock-adjustments`,
    adjustment,
  );
}

export function bulkAdjustItemStock(input: BulkAdjustStockInput) {
  return apiPost<Result<BulkItemsResult>>(
    "/api/items/bulk-stock-adjustments",
    input,
  );
}

export function bulkTagItems(input: BulkTagItemsInput) {
  return apiPost<Result<BulkItemsResult>>("/api/items/bulk-tags", input);
}

export function bulkDeleteItems(input: BulkDeleteItemsInput) {
  return apiPost<Result<BulkItemsResult>>("/api/items/bulk-deletions", input);
}
