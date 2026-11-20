import { Callout } from "@/components/callout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WholeNumberInput } from "@/components/whole-number-input";
import { PartNeedsTable } from "@/features/kits/components/part-needs-table";
import { EMPTY_BUILD_UNIT_REMOVAL_FORM } from "@/lib/constants/inventory";
import type { RemoveBuildUnitsDialogProps } from "@/lib/interfaces/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BUILD_UNITS,
  buildUnitRemovalFormSchema,
  moduleCountsOfBuildUnits,
  partNeedsForModules,
  type BuildUnit,
  type BuildUnitRemovalFormValues,
} from "@inventory/shared";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function RemoveBuildUnitsDialog({
  open,
  onOpenChange,
  items,
  onSubmit,
}: RemoveBuildUnitsDialogProps) {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const form = useForm<BuildUnitRemovalFormValues>({
    resolver: zodResolver(buildUnitRemovalFormSchema),
    defaultValues: EMPTY_BUILD_UNIT_REMOVAL_FORM,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset(EMPTY_BUILD_UNIT_REMOVAL_FORM);
  }, [open, form]);

  const buildUnit = useWatch({ control: form.control, name: "buildUnit" });
  const count = useWatch({ control: form.control, name: "count" });
  const partNeeds = useMemo(
    () =>
      Number.isInteger(count) && count > 0
        ? partNeedsForModules(items, moduleCountsOfBuildUnits(buildUnit, count))
        : [],
    [items, buildUnit, count],
  );
  const hasMissingParts = partNeeds.some(
    (partNeed) => partNeed.quantityMissing > 0,
  );
  const buildUnitOptions = BUILD_UNITS.map((option) => ({
    value: option,
    label: t(`kits.unitNames.${option}`),
  }));

  const handleSubmit = async (values: BuildUnitRemovalFormValues) => {
    if (await onSubmit(values)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("kits.remove.title")}</DialogTitle>
          <DialogDescription>{t("kits.remove.description")}</DialogDescription>
        </DialogHeader>
        <form
          id="remove-build-units-form"
          className="grid grid-cols-2 gap-3 md:gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Controller
            name="buildUnit"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="remove-build-unit">
                  {t("kits.remove.buildUnit")}
                </FieldLabel>
                <Select
                  items={buildUnitOptions}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as BuildUnit)}
                >
                  <SelectTrigger id="remove-build-unit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buildUnitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="count"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="remove-build-unit-count">
                  {t("kits.remove.count")}
                </FieldLabel>
                <WholeNumberInput
                  id="remove-build-unit-count"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={1}
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
        <div role="status" className="flex flex-col gap-3 md:gap-2">
          {form.formState.isValid && partNeeds.length === 0 && (
            <Callout variant="warning" icon={IconAlertTriangle}>
              {t("kits.remove.noParts")}
            </Callout>
          )}
          {hasMissingParts && (
            <Callout variant="warning" icon={IconAlertTriangle}>
              {t("kits.remove.notEnough")}
            </Callout>
          )}
        </div>
        {partNeeds.length > 0 && (
          <PartNeedsTable
            partNeeds={partNeeds}
            caption={t("kits.remove.tableCaption")}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="remove-build-units-form"
            variant="destructive"
            disabled={
              !form.formState.isValid ||
              form.formState.isSubmitting ||
              partNeeds.length === 0 ||
              hasMissingParts
            }
          >
            {form.formState.isSubmitting && (
              <IconLoader2 className="animate-spin" />
            )}
            {t("kits.remove.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
