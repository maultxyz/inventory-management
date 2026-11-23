import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/list-skeleton";
import { LoadErrorCallout } from "@/components/load-error-callout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useChecklistPrinting } from "@/features/checklists/api/use-checklist-printing";
import { ChecklistPrintSheet } from "@/features/checklists/components/checklist-print-sheet";
import { ModuleChecklistCard } from "@/features/checklists/components/module-checklist-card";
import { useItems } from "@/features/items/api/use-items";
import { useHotkeys } from "@/hooks/use-hotkeys";
import {
  CHECKLIST_COPIES_PER_SHEET,
  CHECKLIST_PRINT_HOTKEYS,
} from "@/lib/constants/checklists";
import { ITEMS_PATH, PAGE_BODY_CLASS } from "@/lib/constants/nav";
import type { HotkeyHandlers } from "@/lib/interfaces/hotkeys";
import type { ModuleChecklist } from "@/lib/interfaces/checklists";
import { isKitPart, MODULE_TYPES, moduleChecklistOf } from "@inventory/shared";
import { IconTool } from "@tabler/icons-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function ChecklistsPage() {
  const { t } = useTranslation("inventory");
  const items = useItems();
  const { printJob, printChecklist, finishPrinting } = useChecklistPrinting();
  const checklists = useMemo<ModuleChecklist[]>(
    () =>
      MODULE_TYPES.map((moduleType) => ({
        moduleType,
        entries: moduleChecklistOf(items.items, moduleType),
      })),
    [items.items],
  );
  const hasKitParts = items.items.some(isKitPart);

  useHotkeys(
    Object.fromEntries(
      checklists
        .filter((checklist) => checklist.entries.length > 0)
        .map((checklist) => [
          CHECKLIST_PRINT_HOTKEYS[checklist.moduleType],
          () => printChecklist(checklist),
        ]),
    ) as HotkeyHandlers,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <PageHeader
          title={t("checklists.title")}
          description={t("checklists.description", {
            count: CHECKLIST_COPIES_PER_SHEET,
          })}
        />
        <div className={PAGE_BODY_CLASS}>
          {items.isError ? (
            <LoadErrorCallout
              message={t("checklists.loadFailed")}
              onRetry={() => void items.refetch()}
            />
          ) : items.isPending ? (
            <ListSkeleton rows={6} />
          ) : !hasKitParts ? (
            <EmptyState
              icon={IconTool}
              title={t("kits.setup.title")}
              description={t("kits.setup.description")}
              action={
                <Button nativeButton={false} render={<Link to={ITEMS_PATH} />}>
                  {t("kits.setup.action")}
                </Button>
              }
            />
          ) : (
            <div className="grid items-start gap-2 md:gap-1.5 lg:grid-cols-2">
              {checklists.map((checklist) => (
                <ModuleChecklistCard
                  key={checklist.moduleType}
                  checklist={checklist}
                  onPrint={printChecklist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {printJob && (
        <ChecklistPrintSheet printJob={printJob} onPrinted={finishPrinting} />
      )}
    </div>
  );
}
