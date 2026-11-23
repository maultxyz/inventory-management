import { EMPTY_ITEM_FORM } from "@/lib/constants/inventory";
import {
  centsToPrice,
  type CreateItemFormValues,
  type InventoryItem,
} from "@inventory/shared";

export function itemFormValuesOf(
  item: InventoryItem | null,
): CreateItemFormValues {
  if (!item) return EMPTY_ITEM_FORM;
  return {
    name: item.name,
    location: item.location ?? "",
    quantity: item.quantity,
    reorderLevel: item.reorderLevel,
    lotPrice: centsToPrice(item.lotPriceCents),
    unitsPerLot: item.unitsPerLot,
    feederModuleQuantity: item.feederModuleQuantity,
    deviceModuleQuantity: item.deviceModuleQuantity,
    sortingModuleQuantity: item.sortingModuleQuantity,
    fiveModuleDeviceExtraQuantity: item.fiveModuleDeviceExtraQuantity,
    purchaseUrl: item.purchaseUrl ?? "",
    tags: item.tags,
    notes: item.notes ?? "",
  };
}
