import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WholeNumberInput } from "@/components/whole-number-input";
import { itemFormValuesOf } from "@/features/items/lib/item-form";
import {
  INVENTORY_CURRENCY,
  MODULE_QUANTITY_FIELDS,
} from "@/lib/constants/inventory";
import { formatUnitCostFromCents } from "@/lib/format";
import type { ItemFormDialogProps } from "@/lib/interfaces/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PRICE_PATTERN,
  createItemFormSchema,
  priceToCents,
  unitCostCentsOf,
  type CreateItemFormValues,
} from "@inventory/shared";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  tagSuggestions,
  onSubmit,
}: ItemFormDialogProps) {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemFormSchema),
    defaultValues: itemFormValuesOf(item),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset(itemFormValuesOf(item));
  }, [open, item, form]);

  const lotPrice = useWatch({ control: form.control, name: "lotPrice" });
  const unitsPerLot = useWatch({ control: form.control, name: "unitsPerLot" });
  const derivedUnitCostCents =
    PRICE_PATTERN.test(lotPrice.trim()) &&
    Number.isInteger(unitsPerLot) &&
    unitsPerLot >= 1
      ? unitCostCentsOf({
          lotPriceCents: priceToCents(lotPrice.trim()),
          unitsPerLot,
        })
      : null;

  const handleSubmit = async (values: CreateItemFormValues) => {
    if (await onSubmit(values)) onOpenChange(false);
  };

  const optionalLabel = (
    <span className="font-normal text-foreground/70">
      ({t("items.form.optional")})
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? t("items.form.editTitle") : t("items.form.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form
          id="item-form"
          className="flex flex-col gap-3 md:gap-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="item-name">
                  {t("items.form.name")}
                </FieldLabel>
                <Input
                  {...field}
                  id="item-name"
                  placeholder={t("items.form.namePlaceholder")}
                  aria-invalid={fieldState.invalid}
                  autoFocus
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="grid grid-cols-2 gap-3 md:gap-2">
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="item-location">
                    {t("items.form.location")} {optionalLabel}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="item-location"
                    placeholder={t("items.form.locationPlaceholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {!item && (
              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="item-quantity">
                      {t("items.form.quantity")}
                    </FieldLabel>
                    <WholeNumberInput
                      id="item-quantity"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
            <Controller
              name="reorderLevel"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="item-reorder-level">
                    {t("items.form.reorderLevel")}
                  </FieldLabel>
                  <WholeNumberInput
                    id="item-reorder-level"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <FieldDescription>
            {t("items.form.reorderLevelDescription")}
          </FieldDescription>
          <div className="grid grid-cols-2 gap-3 md:gap-2">
            <Controller
              name="lotPrice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="item-lot-price">
                    {t("items.form.lotPrice", {
                      currency: INVENTORY_CURRENCY,
                    })}{" "}
                    {optionalLabel}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="item-lot-price"
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="unitsPerLot"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="item-units-per-lot">
                    {t("items.form.unitsPerLot")}
                  </FieldLabel>
                  <WholeNumberInput
                    id="item-units-per-lot"
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
          </div>
          <FieldDescription role="status">
            {derivedUnitCostCents === null
              ? t("items.form.unitCostDescription")
              : t("items.form.unitCostDerived", {
                  unitCost: formatUnitCostFromCents(derivedUnitCostCents),
                })}
          </FieldDescription>
          <Controller
            name="purchaseUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="item-purchase-url">
                  {t("items.form.purchaseUrl")} {optionalLabel}
                </FieldLabel>
                <Input
                  {...field}
                  id="item-purchase-url"
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t("items.form.purchaseUrlPlaceholder")}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="item-tags">
                  {t("items.form.tags")} {optionalLabel}
                </FieldLabel>
                <TagInput
                  id="item-tags"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  suggestions={tagSuggestions}
                  placeholder={t("items.form.tagsPlaceholder")}
                  invalid={fieldState.invalid}
                />
                <FieldDescription>
                  {t("items.form.tagsDescription")}
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-xs/relaxed font-medium">
              {t("items.form.moduleUsage")}
            </legend>
            <div className="grid grid-cols-3 gap-3 md:gap-2">
              {MODULE_QUANTITY_FIELDS.map((moduleQuantityField) => (
                <Controller
                  key={moduleQuantityField}
                  name={moduleQuantityField}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor={`item-${moduleQuantityField}`}>
                        {t(`items.form.${moduleQuantityField}`)}
                      </FieldLabel>
                      <WholeNumberInput
                        id={`item-${moduleQuantityField}`}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}
            </div>
            <FieldDescription>
              {t("items.form.moduleUsageDescription")}
            </FieldDescription>
          </fieldset>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="item-notes">
                  {t("items.form.notes")} {optionalLabel}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="item-notes"
                  rows={2}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="item-form"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <IconLoader2 className="animate-spin" />
            )}
            {item ? t("items.form.submitEdit") : t("items.form.submitAdd")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
