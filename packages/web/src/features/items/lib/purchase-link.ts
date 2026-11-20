import { isHttpUrl, type InventoryItem } from "@inventory/shared";

export function purchaseUrlOf(
  item: Pick<InventoryItem, "purchaseUrl">,
): string | null {
  return item.purchaseUrl && isHttpUrl(item.purchaseUrl)
    ? item.purchaseUrl
    : null;
}

export function openPurchaseLink(item: Pick<InventoryItem, "purchaseUrl">) {
  const purchaseUrl = purchaseUrlOf(item);
  if (purchaseUrl) window.open(purchaseUrl, "_blank", "noopener,noreferrer");
}
