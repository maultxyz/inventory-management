import { TagList } from "@/components/tag-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { StockStatusBadge } from "@/features/items/components/stock-status-badge";
import { purchaseUrlOf } from "@/features/items/lib/purchase-link";
import { formatQuantity } from "@/lib/format";
import type { RestockListProps } from "@/lib/interfaces/inventory";
import { IconPlus, IconShoppingCart } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function RestockList({ items, onAdjustStock }: RestockListProps) {
  const { t } = useTranslation("inventory");
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li
          key={item.guid}
          className="flex items-center justify-between gap-3 py-2"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {item.name}
              </span>
              <StockStatusBadge item={item} />
            </span>
            <span className="truncate text-xs text-foreground/70">
              {t("overview.restock.quantity", {
                quantity: formatQuantity(item.quantity),
                reorderLevel: formatQuantity(item.reorderLevel),
              })}
            </span>
            <TagList
              tags={item.tags}
              label={t("items.tagsOf", { name: item.name })}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {purchaseUrlOf(item) && (
              <a
                href={purchaseUrlOf(item) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("items.actions.buyMoreOf", { name: item.name })}
                className={buttonVariants({ variant: "ghost" })}
              >
                <IconShoppingCart aria-hidden />
                {t("items.actions.buyMore")}
              </a>
            )}
            <Button
              variant="outline"
              className="shrink-0"
              aria-label={t("overview.restock.addStockTo", { name: item.name })}
              onClick={() => onAdjustStock(item)}
            >
              <IconPlus />
              {t("overview.restock.addStock")}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
