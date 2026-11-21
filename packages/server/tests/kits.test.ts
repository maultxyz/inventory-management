import {
  buildCapacityOf,
  buildUnitRemovalFormSchema,
  moduleCountsOfBuildUnits,
  moduleCountsOfKits,
  partNeedsForModules,
  type InventoryItem,
} from "@inventory/shared";
import assert from "node:assert/strict";
import { test } from "node:test";

function partWith(
  name: string,
  quantity: number,
  moduleQuantities: Partial<
    Pick<
      InventoryItem,
      "feederModuleQuantity" | "deviceModuleQuantity" | "sortingModuleQuantity"
    >
  >,
) {
  return {
    guid: name,
    name,
    quantity,
    purchaseUrl: null,
    feederModuleQuantity: 0,
    deviceModuleQuantity: 0,
    sortingModuleQuantity: 0,
    ...moduleQuantities,
  };
}

const parts = [
  partWith("Positional servo", 20, { sortingModuleQuantity: 3 }),
  partWith("IR sensor", 9, {
    feederModuleQuantity: 1,
    sortingModuleQuantity: 1,
  }),
  partWith("Controller board", 3, { deviceModuleQuantity: 1 }),
  partWith("Feeder servo", 2, { feederModuleQuantity: 1 }),
  partWith("Shipping label", 500, {}),
];

test("a kit is one feeder, one device and three or five sorting modules", () => {
  assert.deepEqual(moduleCountsOfBuildUnits("threeModuleKit", 2), {
    feederModules: 2,
    deviceModules: 2,
    sortingModules: 6,
  });
  assert.deepEqual(
    moduleCountsOfKits({ threeModuleKits: 1, fiveModuleKits: 2 }),
    { feederModules: 3, deviceModules: 3, sortingModules: 13 },
  );
});

test("capacity is set by the scarcest part and names every limiting part", () => {
  assert.deepEqual(buildCapacityOf(parts, "threeModuleKit"), {
    buildUnit: "threeModuleKit",
    hasAssignedParts: true,
    buildableCount: 2,
    limitingItemNames: ["Feeder servo", "IR sensor", "Positional servo"],
  });
  const fiveModuleKits = buildCapacityOf(parts, "fiveModuleKit");
  assert.equal(fiveModuleKits.buildableCount, 1);
  assert.deepEqual(fiveModuleKits.limitingItemNames, [
    "IR sensor",
    "Positional servo",
  ]);
  assert.equal(buildCapacityOf(parts, "sortingModule").buildableCount, 6);
  assert.equal(buildCapacityOf(parts, "deviceModule").buildableCount, 3);
});

test("capacity reports when no part is assigned to the build unit", () => {
  const capacity = buildCapacityOf(
    [partWith("Shipping label", 500, {})],
    "feederModule",
  );
  assert.equal(capacity.hasAssignedParts, false);
  assert.equal(capacity.buildableCount, 0);
});

test("a kit plan lists needed, in stock and missing, most missing first", () => {
  const partNeeds = partNeedsForModules(
    parts,
    moduleCountsOfKits({ threeModuleKits: 1, fiveModuleKits: 1 }),
  );
  assert.deepEqual(
    partNeeds.map((partNeed) => [
      partNeed.itemName,
      partNeed.quantityNeeded,
      partNeed.quantityInStock,
      partNeed.quantityMissing,
    ]),
    [
      ["Positional servo", 24, 20, 4],
      ["IR sensor", 10, 9, 1],
      ["Controller board", 2, 3, 0],
      ["Feeder servo", 2, 2, 0],
    ],
  );
});

test("removing single modules only needs that module's parts", () => {
  const partNeeds = partNeedsForModules(
    parts,
    moduleCountsOfBuildUnits("feederModule", 2),
  );
  assert.deepEqual(
    partNeeds.map((partNeed) => [partNeed.itemName, partNeed.quantityNeeded]),
    [
      ["Feeder servo", 2],
      ["IR sensor", 2],
    ],
  );
});

test("a removal needs a known build unit and a whole count of at least one", () => {
  const validRemoval = { buildUnit: "sortingModule", count: 2 };
  assert.equal(buildUnitRemovalFormSchema.safeParse(validRemoval).success, true);
  assert.equal(
    buildUnitRemovalFormSchema.safeParse({ ...validRemoval, count: 0 }).success,
    false,
  );
  assert.equal(
    buildUnitRemovalFormSchema.safeParse({ ...validRemoval, buildUnit: "kit" })
      .success,
    false,
  );
});
