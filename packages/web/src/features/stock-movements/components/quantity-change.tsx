import { formatQuantity, formatSignedQuantity } from "@/lib/format";
import type { QuantityChangeProps } from "@/lib/interfaces/inventory";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function QuantityChange({ quantityChange }: QuantityChangeProps) {
  const { t } = useTranslation("inventory");
  const isAddition = quantityChange > 0;
  return (
    <span
      className={cn(
        "font-medium",
        isAddition ? "text-success-foreground" : "text-destructive",
      )}
    >
      <span aria-hidden>{formatSignedQuantity(quantityChange)}</span>
      <span className="sr-only">
        {t(isAddition ? "activity.added" : "activity.removed", {
          quantity: formatQuantity(Math.abs(quantityChange)),
        })}
      </span>
    </span>
  );
}
