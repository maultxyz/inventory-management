import {
  DEFAULT_ITEM_FILTERS,
  SEARCH_PARAM,
  STATUS_PARAM,
  STOCK_STATUS_FILTERS,
} from "@/lib/constants/inventory";
import type {
  ItemFilters,
  StockStatusFilter,
} from "@/lib/interfaces/inventory";
import { ALL_TAGS_FILTER, TAG_PARAM } from "@/lib/constants/tags";
import { hasTag, stockStatusOf, type InventoryItem } from "@inventory/shared";

function matchesStatus(item: InventoryItem, status: StockStatusFilter) {
  if (status === "all") return true;
  const itemStatus = stockStatusOf(item);
  if (status === "needsRestock") return itemStatus !== "inStock";
  return itemStatus === status;
}

export function filterItems(
  items: InventoryItem[],
  filters: ItemFilters,
): InventoryItem[] {
  const searchText = filters.searchText.trim().toLowerCase();
  return items.filter((item) => {
    if (
      searchText &&
      !item.name.toLowerCase().includes(searchText) &&
      !item.location?.toLowerCase().includes(searchText) &&
      !item.tags.some((tag) => tag.toLowerCase().includes(searchText))
    ) {
      return false;
    }
    if (filters.tag !== ALL_TAGS_FILTER && !hasTag(item, filters.tag)) {
      return false;
    }
    return matchesStatus(item, filters.status);
  });
}

export function itemsNeedingRestock(items: InventoryItem[]): InventoryItem[] {
  return items
    .filter((item) => stockStatusOf(item) !== "inStock")
    .sort((a, b) => a.quantity - b.quantity || a.name.localeCompare(b.name));
}

export function readItemFilters(searchParams: URLSearchParams): ItemFilters {
  const status = searchParams.get(STATUS_PARAM) as StockStatusFilter | null;
  return {
    searchText: searchParams.get(SEARCH_PARAM) ?? "",
    tag: searchParams.get(TAG_PARAM) ?? ALL_TAGS_FILTER,
    status:
      status && STOCK_STATUS_FILTERS.includes(status)
        ? status
        : DEFAULT_ITEM_FILTERS.status,
  };
}

export function writeItemFilters(filters: ItemFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (filters.searchText) searchParams.set(SEARCH_PARAM, filters.searchText);
  if (filters.tag !== ALL_TAGS_FILTER) searchParams.set(TAG_PARAM, filters.tag);
  if (filters.status !== DEFAULT_ITEM_FILTERS.status) {
    searchParams.set(STATUS_PARAM, filters.status);
  }
  return searchParams;
}

export function hasActiveItemFilters(filters: ItemFilters): boolean {
  return (
    filters.searchText.trim() !== "" ||
    filters.tag !== ALL_TAGS_FILTER ||
    filters.status !== DEFAULT_ITEM_FILTERS.status
  );
}

export function itemsPathFilteredBy(
  itemsPath: string,
  status: StockStatusFilter,
): string {
  return `${itemsPath}?${new URLSearchParams({ [STATUS_PARAM]: status })}`;
}
