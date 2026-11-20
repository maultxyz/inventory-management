import { apiGet } from "@/lib/api/client";
import type { Result, StockMovement } from "@inventory/shared";
import { queryOptions } from "@tanstack/react-query";

export const stockMovementKeys = {
  root: () => ["stock-movements"] as const,
  list: (userId: string | undefined) =>
    [...stockMovementKeys.root(), userId] as const,
};

export function stockMovementsQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: stockMovementKeys.list(userId),
    queryFn: async () => {
      const result = await apiGet<Result<StockMovement[]>>(
        "/api/stock-movements",
      );
      if (!result.success || !result.data) {
        throw new Error(result.message ?? "Loading stock movements failed.");
      }
      return result.data;
    },
    enabled: !!userId,
  });
}
