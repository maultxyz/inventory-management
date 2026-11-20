import { EmptyState } from "@/components/empty-state";
import { HotkeyHint } from "@/components/hotkey-hint";
import { ListSkeleton } from "@/components/list-skeleton";
import { LoadErrorCallout } from "@/components/load-error-callout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useItemDialogs } from "@/features/items/api/use-item-dialogs";
import { useItemActions, useItems } from "@/features/items/api/use-items";
import { AdjustStockDialog } from "@/features/items/components/adjust-stock-dialog";
import {
  itemsNeedingRestock,
  itemsPathFilteredBy,
} from "@/features/items/lib/item-filters";
import { BuildCapacityTiles } from "@/features/kits/components/build-capacity-tiles";
import { focusKitCountField } from "@/features/kits/lib/kit-count-field";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { KitPlanner } from "@/features/kits/components/kit-planner";
import { RemoveBuildUnitsDialog } from "@/features/kits/components/remove-build-units-dialog";
import { OverviewSection } from "@/features/overview/components/overview-section";
import { RestockList } from "@/features/overview/components/restock-list";
import { useStockMovements } from "@/features/stock-movements/api/use-stock-movements";
import { StockMovementList } from "@/features/stock-movements/components/stock-movement-list";
import {
  DASHBOARD_RECENT_MOVEMENTS_LIMIT,
  DASHBOARD_RESTOCK_LIMIT,
} from "@/lib/constants/inventory";
import {
  ACTIVITY_PATH,
  ITEMS_PATH,
  PAGE_BODY_CLASS,
} from "@/lib/constants/nav";
import { isKitPart } from "@inventory/shared";
import {
  IconCircleCheck,
  IconHistory,
  IconPackageExport,
  IconPackages,
  IconTool,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { t } = useTranslation("inventory");
  const items = useItems();
  const stockMovements = useStockMovements();
  const dialogs = useItemDialogs();
  const { removeBuildUnitsFromStock } = useItemActions();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const kitParts = useMemo(() => items.items.filter(isKitPart), [items.items]);
  const restockItems = useMemo(
    () => itemsNeedingRestock(items.items).slice(0, DASHBOARD_RESTOCK_LIMIT),
    [items.items],
  );
  const recentMovements = stockMovements.movements.slice(
    0,
    DASHBOARD_RECENT_MOVEMENTS_LIMIT,
  );
  const isError = items.isError || stockMovements.isError;
  const isPending = items.isPending || stockMovements.isPending;
  const hasKitParts = kitParts.length > 0;

  useHotkeys({
    removeBuildUnits: hasKitParts
      ? () => setIsRemoveDialogOpen(true)
      : undefined,
    planThreeModuleKits: hasKitParts
      ? () => focusKitCountField("threeModuleKits")
      : undefined,
    planFiveModuleKits: hasKitParts
      ? () => focusKitCountField("fiveModuleKits")
      : undefined,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <PageHeader
          title={t("overview.title")}
          description={t("overview.description")}
          actions={
            hasKitParts && (
              <Button onClick={() => setIsRemoveDialogOpen(true)}>
                <IconPackageExport />
                {t("kits.remove.open")}
                <HotkeyHint id="removeBuildUnits" className="max-md:hidden" />
              </Button>
            )
          }
        />
        <div className={PAGE_BODY_CLASS}>
          {isError ? (
            <LoadErrorCallout
              message={t("overview.loadFailed")}
              onRetry={() => {
                void items.refetch();
                void stockMovements.refetch();
              }}
            />
          ) : isPending ? (
            <ListSkeleton rows={6} />
          ) : items.items.length === 0 ? (
            <EmptyState
              icon={IconPackages}
              title={t("overview.welcome.title")}
              description={t("overview.welcome.description")}
              action={
                <Button nativeButton={false} render={<Link to={ITEMS_PATH} />}>
                  {t("overview.welcome.action")}
                </Button>
              }
            />
          ) : (
            <>
              {hasKitParts ? (
                <>
                  <OverviewSection
                    heading={t("kits.capacity.heading")}
                    description={t("kits.capacity.description")}
                    isOnCanvas
                  >
                    <BuildCapacityTiles items={kitParts} />
                  </OverviewSection>
                  <OverviewSection
                    heading={t("kits.planner.heading")}
                    description={t("kits.planner.description")}
                    isOnCanvas
                  >
                    <KitPlanner items={kitParts} />
                  </OverviewSection>
                </>
              ) : (
                <div className="rounded-card border bg-card">
                  <EmptyState
                    size="compact"
                    icon={IconTool}
                    title={t("kits.setup.title")}
                    description={t("kits.setup.description")}
                    action={
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link to={ITEMS_PATH} />}
                      >
                        {t("kits.setup.action")}
                      </Button>
                    }
                  />
                </div>
              )}
              <div className="grid gap-2 md:gap-1.5 lg:grid-cols-2">
                <OverviewSection
                  heading={t("overview.restock.heading")}
                  viewAllTo={itemsPathFilteredBy(ITEMS_PATH, "needsRestock")}
                  viewAllLabel={t("overview.restock.viewAll")}
                >
                  {restockItems.length === 0 ? (
                    <EmptyState
                      size="compact"
                      icon={IconCircleCheck}
                      title={t("overview.restock.emptyTitle")}
                      description={t("overview.restock.emptyDescription")}
                    />
                  ) : (
                    <RestockList
                      items={restockItems}
                      onAdjustStock={dialogs.openAdjustStock}
                    />
                  )}
                </OverviewSection>
                <OverviewSection
                  heading={t("overview.recent.heading")}
                  viewAllTo={ACTIVITY_PATH}
                  viewAllLabel={t("overview.recent.viewAll")}
                >
                  {recentMovements.length === 0 ? (
                    <EmptyState
                      size="compact"
                      icon={IconHistory}
                      title={t("overview.recent.emptyTitle")}
                      description={t("overview.recent.emptyDescription")}
                    />
                  ) : (
                    <StockMovementList movements={recentMovements} />
                  )}
                </OverviewSection>
              </div>
            </>
          )}
        </div>
      </div>
      <AdjustStockDialog
        item={dialogs.itemBeingAdjusted}
        initialDirection={dialogs.adjustDirection}
        onOpenChange={dialogs.closeAdjustStock}
        onSubmit={dialogs.submitStockAdjustment}
      />
      <RemoveBuildUnitsDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        items={kitParts}
        onSubmit={removeBuildUnitsFromStock}
      />
    </div>
  );
}
