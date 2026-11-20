import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { purchaseUrlOf } from "@/features/items/lib/purchase-link";
import type { ItemRowActionsProps } from "@/lib/interfaces/inventory";
import { cn } from "@/lib/utils";
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
  layout = "row",
  onAdjustStock,
  onEdit,
  onDelete,
  onPrintLabel,
}: ItemRowActionsProps) {
  const { t } = useTranslation("inventory");
  const purchaseUrl = purchaseUrlOf(item);
  const isCard = layout === "card";
  const secondaryVariant = isCard ? "outline" : "ghost";
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1.5",
        isCard && "w-full",
      )}
    >
      {purchaseUrl && (
        <a
          href={purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("items.actions.buyMoreOf", { name: item.name })}
          title={t("items.actions.buyMore")}
          className={cn(
            buttonVariants({ variant: secondaryVariant, size: "icon" }),
            isCard && "order-1",
          )}
        >
          <IconShoppingCart aria-hidden />
        </a>
      )}
      <Button
        variant={isCard ? "default" : "outline"}
        className={cn(isCard && "flex-1")}
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
              variant={secondaryVariant}
              size="icon"
              className={cn(isCard && "order-2")}
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
