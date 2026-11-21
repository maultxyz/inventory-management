import type {
  InventoryItem,
  StockStatus,
} from "./interfaces/inventory.interface";

type LotPricing = Pick<InventoryItem, "lotPriceCents" | "unitsPerLot">;

export function stockStatusOf(
  item: Pick<InventoryItem, "quantity" | "reorderLevel">,
): StockStatus {
  if (item.quantity <= 0) return "outOfStock";
  if (item.quantity <= item.reorderLevel) return "lowStock";
  return "inStock";
}

export function priceToCents(price: string): number {
  return price === "" ? 0 : Math.round(Number(price) * 100);
}

export function centsToPrice(priceCents: number): string {
  return priceCents === 0 ? "" : (priceCents / 100).toFixed(2);
}

export function unitCostCentsOf(item: LotPricing): number {
  return item.unitsPerLot > 0 ? item.lotPriceCents / item.unitsPerLot : 0;
}

export function stockValueCentsOf(
  item: LotPricing & Pick<InventoryItem, "quantity">,
): number {
  return item.unitsPerLot > 0
    ? Math.round((item.quantity * item.lotPriceCents) / item.unitsPerLot)
    : 0;
}

export function totalStockValueCentsOf(
  items: ReadonlyArray<LotPricing & Pick<InventoryItem, "quantity">>,
): number {
  return items.reduce((total, item) => total + stockValueCentsOf(item), 0);
}

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
