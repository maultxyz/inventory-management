import { QuantityChange } from "@/features/stock-movements/components/quantity-change";
import { formatDateTime, formatQuantity } from "@/lib/format";
import type { StockMovementListProps } from "@/lib/interfaces/inventory";
import { useTranslation } from "react-i18next";

export function StockMovementList({ movements }: StockMovementListProps) {
  const { t } = useTranslation("inventory");
  return (
    <ul className="flex flex-col divide-y divide-border">
      {movements.map((movement) => (
        <li
          key={movement.guid}
          className="flex items-center justify-between gap-3 py-2"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {movement.itemName}
            </span>
            <span className="truncate text-xs text-foreground/70">
              {t(`reasons.${movement.reason}`)}
              {movement.note ? ` · ${movement.note}` : ""}
              {" · "}
              <time dateTime={movement.createdAt}>
                {formatDateTime(movement.createdAt)}
              </time>
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-sm">
              <QuantityChange quantityChange={movement.quantityChange} />
            </span>
            <span className="text-xs text-foreground/70">
              {t("activity.quantityAfterValue", {
                quantity: formatQuantity(movement.quantityAfter),
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
