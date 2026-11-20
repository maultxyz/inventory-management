import { HotkeyHint } from "@/components/hotkey-hint";
import { Button } from "@/components/ui/button";
import type { ItemSelectionBarProps } from "@/lib/interfaces/inventory";
import {
  IconPlusMinus,
  IconPrinter,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function ItemSelectionBar({
  selectedCount,
  onAdjustStock,
  onEditTags,
  onPrintLabels,
  onDelete,
  onClear,
}: ItemSelectionBarProps) {
  const { t } = useTranslation("inventory");
  return (
    <div
      role="region"
      aria-label={t("items.bulk.barLabel")}
      className="flex flex-wrap items-center gap-1.5"
    >
      <p role="status" className="mr-1 text-xs font-medium text-foreground">
        {t("items.bulk.selected", { count: selectedCount })}
      </p>
      <Button variant="outline" onClick={onAdjustStock}>
        <IconPlusMinus />
        {t("items.actions.adjustStock")}
        <HotkeyHint id="itemAdjust" className="touch:hidden" />
      </Button>
      <Button variant="outline" onClick={onEditTags}>
        <IconTag />
        {t("items.bulk.editTags")}
        <HotkeyHint id="itemsEditTags" className="touch:hidden" />
      </Button>
      <Button variant="outline" onClick={onPrintLabels}>
        <IconPrinter />
        {t("labels.print.open")}
        <HotkeyHint id="itemPrintLabel" className="touch:hidden" />
      </Button>
      <Button variant="destructive" onClick={onDelete}>
        <IconTrash />
        {t("items.actions.delete")}
        <HotkeyHint id="itemDelete" className="touch:hidden" />
      </Button>
      <Button variant="ghost" onClick={onClear}>
        {t("items.bulk.clear")}
        <HotkeyHint id="clearSelection" className="touch:hidden" />
      </Button>
    </div>
  );
}
