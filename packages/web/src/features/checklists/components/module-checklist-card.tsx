import { HotkeyHint } from "@/components/hotkey-hint";
import { Button } from "@/components/ui/button";
import { CHECKLIST_PRINT_HOTKEYS } from "@/lib/constants/checklists";
import { formatQuantity } from "@/lib/format";
import type { ModuleChecklistCardProps } from "@/lib/interfaces/checklists";
import { IconPrinter } from "@tabler/icons-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

export function ModuleChecklistCard({
  checklist,
  onPrint,
}: ModuleChecklistCardProps) {
  const { t } = useTranslation("inventory");
  const headingId = useId();
  const { moduleType, entries } = checklist;
  const moduleName = t(`kits.unitNames.${moduleType}`);

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col rounded-card border bg-card"
    >
      <div className="flex items-center justify-between gap-2 border-b p-4 md:px-2.5 md:py-2 tablet:px-3.5 tablet:py-3">
        <div className="flex min-w-0 flex-col">
          <h2
            id={headingId}
            className="font-heading text-sm font-semibold text-foreground"
          >
            {moduleName}
          </h2>
          <p className="text-xs text-foreground/70">
            {t("checklists.partCount", { count: entries.length })}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={entries.length === 0}
          aria-label={t("checklists.printLabel", { module: moduleName })}
          onClick={() => onPrint(checklist)}
        >
          <IconPrinter />
          {t("checklists.print")}
          <HotkeyHint
            id={CHECKLIST_PRINT_HOTKEYS[moduleType]}
            className="touch:hidden"
          />
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="p-4 text-xs text-foreground/70 md:p-2.5 tablet:p-3.5">
          {t("checklists.noParts")}
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {entries.map((entry) => (
            <li
              key={entry.itemGuid}
              className="flex items-baseline gap-3 px-4 py-2 text-sm md:px-2.5 md:py-1.5 md:text-xs tablet:px-3.5 tablet:py-2 tablet:text-sm"
            >
              <span className="w-10 shrink-0 text-right font-mono tabular-nums">
                {t("checklists.quantity", {
                  quantity: formatQuantity(entry.quantityPerModule),
                })}
              </span>
              <span className="min-w-0 flex-1 break-words text-foreground">
                {entry.itemName}
              </span>
              {entry.location && (
                <span className="shrink-0 text-foreground/70">
                  {entry.location}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
