import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuantityChange } from "@/features/stock-movements/components/quantity-change";
import { formatDateTime, formatQuantity } from "@/lib/format";
import type { StockMovementListProps } from "@/lib/interfaces/inventory";
import { useTranslation } from "react-i18next";

export function StockMovementsTable({ movements }: StockMovementListProps) {
  const { t } = useTranslation("inventory");
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{t("activity.columns.when")}</TableHead>
          <TableHead>{t("activity.columns.item")}</TableHead>
          <TableHead className="text-right">
            {t("activity.columns.change")}
          </TableHead>
          <TableHead className="text-right">
            {t("activity.columns.quantityAfter")}
          </TableHead>
          <TableHead>{t("activity.columns.reason")}</TableHead>
          <TableHead>{t("activity.columns.note")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.guid}>
            <TableCell>
              <time dateTime={movement.createdAt}>
                {formatDateTime(movement.createdAt)}
              </time>
            </TableCell>
            <TableCell className="max-w-64 truncate font-medium text-foreground">
              {movement.itemName}
            </TableCell>
            <TableCell className="text-right">
              <QuantityChange quantityChange={movement.quantityChange} />
            </TableCell>
            <TableCell className="text-right">
              {formatQuantity(movement.quantityAfter)}
            </TableCell>
            <TableCell>{t(`reasons.${movement.reason}`)}</TableCell>
            <TableCell className="max-w-72 truncate">{movement.note}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
