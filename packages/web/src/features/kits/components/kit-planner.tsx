import { Callout } from "@/components/callout";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { WholeNumberInput } from "@/components/whole-number-input";
import { PartNeedsTable } from "@/features/kits/components/part-needs-table";
import { kitCountFieldId } from "@/features/kits/lib/kit-count-field";
import {
  readStoredKitCounts,
  storeKitCounts,
} from "@/features/kits/lib/kit-counts-storage";
import { KIT_COUNT_FIELDS } from "@/lib/constants/kits";
import type { KitPlannerProps } from "@/lib/interfaces/inventory";
import { kitPlanFormSchema } from "@/schemas/kit-plan.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  moduleCountsOfKits,
  partNeedsForModules,
  type KitCounts,
} from "@inventory/shared";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function KitPlanner({ items }: KitPlannerProps) {
  const { t } = useTranslation("inventory");
  const [storedKitCounts] = useState(readStoredKitCounts);
  const form = useForm<KitCounts>({
    resolver: zodResolver(kitPlanFormSchema),
    defaultValues: storedKitCounts,
    mode: "onChange",
  });
  const watchedKitCounts = useWatch({ control: form.control });
  const kitCounts = useMemo(() => {
    const parsed = kitPlanFormSchema.safeParse(watchedKitCounts);
    return parsed.success ? parsed.data : null;
  }, [watchedKitCounts]);

  useEffect(() => {
    if (kitCounts) storeKitCounts(kitCounts);
  }, [kitCounts]);

  const partNeeds = useMemo(
    () =>
      kitCounts ? partNeedsForModules(items, moduleCountsOfKits(kitCounts)) : [],
    [items, kitCounts],
  );
  const missingPartCount = partNeeds.filter(
    (partNeed) => partNeed.quantityMissing > 0,
  ).length;
  const plannedKitLabels = kitCounts
    ? [
        kitCounts.threeModuleKits > 0 &&
          t("kits.unitCount.threeModuleKit", {
            count: kitCounts.threeModuleKits,
          }),
        kitCounts.fiveModuleKits > 0 &&
          t("kits.unitCount.fiveModuleKit", {
            count: kitCounts.fiveModuleKits,
          }),
      ].filter((label): label is string => !!label)
    : [];
  const plannedKits =
    plannedKitLabels.length === 2
      ? t("kits.planner.kitsJoin", {
          first: plannedKitLabels[0],
          second: plannedKitLabels[1],
        })
      : plannedKitLabels[0];

  return (
    <div className="flex flex-col gap-3 md:gap-2">
      <form
        className="grid grid-cols-2 gap-3 sm:max-w-md md:gap-2"
        onSubmit={(event) => event.preventDefault()}
      >
        {KIT_COUNT_FIELDS.map((kitCountField) => (
          <Controller
            key={kitCountField}
            name={kitCountField}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={kitCountFieldId(kitCountField)}>
                  {t(`kits.planner.${kitCountField}`)}
                </FieldLabel>
                <WholeNumberInput
                  id={kitCountFieldId(kitCountField)}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") event.currentTarget.blur();
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </form>
      <div role="status" className="flex flex-col gap-3 md:gap-2">
        {!plannedKits ? (
          <p className="text-xs text-foreground/70">
            {t("kits.planner.empty")}
          </p>
        ) : missingPartCount > 0 ? (
          <Callout variant="warning" icon={IconAlertTriangle}>
            {t("kits.planner.missing", {
              count: missingPartCount,
              kits: plannedKits,
            })}
          </Callout>
        ) : (
          <Callout variant="success" icon={IconCircleCheck}>
            {t("kits.planner.enough", { kits: plannedKits })}
          </Callout>
        )}
      </div>
      {plannedKits && (
        <PartNeedsTable
          partNeeds={partNeeds}
          caption={t("kits.planner.tableCaption")}
          showPurchaseLinks
        />
      )}
    </div>
  );
}
