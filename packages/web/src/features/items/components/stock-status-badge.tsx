import { Badge } from "@/components/ui/badge";
import { STOCK_STATUS_BADGE_VARIANT } from "@/lib/constants/inventory";
import type { StockStatusBadgeProps } from "@/lib/interfaces/inventory";
import { stockStatusOf } from "@inventory/shared";
import { useTranslation } from "react-i18next";

export function StockStatusBadge({ item }: StockStatusBadgeProps) {
  const { t } = useTranslation("inventory");
  const status = stockStatusOf(item);
  return (
    <Badge variant={STOCK_STATUS_BADGE_VARIANT[status]}>
      {t(`status.${status}`)}
    </Badge>
  );
}
