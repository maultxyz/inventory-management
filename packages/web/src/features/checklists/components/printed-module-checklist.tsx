import {
  CHECKLIST_CUT_LINE_STYLE,
  CHECKLIST_FONT_SIZE_PT,
  CHECKLIST_SHEET,
  CHECKLIST_SINGLE_COLUMN_MAX_ENTRIES,
  CHECKLIST_TWO_COLUMN_FONT_SIZE_PT,
} from "@/lib/constants/checklists";
import { formatQuantity } from "@/lib/format";
import type { PrintedModuleChecklistProps } from "@/lib/interfaces/checklists";
import { useTranslation } from "react-i18next";

export function PrintedModuleChecklist({
  checklist,
  cutLineSides,
}: PrintedModuleChecklistProps) {
  const { t } = useTranslation("inventory");
  const usesTwoColumns =
    checklist.entries.length > CHECKLIST_SINGLE_COLUMN_MAX_ENTRIES;
  const fontSizePt = usesTwoColumns
    ? CHECKLIST_TWO_COLUMN_FONT_SIZE_PT
    : CHECKLIST_FONT_SIZE_PT;

  return (
    <div
      className="flex flex-col overflow-hidden bg-white text-black"
      style={{
        padding: `${CHECKLIST_SHEET.checklistPaddingIn}in`,
        gap: "0.6em",
        fontSize: `${fontSizePt}pt`,
        lineHeight: 1.2,
        borderRight: cutLineSides.right ? CHECKLIST_CUT_LINE_STYLE : undefined,
        borderBottom: cutLineSides.bottom
          ? CHECKLIST_CUT_LINE_STYLE
          : undefined,
      }}
    >
      <div className="font-bold" style={{ fontSize: "1.35em" }}>
        {t(`kits.unitNames.${checklist.moduleType}`)}
      </div>
      <ul style={{ columns: usesTwoColumns ? 2 : 1, columnGap: "1.5em" }}>
        {checklist.entries.map((entry) => (
          <li
            key={entry.itemGuid}
            className="flex break-inside-avoid items-start"
            style={{ gap: "0.5em", paddingBottom: "0.35em" }}
          >
            <span
              aria-hidden
              className="shrink-0"
              style={{
                width: "1em",
                height: "1em",
                marginTop: "0.1em",
                border: "1pt solid #000",
              }}
            />
            <span className="shrink-0 font-bold tabular-nums">
              {t("checklists.quantity", {
                quantity: formatQuantity(entry.quantityPerModule),
              })}
            </span>
            <span className="min-w-0 flex-1 break-words">
              {entry.itemName}
              {entry.location && (
                <span style={{ color: "#555" }}>
                  {t("checklists.printedLocation", {
                    location: entry.location,
                  })}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
