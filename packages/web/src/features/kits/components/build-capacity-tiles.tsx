import { StatTile } from "@/components/stat-tile";
import { LIMITING_ITEM_NAMES_SHOWN } from "@/lib/constants/kits";
import { formatQuantity } from "@/lib/format";
import type { BuildCapacityTilesProps } from "@/lib/interfaces/inventory";
import {
  BUILD_UNITS,
  buildCapacityOf,
  type BuildCapacity,
} from "@inventory/shared";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function BuildCapacityTiles({ items }: BuildCapacityTilesProps) {
  const { t } = useTranslation("inventory");
  const capacities = useMemo(
    () => BUILD_UNITS.map((buildUnit) => buildCapacityOf(items, buildUnit)),
    [items],
  );

  const captionOf = (capacity: BuildCapacity) => {
    if (!capacity.hasAssignedParts) return t("kits.capacity.noParts");
    const [name] = capacity.limitingItemNames;
    const otherCount =
      capacity.limitingItemNames.length - LIMITING_ITEM_NAMES_SHOWN;
    return otherCount > 0
      ? t("kits.capacity.limitedByMore", { name, count: otherCount })
      : t("kits.capacity.limitedBy", { name });
  };

  return (
    <dl className="grid grid-cols-2 gap-2 md:gap-1.5 lg:grid-cols-5">
      {capacities.map((capacity) => (
        <StatTile
          key={capacity.buildUnit}
          label={t(`kits.units.${capacity.buildUnit}`)}
          value={formatQuantity(capacity.buildableCount)}
          caption={captionOf(capacity)}
          tone={capacity.buildableCount > 0 ? "primary" : "warning"}
        />
      ))}
    </dl>
  );
}
