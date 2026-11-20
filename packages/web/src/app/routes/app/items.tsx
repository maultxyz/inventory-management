import { ConfirmDialog } from "@/components/confirm-dialog";
import { HotkeyHint } from "@/components/hotkey-hint";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { LoadErrorCallout } from "@/components/load-error-callout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useItemBulkDialogs } from "@/features/items/api/use-item-bulk-dialogs";
import { useItemDialogs } from "@/features/items/api/use-item-dialogs";
import { useItemSelection } from "@/features/items/api/use-item-selection";
import { useItems } from "@/features/items/api/use-items";
import {
  AdjustStockDialog,
  BulkAdjustStockDialog,
} from "@/features/items/components/adjust-stock-dialog";
import { BulkTagsDialog } from "@/features/items/components/bulk-tags-dialog";
import { ItemSelectionBar } from "@/features/items/components/item-selection-bar";
import { ItemFormDialog } from "@/features/items/components/item-form-dialog";
import { ItemsTable } from "@/features/items/components/items-table";
import { ItemsToolbar } from "@/features/items/components/items-toolbar";
import { MobileItemList } from "@/features/items/components/mobile-item-list";
import {
  openPurchaseLink,
  purchaseUrlOf,
} from "@/features/items/lib/purchase-link";
import { useLabelPrinting } from "@/features/labels/api/use-label-printing";
import { LabelPrintSheet } from "@/features/labels/components/label-print-sheet";
import { PrintLabelsDialog } from "@/features/labels/components/print-labels-dialog";
import {
  filterItems,
  hasActiveItemFilters,
  readItemFilters,
  writeItemFilters,
} from "@/features/items/lib/item-filters";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { HOTKEY_ITEM_ATTRIBUTE } from "@/lib/constants/hotkeys";
import {
  COMPACT_LAYOUT_MAX_WIDTH_PX,
  PAGE_BODY_CLASS,
} from "@/lib/constants/nav";
import type { ItemFilters } from "@/lib/interfaces/inventory";
import {
  IconPackages,
  IconPlus,
  IconPrinter,
  IconSearchOff,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { tagsOfItems } from "@inventory/shared";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function ItemsPage() {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const isCompactLayout = useIsMobile(COMPACT_LAYOUT_MAX_WIDTH_PX);
  const isPhoneLayout = useIsMobile();
  const { items, isPending, isError, refetch } = useItems();
  const dialogs = useItemDialogs();
  const labelPrinting = useLabelPrinting();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readItemFilters(searchParams), [searchParams]);
  const tags = useMemo(() => tagsOfItems(items), [items]);
  const shownItems = useMemo(
    () => filterItems(items, filters),
    [items, filters],
  );

  const changeFilters = (changedFilters: Partial<ItemFilters>) =>
    setSearchParams(writeItemFilters({ ...filters, ...changedFilters }), {
      replace: true,
    });

  const selection = useItemSelection(shownItems);
  const bulkDialogs = useItemBulkDialogs(selection.clearSelection);
  const { selectedItems } = selection;
  const hasSelection = selectedItems.length > 0;

  const [activeItemGuid, setActiveItemGuid] = useState<string | null>(null);
  const activeItemIndex = shownItems.findIndex(
    (item) => item.guid === activeItemGuid,
  );
  const activeItem = shownItems[activeItemIndex] ?? null;
  const moveActiveItem = (step: 1 | -1) => {
    const lastIndex = shownItems.length - 1;
    const nextIndex =
      activeItemIndex === -1
        ? step === 1
          ? 0
          : lastIndex
        : Math.min(lastIndex, Math.max(0, activeItemIndex + step));
    setActiveItemGuid(shownItems[nextIndex]?.guid ?? null);
  };

  useEffect(() => {
    if (!activeItemGuid) return;
    document
      .querySelector(`[${HOTKEY_ITEM_ATTRIBUTE}="${activeItemGuid}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [activeItemGuid]);

  const hasShownItems = shownItems.length > 0;
  useHotkeys({
    itemNew: dialogs.openAddItem,
    itemsPrintLabels: hasShownItems
      ? () => labelPrinting.openPrintLabels(shownItems)
      : undefined,
    itemNext: hasShownItems ? () => moveActiveItem(1) : undefined,
    itemPrevious: hasShownItems ? () => moveActiveItem(-1) : undefined,
    itemAdjust: hasSelection
      ? () => bulkDialogs.openBulkAdjustStock(selectedItems)
      : activeItem
        ? () => dialogs.openAdjustStock(activeItem)
        : undefined,
    itemAddStock: hasSelection
      ? () => bulkDialogs.openBulkAdjustStock(selectedItems, "add")
      : activeItem
        ? () => dialogs.openAdjustStock(activeItem, "add")
        : undefined,
    itemRemoveStock: hasSelection
      ? () => bulkDialogs.openBulkAdjustStock(selectedItems, "remove")
      : activeItem
        ? () => dialogs.openAdjustStock(activeItem, "remove")
        : undefined,
    itemEdit: activeItem ? () => dialogs.openEditItem(activeItem) : undefined,
    itemPrintLabel: hasSelection
      ? () => labelPrinting.openPrintLabels(selectedItems)
      : activeItem
        ? () => labelPrinting.openPrintLabels([activeItem])
        : undefined,
    itemBuyMore:
      activeItem && purchaseUrlOf(activeItem)
        ? () => openPurchaseLink(activeItem)
        : undefined,
    itemDelete: hasSelection
      ? () => bulkDialogs.openBulkDelete(selectedItems)
      : activeItem
        ? () => dialogs.openDeleteItem(activeItem)
        : undefined,
    itemToggleSelected: activeItem
      ? () => selection.toggleItem(activeItem)
      : undefined,
    itemsSelectAll: hasShownItems ? selection.selectAllShown : undefined,
    itemsEditTags: hasSelection
      ? () => bulkDialogs.openBulkTags(selectedItems)
      : activeItem
        ? () => bulkDialogs.openBulkTags([activeItem])
        : undefined,
    clearSelection: hasSelection
      ? selection.clearSelection
      : activeItem
        ? () => setActiveItemGuid(null)
        : undefined,
  });

  const ItemList = isCompactLayout ? MobileItemList : ItemsTable;
  const addItemButton = (
    <Button onClick={dialogs.openAddItem}>
      <IconPlus />
      {t("items.add")}
      <HotkeyHint id="itemNew" className="touch:hidden" />
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <PageHeader
          title={t("items.title")}
          description={t("items.description")}
          actions={
            <>
              {shownItems.length > 0 && (
                <Button
                  variant="outline"
                  size={isPhoneLayout ? "icon" : "default"}
                  aria-label={
                    isPhoneLayout ? t("labels.print.open") : undefined
                  }
                  onClick={() => labelPrinting.openPrintLabels(shownItems)}
                >
                  <IconPrinter />
                  {!isPhoneLayout && t("labels.print.open")}
                  {!isPhoneLayout && (
                    <HotkeyHint
                      id="itemsPrintLabels"
                      className="touch:hidden"
                    />
                  )}
                </Button>
              )}
              {addItemButton}
            </>
          }
        />
        <div className={PAGE_BODY_CLASS}>
          {isError ? (
            <LoadErrorCallout
              message={t("items.loadFailed")}
              onRetry={() => void refetch()}
            />
          ) : isPending ? (
            <ListSkeleton rows={8} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={IconPackages}
              title={t("items.empty.title")}
              description={t("items.empty.description")}
              action={addItemButton}
            />
          ) : (
            <>
              <ItemsToolbar
                filters={filters}
                tags={tags}
                onFiltersChange={changeFilters}
              />
              {hasSelection ? (
                <ItemSelectionBar
                  selectedCount={selectedItems.length}
                  onAdjustStock={() =>
                    bulkDialogs.openBulkAdjustStock(selectedItems)
                  }
                  onEditTags={() => bulkDialogs.openBulkTags(selectedItems)}
                  onPrintLabels={() =>
                    labelPrinting.openPrintLabels(selectedItems)
                  }
                  onDelete={() => bulkDialogs.openBulkDelete(selectedItems)}
                  onClear={selection.clearSelection}
                />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p role="status" className="text-xs text-foreground/70">
                    {hasActiveItemFilters(filters)
                      ? t("items.countFiltered", {
                          shown: shownItems.length,
                          total: items.length,
                        })
                      : t("items.count", { count: items.length })}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-foreground/70 touch:hidden">
                    <HotkeyHint id="itemPrevious" />
                    <HotkeyHint id="itemNext" />
                    {t("items.keyboardHint.pick")}
                    <HotkeyHint id="itemAdjust" />
                    {t("items.keyboardHint.adjust")}
                  </p>
                </div>
              )}
              {shownItems.length === 0 ? (
                <EmptyState
                  icon={IconSearchOff}
                  title={t("items.noMatches.title")}
                  description={t("items.noMatches.description")}
                  action={
                    <Button
                      variant="outline"
                      onClick={() => setSearchParams({}, { replace: true })}
                    >
                      {t("items.noMatches.clear")}
                    </Button>
                  }
                />
              ) : (
                <ItemList
                  items={shownItems}
                  activeItemGuid={activeItemGuid}
                  selectedItemGuids={selection.selectedItemGuids}
                  selectionState={selection.selectionState}
                  onToggleSelected={selection.toggleItem}
                  onToggleAllSelected={selection.toggleAllShown}
                  onAdjustStock={dialogs.openAdjustStock}
                  onEdit={dialogs.openEditItem}
                  onDelete={dialogs.openDeleteItem}
                  onPrintLabel={(item) => labelPrinting.openPrintLabels([item])}
                />
              )}
            </>
          )}
        </div>
      </div>
      <ItemFormDialog
        open={dialogs.isItemFormOpen}
        onOpenChange={dialogs.setIsItemFormOpen}
        item={dialogs.itemBeingEdited}
        tagSuggestions={tags}
        onSubmit={dialogs.submitItemForm}
      />
      <AdjustStockDialog
        item={dialogs.itemBeingAdjusted}
        initialDirection={dialogs.adjustDirection}
        onOpenChange={dialogs.closeAdjustStock}
        onSubmit={dialogs.submitStockAdjustment}
      />
      <BulkAdjustStockDialog
        items={bulkDialogs.itemsBeingAdjusted}
        initialDirection={bulkDialogs.bulkAdjustDirection}
        onOpenChange={bulkDialogs.closeBulkAdjustStock}
        onSubmit={bulkDialogs.submitBulkAdjustment}
      />
      <BulkTagsDialog
        items={bulkDialogs.itemsBeingTagged}
        tagSuggestions={tags}
        onOpenChange={bulkDialogs.closeBulkTags}
        onSubmit={bulkDialogs.submitBulkTags}
      />
      <ConfirmDialog
        open={!!bulkDialogs.itemsBeingDeleted}
        onOpenChange={bulkDialogs.closeBulkDelete}
        title={t("items.bulk.delete.title", {
          count: bulkDialogs.itemsBeingDeleted?.length ?? 0,
        })}
        description={t("items.bulk.delete.description")}
        confirmLabel={t("items.bulk.delete.confirm", {
          count: bulkDialogs.itemsBeingDeleted?.length ?? 0,
        })}
        cancelLabel={tCommon("cancel")}
        isPending={bulkDialogs.isDeleting}
        destructive
        onConfirm={() => void bulkDialogs.confirmBulkDelete()}
      />
      <PrintLabelsDialog
        items={labelPrinting.itemsToLabel}
        onOpenChange={labelPrinting.closePrintLabels}
        onPrint={labelPrinting.startPrinting}
      />
      {labelPrinting.printJob && (
        <LabelPrintSheet
          printJob={labelPrinting.printJob}
          onPrinted={labelPrinting.finishPrinting}
        />
      )}
      <ConfirmDialog
        open={!!dialogs.itemBeingDeleted}
        onOpenChange={dialogs.closeDeleteItem}
        title={t("items.delete.title", {
          name: dialogs.itemBeingDeleted?.name ?? "",
        })}
        description={t("items.delete.description")}
        confirmLabel={t("items.delete.confirm")}
        cancelLabel={tCommon("cancel")}
        isPending={dialogs.isDeleting}
        destructive
        onConfirm={() => void dialogs.confirmDeleteItem()}
      />
    </div>
  );
}
