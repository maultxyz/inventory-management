import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { LoadErrorCallout } from "@/components/load-error-callout";
import { PageHeader } from "@/components/page-header";
import { useStockMovements } from "@/features/stock-movements/api/use-stock-movements";
import { StockMovementList } from "@/features/stock-movements/components/stock-movement-list";
import { StockMovementsTable } from "@/features/stock-movements/components/stock-movements-table";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  COMPACT_LAYOUT_MAX_WIDTH_PX,
  PAGE_BODY_CLASS,
} from "@/lib/constants/nav";
import { STOCK_MOVEMENTS_PAGE_SIZE } from "@inventory/shared";
import { IconHistory } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function ActivityPage() {
  const { t } = useTranslation("inventory");
  const isCompactLayout = useIsMobile(COMPACT_LAYOUT_MAX_WIDTH_PX);
  const { movements, isPending, isError, refetch } = useStockMovements();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <PageHeader
          title={t("activity.title")}
          description={t("activity.description", {
            count: STOCK_MOVEMENTS_PAGE_SIZE,
          })}
        />
        <div className={PAGE_BODY_CLASS}>
          {isError ? (
            <LoadErrorCallout
              message={t("activity.loadFailed")}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <ListSkeleton rows={8} />
          ) : movements.length === 0 ? (
            <EmptyState
              icon={IconHistory}
              title={t("activity.empty.title")}
              description={t("activity.empty.description")}
            />
          ) : isCompactLayout ? (
            <div className="rounded-card border bg-card px-4 py-1">
              <StockMovementList movements={movements} />
            </div>
          ) : (
            <StockMovementsTable movements={movements} />
          )}
        </div>
      </div>
    </div>
  );
}
