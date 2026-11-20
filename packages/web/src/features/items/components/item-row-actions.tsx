import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { purchaseUrlOf } from "@/features/items/lib/purchase-link";
import type { ItemRowActionsProps } from "@/lib/interfaces/inventory";
import {
  IconDots,
  IconPencil,
  IconPlusMinus,
  IconPrinter,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function ItemRowActions({
  item,
  onAdjustStock,
  onEdit,
  onDelete,
  onPrintLabel,
}: ItemRowActionsProps) {
  const { t } = useTranslation("inventory");
  const purchaseUrl = purchaseUrlOf(item);
  return (
    <div className="flex items-center justify-end gap-1.5">
      {purchaseUrl && (
        <a
          href={purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("items.actions.buyMoreOf", { name: item.name })}
          title={t("items.actions.buyMore")}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <IconShoppingCart aria-hidden />
        </a>
      )}
      <Button
        variant="outline"
        aria-label={t("items.actions.adjustStockFor", { name: item.name })}
        onClick={() => onAdjustStock(item)}
      >
        <IconPlusMinus />
        {t("items.actions.adjustStock")}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("items.actions.more", { name: item.name })}
            >
              <IconDots />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <IconPencil />
            {t("items.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPrintLabel(item)}>
            <IconPrinter />
            {t("items.actions.printLabel")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(item)}
          >
            <IconTrash />
            {t("items.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
