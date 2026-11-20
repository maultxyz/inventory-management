import { Callout } from "@/components/callout";
import { HotkeyHint } from "@/components/hotkey-hint";
import { LoadErrorCallout } from "@/components/load-error-callout";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { useItemDialogs } from "@/features/items/api/use-item-dialogs";
import { useItems } from "@/features/items/api/use-items";
import { AdjustStockDialog } from "@/features/items/components/adjust-stock-dialog";
import { StockStatusBadge } from "@/features/items/components/stock-status-badge";
import { purchaseUrlOf } from "@/features/items/lib/purchase-link";
import { itemGuidFromScannedText } from "@/features/labels/lib/item-qr";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useQrScanner } from "@/features/scanner/api/use-qr-scanner";
import { QrScannerView } from "@/features/scanner/components/qr-scanner-view";
import {
  SCAN_ITEM_PARAM,
  SCAN_REPEAT_COOLDOWN_MS,
} from "@/lib/constants/labels";
import { PAGE_BODY_CLASS } from "@/lib/constants/nav";
import { formatQuantity } from "@/lib/format";
import type { ScanFeedback } from "@/lib/interfaces/labels";
import {
  IconAlertTriangle,
  IconPlusMinus,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function ScanPage() {
  const { t } = useTranslation("inventory");
  const { items, isPending, isError, refetch } = useItems();
  const {
    itemBeingAdjusted,
    adjustDirection,
    openAdjustStock,
    closeAdjustStock,
    submitStockAdjustment,
  } = useItemDialogs();
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<ScanFeedback>({ kind: "idle" });
  const [lastScannedItemGuid, setLastScannedItemGuid] = useState<string | null>(
    null,
  );
  const lastScanRef = useRef({ scannedText: "", seenAt: 0 });
  const isPaused = !!itemBeingAdjusted || isPending || isError;
  const lastScannedItem =
    items.find((item) => item.guid === lastScannedItemGuid) ?? null;

  const openScannedItem = useCallback(
    (scannedText: string) => {
      const itemGuid = itemGuidFromScannedText(scannedText);
      if (!itemGuid) {
        setFeedback({ kind: "notItemLabel" });
        return;
      }
      const scannedItem = items.find((item) => item.guid === itemGuid);
      if (!scannedItem) {
        setFeedback({ kind: "unknownItem" });
        return;
      }
      setFeedback({ kind: "idle" });
      setLastScannedItemGuid(scannedItem.guid);
      openAdjustStock(scannedItem);
    },
    [items, openAdjustStock],
  );

  const handleScan = (scannedText: string) => {
    const now = Date.now();
    const isRepeat =
      scannedText === lastScanRef.current.scannedText &&
      now - lastScanRef.current.seenAt < SCAN_REPEAT_COOLDOWN_MS;
    lastScanRef.current = { scannedText, seenAt: now };
    if (!isRepeat) openScannedItem(scannedText);
  };

  const { videoRef, status } = useQrScanner({ isPaused, onScan: handleScan });

  useHotkeys({
    scanAdjustLast: lastScannedItem
      ? () => openAdjustStock(lastScannedItem)
      : undefined,
  });

  const scannedItemGuidParam = searchParams.get(SCAN_ITEM_PARAM);
  useEffect(() => {
    if (!scannedItemGuidParam || isPending || isError) return;
    openScannedItem(scannedItemGuidParam);
    setSearchParams({}, { replace: true });
  }, [
    scannedItemGuidParam,
    isPending,
    isError,
    openScannedItem,
    setSearchParams,
  ]);

  const handleAdjustDialogOpenChange = (open: boolean) => {
    if (!open) lastScanRef.current.seenAt = Date.now();
    closeAdjustStock(open);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <PageHeader
          title={t("scan.title")}
          description={t("scan.description")}
        />
        <div className={PAGE_BODY_CLASS}>
          {isError && (
            <LoadErrorCallout
              message={t("items.loadFailed")}
              onRetry={() => void refetch()}
            />
          )}
          <div className="grid gap-4 md:gap-2 lg:grid-cols-[3fr_2fr]">
            <QrScannerView
              videoRef={videoRef}
              status={status}
              isPaused={isPaused}
            />
            <div className="flex min-w-0 flex-col gap-4 md:gap-2">
              <div role="status" className="empty:hidden">
                {feedback.kind !== "idle" && (
                  <Callout variant="warning" icon={IconAlertTriangle}>
                    {t(`scan.feedback.${feedback.kind}`)}
                  </Callout>
                )}
              </div>
              <section className="flex flex-col gap-2 rounded-card border bg-card p-4 md:p-2.5">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  {t("scan.lastScanned.heading")}
                </h2>
                {lastScannedItem ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {lastScannedItem.name}
                        </span>
                        <span className="text-xs text-foreground/70">
                          {t("items.quantityValue", {
                            quantity: formatQuantity(lastScannedItem.quantity),
                          })}
                        </span>
                      </div>
                      <StockStatusBadge item={lastScannedItem} />
                    </div>
                    {purchaseUrlOf(lastScannedItem) && (
                      <a
                        href={purchaseUrlOf(lastScannedItem) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        <IconShoppingCart aria-hidden />
                        {t("items.actions.buyMore")}
                      </a>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => openAdjustStock(lastScannedItem)}
                    >
                      <IconPlusMinus />
                      {t("items.actions.adjustStock")}
                      <HotkeyHint id="scanAdjustLast" className="max-md:hidden" />
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-foreground/70">
                    {t("scan.lastScanned.empty")}
                  </p>
                )}
              </section>
              <section className="flex flex-col gap-2 rounded-card border bg-card p-4 md:p-2.5">
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  {t("scan.howTo.heading")}
                </h2>
                <ol className="ml-4 flex list-decimal flex-col gap-1 text-xs text-foreground/70">
                  <li>{t("scan.howTo.print")}</li>
                  <li>{t("scan.howTo.point")}</li>
                  <li>{t("scan.howTo.adjust")}</li>
                </ol>
              </section>
            </div>
          </div>
        </div>
      </div>
      <AdjustStockDialog
        item={itemBeingAdjusted}
        initialDirection={adjustDirection}
        onOpenChange={handleAdjustDialogOpenChange}
        onSubmit={submitStockAdjustment}
      />
    </div>
  );
}
