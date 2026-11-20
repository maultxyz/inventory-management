import { TagList } from "@/components/tag-list";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemRowActions } from "@/features/items/components/item-row-actions";
import { StockStatusBadge } from "@/features/items/components/stock-status-badge";
import { HOTKEY_ITEM_ATTRIBUTE } from "@/lib/constants/hotkeys";
import { formatQuantity } from "@/lib/format";
import type { ItemListProps } from "@/lib/interfaces/inventory";
import { useTranslation } from "react-i18next";

export function MobileItemList({
  items,
  activeItemGuid,
  selectedItemGuids,
  onToggleSelected,
  onAdjustStock,
  onEdit,
  onDelete,
  onPrintLabel,
}: ItemListProps) {
  const actionHandlers = { onAdjustStock, onEdit, onDelete, onPrintLabel };
  const { t } = useTranslation("inventory");
  return (
    <ul className="flex flex-col gap-2 md:gap-1.5 tablet:grid tablet:grid-cols-2 tablet:gap-2">
      {items.map((item) => (
        <li
          key={item.guid}
          data-state={item.guid === activeItemGuid ? "selected" : undefined}
          aria-current={item.guid === activeItemGuid ? "true" : undefined}
          {...{ [HOTKEY_ITEM_ATTRIBUTE]: item.guid }}
          className="flex flex-col gap-3 rounded-card border bg-card p-4 data-[state=selected]:bg-foreground/8 md:gap-2.5 md:p-2.5 tablet:gap-3 tablet:p-3.5"
        >
          <div className="flex items-start gap-3">
            <Checkbox
              className="mt-1"
              aria-label={t("items.bulk.select", { name: item.name })}
              checked={selectedItemGuids.has(item.guid)}
              onCheckedChange={() => onToggleSelected(item)}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-medium text-foreground">
                  {item.name}
                </span>
                {item.location && (
                  <span className="truncate text-xs text-foreground/70">
                    {item.location}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <StockStatusBadge item={item} />
                <TagList
                  tags={item.tags}
                  label={t("items.tagsOf", { name: item.name })}
                />
              </div>
            </div>
            <p className="flex shrink-0 flex-col items-end">
              <span className="text-2xs text-foreground/70">
                {t("items.columns.quantity")}
              </span>
              <span className="text-xl leading-tight font-semibold text-foreground">
                {formatQuantity(item.quantity)}
              </span>
            </p>
          </div>
          <ItemRowActions item={item} layout="card" {...actionHandlers} />
        </li>
      ))}
    </ul>
  );
}
