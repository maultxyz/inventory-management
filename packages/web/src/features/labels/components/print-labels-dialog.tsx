import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { WholeNumberInput } from "@/components/whole-number-input";
import { ItemLabel } from "@/features/labels/components/item-label";
import { labelSheetsOfPrintJob } from "@/features/labels/lib/item-qr";
import {
  DEFAULT_PRINT_LABELS_FORM,
  PRINT_LABELS_FIELDS,
} from "@/lib/constants/labels";
import type { PrintLabelsDialogProps } from "@/lib/interfaces/labels";
import {
  printLabelsFormSchema,
  type PrintLabelsFormValues,
} from "@/schemas/print-labels.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPrinter } from "@tabler/icons-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function PrintLabelsDialog({
  items,
  onOpenChange,
  onPrint,
}: PrintLabelsDialogProps) {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const form = useForm<PrintLabelsFormValues>({
    resolver: zodResolver(printLabelsFormSchema),
    defaultValues: DEFAULT_PRINT_LABELS_FORM,
    mode: "onChange",
  });
  const isOpen = !!items;

  useEffect(() => {
    if (isOpen) form.reset(form.getValues());
  }, [isOpen, form]);

  const watchedValues = useWatch({ control: form.control });
  const parsedValues = printLabelsFormSchema.safeParse(watchedValues);
  const labelCount =
    items && parsedValues.success
      ? items.length * parsedValues.data.copies
      : null;
  const sheetCount =
    items && parsedValues.success
      ? labelSheetsOfPrintJob({ items, ...parsedValues.data }).length
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("labels.print.title")}</DialogTitle>
          <DialogDescription>
            {items?.length === 1
              ? t("labels.print.descriptionOne", { name: items[0].name })
              : t("labels.print.descriptionMany", {
                  count: items?.length ?? 0,
                })}
          </DialogDescription>
        </DialogHeader>
        <form
          id="print-labels-form"
          className="grid grid-cols-2 gap-3 md:gap-2"
          onSubmit={form.handleSubmit(onPrint)}
        >
          {PRINT_LABELS_FIELDS.map((printLabelsField) => (
            <Controller
              key={printLabelsField}
              name={printLabelsField}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor={`print-labels-${printLabelsField}`}>
                    {t(`labels.print.${printLabelsField}`)}
                  </FieldLabel>
                  <WholeNumberInput
                    id={`print-labels-${printLabelsField}`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    min={printLabelsField === "copies" ? 1 : 0}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
        </form>
        <FieldDescription>
          {t("labels.print.labelsAlreadyUsedDescription")}
        </FieldDescription>
        {items && items.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs/relaxed font-medium">
              {t("labels.print.preview")}
            </p>
            <div className="flex justify-center overflow-x-auto rounded-lg bg-foreground/6 p-3">
              <div className="shrink-0 ring-1 ring-border">
                <ItemLabel item={items[0]} />
              </div>
            </div>
            <FieldDescription>{t("labels.print.sheetHint")}</FieldDescription>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="print-labels-form"
            disabled={labelCount === null}
          >
            <IconPrinter />
            {labelCount === null || sheetCount === null
              ? t("labels.print.submit")
              : t("labels.print.submitCount", {
                  count: labelCount,
                  sheets: t("labels.print.sheetCount", { count: sheetCount }),
                })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
