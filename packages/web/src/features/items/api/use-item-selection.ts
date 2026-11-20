import type { ItemSelectionState } from "@/lib/interfaces/inventory";
import type { InventoryItem } from "@inventory/shared";
import { useCallback, useMemo, useState } from "react";

export function useItemSelection(shownItems: InventoryItem[]) {
  const [selectedItemGuids, setSelectedItemGuids] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const selectedItems = useMemo(
    () => shownItems.filter((item) => selectedItemGuids.has(item.guid)),
    [shownItems, selectedItemGuids],
  );
  const selectionState: ItemSelectionState =
    selectedItems.length === 0
      ? "none"
      : selectedItems.length === shownItems.length
        ? "all"
        : "some";

  const toggleItem = useCallback((item: InventoryItem) => {
    setSelectedItemGuids((current) => {
      const next = new Set(current);
      if (!next.delete(item.guid)) next.add(item.guid);
      return next;
    });
  }, []);
  const clearSelection = useCallback(
    () => setSelectedItemGuids(new Set()),
    [],
  );
  const selectAllShown = () =>
    setSelectedItemGuids(new Set(shownItems.map((item) => item.guid)));

  return {
    selectedItems,
    selectedItemGuids,
    selectionState,
    toggleItem,
    clearSelection,
    selectAllShown,
    toggleAllShown: () =>
      selectionState === "all" ? clearSelection() : selectAllShown(),
  };
}
