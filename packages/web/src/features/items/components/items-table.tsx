import { TagList } from "@/components/tag-list";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemRowActions } from "@/features/items/components/item-row-actions";
import { StockStatusBadge } from "@/features/items/components/stock-status-badge";
import { HOTKEY_ITEM_ATTRIBUTE } from "@/lib/constants/hotkeys";
import {
  formatCurrencyFromCents,
  formatQuantity,
  formatUnitCostFromCents,
} from "@/lib/format";
import type { ItemListProps } from "@/lib/interfaces/inventory";
import { stockValueCentsOf, unitCostCentsOf } from "@inventory/shared";
import { useTranslation } from "react-i18next";

export function ItemsTable({
  items,
  activeItemGuid,
  selectedItemGuids,
  selectionState,
  onToggleSelected,
  onToggleAllSelected,
  ...actionHandlers
}: ItemListProps) {
  const { t } = useTranslation("inventory");
  const noValue = (
    <span className="text-foreground/70">
      <span aria-hidden>-</span>
      <span className="sr-only">{t("items.noValue")}</span>
    </span>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-8">
            <Checkbox
              aria-label={t("items.bulk.selectAll")}
              checked={selectionState === "all"}
              indeterminate={selectionState === "some"}
              onCheckedChange={onToggleAllSelected}
            />
          </TableHead>
          <TableHead>{t("items.columns.name")}</TableHead>
          <TableHead>{t("items.columns.location")}</TableHead>
          <TableHead>{t("items.columns.tags")}</TableHead>
          <TableHead>{t("items.columns.status")}</TableHead>
          <TableHead className="text-right">
            {t("items.columns.quantity")}
          </TableHead>
          <TableHead className="text-right">
            {t("items.columns.unitCost")}
          </TableHead>
          <TableHead className="text-right">
            {t("items.columns.value")}
          </TableHead>
          <TableHead className="text-right">
            <span className="sr-only">{t("items.columns.actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.guid}
            data-state={item.guid === activeItemGuid ? "selected" : undefined}
            aria-current={item.guid === activeItemGuid ? "true" : undefined}
            {...{ [HOTKEY_ITEM_ATTRIBUTE]: item.guid }}
          >
            <TableCell className="w-8">
              <Checkbox
                aria-label={t("items.bulk.select", { name: item.name })}
                checked={selectedItemGuids.has(item.guid)}
                onCheckedChange={() => onToggleSelected(item)}
              />
            </TableCell>
            <TableCell className="max-w-80 truncate font-medium text-foreground">
              {item.name}
            </TableCell>
            <TableCell className="max-w-48 truncate">
              {item.location ?? noValue}
            </TableCell>
            <TableCell className="max-w-56 whitespace-normal">
              {item.tags.length > 0 ? (
                <TagList
                  tags={item.tags}
                  label={t("items.tagsOf", { name: item.name })}
                />
              ) : (
                noValue
              )}
            </TableCell>
            <TableCell>
              <StockStatusBadge item={item} />
            </TableCell>
            <TableCell className="text-right font-medium text-foreground">
              {formatQuantity(item.quantity)}
            </TableCell>
            <TableCell className="text-right">
              {item.lotPriceCents > 0
                ? formatUnitCostFromCents(unitCostCentsOf(item))
                : noValue}
            </TableCell>
            <TableCell className="text-right">
              {item.lotPriceCents > 0
                ? formatCurrencyFromCents(stockValueCentsOf(item))
                : noValue}
            </TableCell>
            <TableCell>
              <ItemRowActions item={item} {...actionHandlers} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
