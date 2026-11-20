import { stockMovementsQueryOptions } from "@/features/stock-movements/api/stock-movements";
import { useAuthSession } from "@/lib/auth";
import { NO_STOCK_MOVEMENTS } from "@/lib/constants/inventory";
import { useQuery } from "@tanstack/react-query";

export function useStockMovements() {
  const { data: session } = useAuthSession();
  const { data, isPending, isError, refetch } = useQuery(
    stockMovementsQueryOptions(session?.user?.id),
  );
  return {
    movements: data ?? NO_STOCK_MOVEMENTS,
    isPending,
    isError,
    refetch,
  };
}
