import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatQuantity } from "@/lib/format";
import type { PartNeedsTableProps } from "@/lib/interfaces/inventory";
import { useTranslation } from "react-i18next";

export function PartNeedsTable({ partNeeds, caption }: PartNeedsTableProps) {
  const { t } = useTranslation("inventory");
  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{t("kits.parts.part")}</TableHead>
          <TableHead className="text-right">{t("kits.parts.needed")}</TableHead>
          <TableHead className="text-right">
            {t("kits.parts.inStock")}
          </TableHead>
          <TableHead className="text-right">
            {t("kits.parts.missing")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partNeeds.map((partNeed) => (
          <TableRow key={partNeed.itemGuid}>
            <TableCell className="max-w-64 truncate font-medium text-foreground">
              {partNeed.itemName}
            </TableCell>
            <TableCell className="text-right">
              {formatQuantity(partNeed.quantityNeeded)}
            </TableCell>
            <TableCell className="text-right">
              {formatQuantity(partNeed.quantityInStock)}
            </TableCell>
            <TableCell className="text-right">
              {partNeed.quantityMissing > 0 ? (
                <Badge variant="destructive">
                  {t("kits.parts.short", {
                    quantity: formatQuantity(partNeed.quantityMissing),
                  })}
                </Badge>
              ) : (
                <Badge variant="success">{t("kits.parts.enough")}</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
