import {
  filterItems,
  hasActiveItemFilters,
  itemsNeedingRestock,
  readItemFilters,
  writeItemFilters,
} from "@/features/items/lib/item-filters";
import { DEFAULT_ITEM_FILTERS } from "@/lib/constants/inventory";
import type { InventoryItem } from "@inventory/shared";
import { describe, expect, it } from "vitest";

function itemWith(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    guid: overrides.name ?? "guid",
    name: "Widget",
    location: null,
    quantity: 10,
    reorderLevel: 2,
    lotPriceCents: 0,
    unitsPerLot: 1,
    feederModuleQuantity: 0,
    deviceModuleQuantity: 0,
    sortingModuleQuantity: 0,
    purchaseUrl: null,
    tags: [],
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const items = [
  itemWith({ name: "Packing tape", location: "Shelf B2", tags: ["Amazon"] }),
  itemWith({ name: "Box, medium", location: "Shelf A1", quantity: 2 }),
  itemWith({ name: "Label printer", quantity: 0, tags: ["DigiKey", "amazon"] }),
  itemWith({ name: "Bubble wrap" }),
];

describe("filterItems", () => {
  it("returns every item with the default filters", () => {
    expect(filterItems(items, DEFAULT_ITEM_FILTERS)).toHaveLength(4);
  });

  it("matches the search text against name and location, ignoring case", () => {
    const namesMatching = (searchText: string) =>
      filterItems(items, { ...DEFAULT_ITEM_FILTERS, searchText }).map(
        (item) => item.name,
      );
    expect(namesMatching("  BOX ")).toEqual(["Box, medium"]);
    expect(namesMatching("shelf b")).toEqual(["Packing tape"]);
  });

  it("filters by search text and stock status together", () => {
    const shown = filterItems(items, {
      ...DEFAULT_ITEM_FILTERS,
      searchText: "shelf",
      status: "lowStock",
    });
    expect(shown.map((item) => item.name)).toEqual(["Box, medium"]);
  });

  it("filters by tag ignoring case, and search matches tags too", () => {
    const namesWith = (filters: Partial<typeof DEFAULT_ITEM_FILTERS>) =>
      filterItems(items, { ...DEFAULT_ITEM_FILTERS, ...filters }).map(
        (item) => item.name,
      );
    expect(namesWith({ tag: "Amazon" })).toEqual([
      "Packing tape",
      "Label printer",
    ]);
    expect(namesWith({ tag: "DigiKey" })).toEqual(["Label printer"]);
    expect(namesWith({ searchText: "digi" })).toEqual(["Label printer"]);
  });

  it("treats low and out of stock as needing restock", () => {
    const shown = filterItems(items, {
      ...DEFAULT_ITEM_FILTERS,
      status: "needsRestock",
    });
    expect(shown.map((item) => item.name)).toEqual([
      "Box, medium",
      "Label printer",
    ]);
  });
});

describe("item filter helpers", () => {
  it("orders restock items by lowest quantity first", () => {
    expect(itemsNeedingRestock(items).map((item) => item.name)).toEqual([
      "Label printer",
      "Box, medium",
    ]);
  });

  it("round-trips filters through search params", () => {
    const filters = {
      searchText: "tape",
      tag: "Amazon",
      status: "outOfStock" as const,
    };
    expect(readItemFilters(writeItemFilters(filters))).toEqual(filters);
    expect(writeItemFilters(DEFAULT_ITEM_FILTERS).toString()).toBe("");
  });

  it("falls back to the default status for an unknown value", () => {
    const filters = readItemFilters(new URLSearchParams("status=bogus"));
    expect(filters.status).toBe("all");
    expect(hasActiveItemFilters(filters)).toBe(false);
  });
});
