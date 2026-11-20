import {
  adjustStockFormSchema,
  bulkAdjustStockSchema,
  bulkTagItemsSchema,
  centsToPrice,
  createItemFormSchema,
  hasTag,
  normalizeTags,
  stockStatusOf,
  priceToCents,
  stockValueCentsOf,
  tagsAfterBulkEdit,
  tagsOfItems,
  unitCostCentsOf,
} from "@inventory/shared";
import assert from "node:assert/strict";
import { test } from "node:test";

const validItemForm = {
  name: "Widget",
  location: "",
  quantity: 5,
  reorderLevel: 1,
  lotPrice: "2.50",
  unitsPerLot: 1,
  feederModuleQuantity: 0,
  deviceModuleQuantity: 0,
  sortingModuleQuantity: 0,
  purchaseUrl: "",
  tags: [] as string[],
  notes: "",
};

test("stock status follows quantity against the reorder level", () => {
  assert.equal(stockStatusOf({ quantity: 0, reorderLevel: 0 }), "outOfStock");
  assert.equal(stockStatusOf({ quantity: 2, reorderLevel: 2 }), "lowStock");
  assert.equal(stockStatusOf({ quantity: 3, reorderLevel: 2 }), "inStock");
  assert.equal(stockStatusOf({ quantity: 1, reorderLevel: 0 }), "inStock");
});

test("prices convert between text and cents without float drift", () => {
  assert.equal(priceToCents("19.99"), 1999);
  assert.equal(priceToCents("0.07"), 7);
  assert.equal(priceToCents(""), 0);
  assert.equal(centsToPrice(1999), "19.99");
  assert.equal(centsToPrice(0), "");
});

test("unit cost and stock value come from the lot price and units per lot", () => {
  const bagOfScrews = { lotPriceCents: 899, unitsPerLot: 1000 };
  assert.equal(unitCostCentsOf(bagOfScrews), 0.899);
  assert.equal(stockValueCentsOf({ ...bagOfScrews, quantity: 2500 }), 2248);
  assert.equal(unitCostCentsOf({ lotPriceCents: 1200, unitsPerLot: 1 }), 1200);
  assert.equal(
    stockValueCentsOf({ lotPriceCents: 0, unitsPerLot: 10, quantity: 40 }),
    0,
  );
});

test("item form accepts a valid item and trims the name", () => {
  const parsed = createItemFormSchema.parse({
    ...validItemForm,
    name: "  Widget  ",
  });
  assert.equal(parsed.name, "Widget");
});

test("item form rejects a blank name, fractional quantity and bad cost", () => {
  assert.equal(
    createItemFormSchema.safeParse({ ...validItemForm, name: "   " }).success,
    false,
  );
  assert.equal(
    createItemFormSchema.safeParse({ ...validItemForm, quantity: 1.5 }).success,
    false,
  );
  assert.equal(
    createItemFormSchema.safeParse({ ...validItemForm, quantity: -1 }).success,
    false,
  );
  assert.equal(
    createItemFormSchema.safeParse({ ...validItemForm, lotPrice: "2.505" })
      .success,
    false,
  );
});

test("units per lot must be a whole number of at least one", () => {
  const unitsPerLotIsAccepted = (unitsPerLot: number) =>
    createItemFormSchema.safeParse({ ...validItemForm, unitsPerLot }).success;
  assert.equal(unitsPerLotIsAccepted(100), true);
  assert.equal(unitsPerLotIsAccepted(0), false);
  assert.equal(unitsPerLotIsAccepted(2.5), false);
});

test("stock adjustment rejects a zero change and unknown reasons", () => {
  const validAdjustment = { quantityChange: -3, reason: "sold", note: "" };
  assert.equal(adjustStockFormSchema.safeParse(validAdjustment).success, true);
  assert.equal(
    adjustStockFormSchema.safeParse({ ...validAdjustment, quantityChange: 0 })
      .success,
    false,
  );
  assert.equal(
    adjustStockFormSchema.safeParse({ ...validAdjustment, reason: "created" })
      .success,
    false,
  );
});

test("purchase link is optional but must be an http or https address", () => {
  const purchaseUrlIsAccepted = (purchaseUrl: string) =>
    createItemFormSchema.safeParse({ ...validItemForm, purchaseUrl }).success;
  assert.equal(purchaseUrlIsAccepted(""), true);
  assert.equal(purchaseUrlIsAccepted("  https://shop.example.com/p/123  "), true);
  assert.equal(purchaseUrlIsAccepted("http://localhost:8080/part"), true);
  assert.equal(purchaseUrlIsAccepted("shop.example.com/p/123"), false);
  assert.equal(purchaseUrlIsAccepted("javascript:alert(1)"), false);
  assert.equal(purchaseUrlIsAccepted("ftp://example.com/file"), false);
});

test("tags are trimmed and de-duplicated without regard to case", () => {
  assert.deepEqual(
    normalizeTags(["  Amazon ", "amazon", "", "Digi  Key", "AliExpress"]),
    ["Amazon", "Digi Key", "AliExpress"],
  );
  const parsed = createItemFormSchema.parse({
    ...validItemForm,
    tags: ["Amazon", " AMAZON", "Local shop"],
  });
  assert.deepEqual(parsed.tags, ["Amazon", "Local shop"]);
});

test("an item takes a limited number of tags of limited length", () => {
  const tagsAreAccepted = (tags: string[]) =>
    createItemFormSchema.safeParse({ ...validItemForm, tags }).success;
  assert.equal(tagsAreAccepted(Array.from({ length: 10 }, (_, i) => `Shop ${i}`)), true);
  assert.equal(tagsAreAccepted(Array.from({ length: 11 }, (_, i) => `Shop ${i}`)), false);
  assert.equal(tagsAreAccepted(["x".repeat(31)]), false);
});

test("tags across items are listed once, sorted, and matched ignoring case", () => {
  const items = [{ tags: ["DigiKey", "Amazon"] }, { tags: ["amazon"] }, { tags: [] }];
  assert.deepEqual(tagsOfItems(items), ["Amazon", "DigiKey"]);
  assert.equal(hasTag(items[1], "AMAZON"), true);
  assert.equal(hasTag(items[2], "Amazon"), false);
});

test("bulk tag edits add without duplicates and remove ignoring case", () => {
  assert.deepEqual(tagsAfterBulkEdit(["Amazon"], "add", ["amazon", "DigiKey"]), [
    "Amazon",
    "DigiKey",
  ]);
  assert.deepEqual(
    tagsAfterBulkEdit(["Amazon", "DigiKey", "Local shop"], "remove", ["AMAZON", "local shop"]),
    ["DigiKey"],
  );
  assert.deepEqual(tagsAfterBulkEdit([], "remove", ["Amazon"]), []);
});

test("bulk requests need item ids, and a tag change needs at least one tag", () => {
  const itemGuids = ["57c29217-5e41-4065-8c36-67524fb8bcba"];
  assert.equal(
    bulkTagItemsSchema.safeParse({ itemGuids, mode: "add", tags: ["Amazon"] }).success,
    true,
  );
  assert.equal(
    bulkTagItemsSchema.safeParse({ itemGuids, mode: "add", tags: ["  "] }).success,
    false,
  );
  assert.equal(
    bulkTagItemsSchema.safeParse({ itemGuids: [], mode: "add", tags: ["Amazon"] }).success,
    false,
  );
  assert.equal(
    bulkAdjustStockSchema.safeParse({ itemGuids: ["not-a-guid"], quantityChange: 1, reason: "received", note: "" }).success,
    false,
  );
});
