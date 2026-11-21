import type {
  BuildCapacity,
  BuildUnit,
  InventoryItem,
  KitCounts,
  ModuleCounts,
  PartNeed,
} from "./interfaces/inventory.interface";

type KitPart = Pick<
  InventoryItem,
  | "guid"
  | "name"
  | "quantity"
  | "purchaseUrl"
  | "feederModuleQuantity"
  | "deviceModuleQuantity"
  | "sortingModuleQuantity"
>;

export const MODULE_COUNTS_BY_BUILD_UNIT: Record<BuildUnit, ModuleCounts> = {
  threeModuleKit: { feederModules: 1, deviceModules: 1, sortingModules: 3 },
  fiveModuleKit: { feederModules: 1, deviceModules: 1, sortingModules: 5 },
  feederModule: { feederModules: 1, deviceModules: 0, sortingModules: 0 },
  deviceModule: { feederModules: 0, deviceModules: 1, sortingModules: 0 },
  sortingModule: { feederModules: 0, deviceModules: 0, sortingModules: 1 },
};

export function moduleCountsOfBuildUnits(
  buildUnit: BuildUnit,
  count: number,
): ModuleCounts {
  const perUnit = MODULE_COUNTS_BY_BUILD_UNIT[buildUnit];
  return {
    feederModules: perUnit.feederModules * count,
    deviceModules: perUnit.deviceModules * count,
    sortingModules: perUnit.sortingModules * count,
  };
}

export function moduleCountsOfKits(kitCounts: KitCounts): ModuleCounts {
  const threeModuleKits = moduleCountsOfBuildUnits(
    "threeModuleKit",
    kitCounts.threeModuleKits,
  );
  const fiveModuleKits = moduleCountsOfBuildUnits(
    "fiveModuleKit",
    kitCounts.fiveModuleKits,
  );
  return {
    feederModules: threeModuleKits.feederModules + fiveModuleKits.feederModules,
    deviceModules: threeModuleKits.deviceModules + fiveModuleKits.deviceModules,
    sortingModules:
      threeModuleKits.sortingModules + fiveModuleKits.sortingModules,
  };
}

export function quantityNeededForModules(
  part: KitPart,
  moduleCounts: ModuleCounts,
): number {
  return (
    part.feederModuleQuantity * moduleCounts.feederModules +
    part.deviceModuleQuantity * moduleCounts.deviceModules +
    part.sortingModuleQuantity * moduleCounts.sortingModules
  );
}

export function isKitPart(part: KitPart): boolean {
  return (
    part.feederModuleQuantity > 0 ||
    part.deviceModuleQuantity > 0 ||
    part.sortingModuleQuantity > 0
  );
}

export function partNeedsForModules(
  parts: KitPart[],
  moduleCounts: ModuleCounts,
): PartNeed[] {
  return parts
    .map((part) => {
      const quantityNeeded = quantityNeededForModules(part, moduleCounts);
      return {
        itemGuid: part.guid,
        itemName: part.name,
        purchaseUrl: part.purchaseUrl,
        quantityNeeded,
        quantityInStock: part.quantity,
        quantityMissing: Math.max(0, quantityNeeded - part.quantity),
      };
    })
    .filter((partNeed) => partNeed.quantityNeeded > 0)
    .sort(
      (a, b) =>
        b.quantityMissing - a.quantityMissing ||
        a.itemName.localeCompare(b.itemName),
    );
}

export function buildCapacityOf(
  parts: KitPart[],
  buildUnit: BuildUnit,
): BuildCapacity {
  const perUnit = MODULE_COUNTS_BY_BUILD_UNIT[buildUnit];
  let buildableCount = Infinity;
  let limitingItemNames: string[] = [];
  for (const part of parts) {
    const quantityPerUnit = quantityNeededForModules(part, perUnit);
    if (quantityPerUnit === 0) continue;
    const buildableFromPart = Math.floor(part.quantity / quantityPerUnit);
    if (buildableFromPart < buildableCount) {
      buildableCount = buildableFromPart;
      limitingItemNames = [part.name];
    } else if (buildableFromPart === buildableCount) {
      limitingItemNames.push(part.name);
    }
  }
  const hasAssignedParts = buildableCount !== Infinity;
  return {
    buildUnit,
    hasAssignedParts,
    buildableCount: hasAssignedParts ? buildableCount : 0,
    limitingItemNames: hasAssignedParts ? limitingItemNames.sort() : [],
  };
}
